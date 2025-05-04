

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
    useMemo,
    useCallback
} from 'react';
import { useLocation } from 'wouter';
import { queryClient } from '../lib/queryClient';

// --- Import generated API client and models ---
import {
    ApiApi,          // Generated API class
    Configuration,   // Configuration for the client
    User,            // Generated User type
    TokenObtainPair, // Type for response from /api/auth/token/
    TokenRefresh,    // Type for request/response for /api/auth/token/refresh/
    ResponseError,   // Error type thrown by generated client on non-2xx status
    FetchError       // Error type for network issues
    // LoginRequest type might not be needed if TokenObtainPair is used directly
} from '@/lib/api';

// --- Token Storage Helpers ---
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

const storeTokens = (access: string, refresh: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
};

const getAccessToken = (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
};

const getRefreshToken = (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
};

const clearTokens = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// --- Configure and Instantiate API Client ---
// Configure to automatically use the stored access token
const apiConfig = new Configuration({
    // basePath: '', // Ensure NO base path is set for Vite proxy
    accessToken: async () => { // Function to dynamically get the access token
        // In a more complex setup, you might check expiry and refresh here first
        return getAccessToken() || ''; // Return token or empty string
    },
    // credentials: 'include' // This might be set by --withCredentials=true generation flag already in runtime.ts fetch
});
const apiClient = new ApiApi(apiConfig);


// Re-export User type
export type { User };

// --- Define the Context Type ---
interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean; // Tracks initial load / ongoing auth operations
    login: (credentials: Omit<TokenObtainPair, 'access'|'refresh'>) => Promise<{ success: boolean; error?: string | object }>;
    logout: () => Promise<void>;
    checkAuthStatus: () => Promise<void>;
    isAdmin: boolean;
    backendLoginError: object | string | null;
    clearLoginErrors: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Start loading on initial mount
    const [backendLoginError, setBackendLoginError] = useState<object | string | null>(null);
    const [, navigate] = useLocation();

    // --- Check Auth Status ---
    // Tries to fetch profile using stored token, attempts refresh if needed (basic version)
    const checkAuthStatus = useCallback(async (isInitialLoad = false) => {
        if (!isInitialLoad) setIsLoading(true); // Only set loading true for manual checks/refresh
        const accessToken = getAccessToken();

        if (!accessToken) {
            console.log("Auth Check: No access token found.");
            setUser(null);
            setIsLoading(false);
            return;
        }

        // console.log("Auth Check: Attempting to fetch profile with stored token.");
        try {
            // apiClient will automatically use the accessToken from config
            const userData = await apiClient.apiAuthProfileRetrieve();
            setUser(userData);
            // console.log("Auth Check: Profile fetch successful.", userData);
        } catch (error: any) {
            console.warn("Auth Check: Profile fetch failed, likely token expired.", error.message);
            // Check if it's specifically an authentication error (401/403)
            const status = error.response?.status ?? error.status;
            if (status === 401 || status === 403) {
                // Attempt to refresh the token
                const refreshToken = getRefreshToken();
                if (refreshToken) {
                    // console.log("Auth Check: Attempting token refresh...");
                    try {
                        // Create a temporary client WITHOUT the expired accessToken for refresh
                        const refreshConfig = new Configuration({ basePath: apiConfig.basePath });
                        const refreshApiClient = new ApiApi(refreshConfig);

                        const refreshResponse: TokenRefresh = await refreshApiClient.apiAuthTokenRefreshCreate({
                            tokenRefresh: { refresh: refreshToken }
                        });

                        if (refreshResponse.access) {
                            // console.log("Auth Check: Token refresh successful.");
                            const newAccessToken = refreshResponse.access;
                            // Check if rotation gave a new refresh token (if enabled)
                            const newRefreshToken = (refreshResponse as any).refresh || refreshToken; // Adjust if refresh isn't standard in TokenRefresh type
                            storeTokens(newAccessToken, newRefreshToken);

                            // Retry fetching profile with the new token
                            // Need to create apiClient again or ensure config picks up new token
                            // For simplicity, call checkAuthStatus again (can cause loop if refresh always fails)
                            // A better approach involves request interceptors in a real app
                             console.log("Auth Check: Retrying profile fetch after refresh.");
                             // Re-fetch profile (will use new token via accessToken function)
                             try {
                                 const refreshedUserData = await apiClient.apiAuthProfileRetrieve();
                                 setUser(refreshedUserData);
                             } catch (retryError: any) {
                                 console.error("Auth Check: Profile fetch failed AFTER refresh:", retryError.message);
                                 clearTokens(); // Clear tokens if refresh worked but profile failed
                                 setUser(null);
                             }
                        } else {
                             console.log("Auth Check: Refresh endpoint didn't return new access token.");
                             clearTokens();
                             setUser(null);
                        }
                    } catch (refreshError: any) {
                        console.error("Auth Check: Token refresh failed:", refreshError.message);
                        clearTokens(); // Clear tokens if refresh fails
                        setUser(null);
                    }
                } else {
                    console.log("Auth Check: No refresh token available.");
                    clearTokens(); // Clear just in case
                    setUser(null);
                }
            } else {
                // Not a 401/403 error, maybe server issue
                console.error("Auth Check: Profile fetch failed with non-auth error:", error.message);
                setUser(null); // Assume not logged in for other errors too
            }
        } finally {
            setIsLoading(false);
        }
    }, []); // Add navigate dependency? Probably not needed here.

    useEffect(() => {
        checkAuthStatus(true); // Pass flag for initial load
    }, [checkAuthStatus]);

    // --- Login ---
    const login = async (credentials: Omit<TokenObtainPair, 'access'|'refresh'>): Promise<{ success: boolean; error?: string | object }> => {
        setIsLoading(true);
        setBackendLoginError(null);
        try {
             // Use generated function, passing the required request object structure
             // Note: Generated type might be TokenObtainPair which includes response fields
             // We pass only username/password, matching Django's serializer expectation
             const tokenResponse: TokenObtainPair = await apiClient.apiAuthTokenCreate({
                 tokenObtainPair: credentials // Pass username/password
             });

             if (tokenResponse.access && tokenResponse.refresh) {
                storeTokens(tokenResponse.access, tokenResponse.refresh);
                await checkAuthStatus(); // Fetch user profile after storing tokens
                // Check if checkAuthStatus actually set the user
                 if (user === null) {
                    // This ideally shouldn't happen if checkAuthStatus is awaited and works
                    // but could occur if profile fetch fails right after login
                    throw new Error("Login succeeded but failed to fetch profile.");
                }
                return { success: true };
             } else {
                 throw new Error("Login response did not contain tokens.");
             }

        } catch (error: any) {
             console.error("Login API call failed:", error);
             let errorBody: object | string = { error: "Login failed." };
              try {
                  // Attempt to parse error body (might be in error.response.json() or error.body)
                  const response = error.response as Response; // Type assertion if needed
                  if (response && typeof response.json === 'function') {
                      errorBody = await response.json();
                  } else if (typeof error.body === 'object' && error.body !== null) {
                      errorBody = error.body;
                  } else {
                      errorBody = { error: error.message || "An unknown login error occurred." };
                  }
              } catch (parseError) {
                    errorBody = { error: error.message || "An unknown login error occurred." };
              }
             clearTokens(); // Ensure tokens are cleared on login failure
             setUser(null); // Ensure user state is null
             setBackendLoginError(errorBody);
             return { success: false, error: errorBody };
        } finally {
            setIsLoading(false);
        }
    };

    // --- Logout ---
    const logout = async () => {
        setIsLoading(true);
        const refreshToken = getRefreshToken();

        // Optional: Blacklist the refresh token on the backend if implemented
        if (refreshToken && 'rest_framework_simplejwt.token_blacklist' in settings.INSTALLED_APPS) { // Pseudo-check
            try {
                 // Need a specific blacklist endpoint or use refresh client
                 const refreshConfig = new Configuration({ basePath: apiConfig.basePath });
                 const refreshApiClient = new ApiApi(refreshConfig);
                 // Simple JWT doesn't have a default blacklist *view*, common practice is to just delete frontend token
                 // If you created a custom blacklist endpoint:
                 // await refreshApiClient.apiAuthTokenBlacklistCreate({ tokenBlacklistRequest: { refresh: refreshToken } });
                 console.log("Simulating backend blacklist call (if endpoint existed).");
            } catch(blacklistError: any) {
                console.warn("Failed to blacklist refresh token:", blacklistError.message);
                // Proceed with local logout anyway
            }
        }

        // Always clear local state and tokens
        clearTokens();
        setUser(null);
        queryClient.clear(); // Clear react-query cache
        setIsLoading(false);
        console.log("Logout successful locally.");
        // Optional: Redirect after logout
        // navigate('/login', { replace: true });
    };

    const clearLoginErrors = useCallback(() => {
        setBackendLoginError(null);
    }, []);

    const value = useMemo(() => ({
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        logout,
        checkAuthStatus,
        backendLoginError,
        clearLoginErrors
    }), [user, isLoading, backendLoginError, checkAuthStatus, clearLoginErrors, login, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- Custom Hook ---
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};