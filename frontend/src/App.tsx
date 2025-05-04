import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client'; // Assuming using React 18+
import { Switch, Route, useLocation, Router as WouterRouter, Link } from 'wouter'; // Import Router for basepath
import { QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip'; // Ensure path is correct
import { queryClient } from '@/lib/queryClient';           // Ensure path is correct
import { AuthProvider, useAuth } from '@/context/AuthContext'; // <<< Assuming you have an Auth Context

// --- Page Components (Ensure paths are correct) ---
import NotFound from '@/pages/not-found';
import Dashboard from '@/pages/Dashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import Login from '@/pages/Login';         // Might be handled by Django or React
import Register from '@/pages/Register';   // Might be handled by Django or React
import SampleSite from '@/pages/SampleSite'; // This likely needs data from Django API
import ClientPortal from '@/pages/ClientPortal';
import Subscribe from '@/pages/Subscribe';
import Checkout from '@/pages/Checkout';
// LandingPage, Templates, Pricing, Contact might be Django SSR pages now
// import LandingPage from '@/pages/LandingPage';
// import Templates from '@/pages/Templates';
// import Pricing from '@/pages/Pricing';
// import Contact from '@/pages/Contact';
import Account from '@/pages/Account';
// Blog routes might also be separate or integrated
// import Blog from '@/pages/Blog';
// import BlogPost from '@/pages/BlogPost';
import { Chatbot } from '@/components/common/Chatbot'; // Ensure path is correct
import { Toaster } from "@/components/ui/toaster"; // Assuming you use Shadcn toaster

// --- Protected Route Component ---
// This needs to check authentication status, likely via AuthContext
interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
  adminOnly?: boolean;
}

function ProtectedRoute({ component: Component, adminOnly = false, ...rest }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth(); // Get auth state from context
  const [, navigate] = useLocation(); // wouter's navigation hook

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login page if not authenticated
      // Decide if login is Django (/login/) or React (/app/login)
      console.log("ProtectedRoute: Not authenticated, redirecting to login...");
      navigate("/login", { replace: true }); // Redirect within React app base path
      // OR: window.location.href = '/login/'; // Redirect to Django login page
    } else if (!isLoading && adminOnly && user?.role !== 'admin') {
      // Redirect if admin required but user is not admin
      console.log("ProtectedRoute: Admin access required, redirecting to dashboard...");
      navigate("/", { replace: true }); // Redirect to non-admin dashboard within React app
      // OR: navigate("/unauthorized", { replace: true }); // Or specific unauthorized page
    }
  }, [isLoading, isAuthenticated, adminOnly, user, navigate]);

  if (isLoading) {
    // Optional: Show a loading indicator while auth status is being checked
    return <div>Loading Authentication...</div>;
  }

  // Render the component only if authenticated (and admin check passes if needed)
  return isAuthenticated && (!adminOnly || user?.role === 'admin') ? (
     // Pass route props if Component expects them (e.g., path parameters)
    <Route {...rest} component={Component} />
  ) : null; // Or render a fallback/redirect component if needed
}


// --- Main Router Logic ---
function AppRouter() {
  const [location] = useLocation();

  // Log current route for debugging (relative to base path)
  useEffect(() => {
    console.log("React Router Location (relative):", location);
  }, [location]);

  return (
    <Switch>
      {/* --- Public Routes within the /app base path --- */}
      {/* Note: Login/Register might be handled by Django outside this SPA */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      {/* Demo route - likely fetches data based on URL param */}
      <Route path="/demo/:sampleUrl" component={SampleSite} />

      {/* --- Protected User Routes --- */}
      <ProtectedRoute path="/" component={Dashboard} /> {/* Base path for logged-in user */}
      <ProtectedRoute path="/dashboard" component={Dashboard} /> {/* Explicit dashboard path */}
      <ProtectedRoute path="/portal" component={ClientPortal} />
      <ProtectedRoute path="/account" component={Account} />
      <ProtectedRoute path="/subscribe" component={Subscribe} />
      <ProtectedRoute path="/checkout" component={Checkout} />

      {/* --- Protected Admin Routes --- */}
      {/* Group admin routes under /admin maybe? */}
      <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} adminOnly />
      <ProtectedRoute path="/admin/leads" component={AdminDashboard} adminOnly /> {/* Point to correct Admin component */}
      <ProtectedRoute path="/admin/samples" component={AdminDashboard} adminOnly /> {/* Point to correct Admin component */}
      <ProtectedRoute path="/admin/subscriptions" component={AdminDashboard} adminOnly /> {/* Point to correct Admin component */}

      {/* Add other admin-specific routes */}
      {/* <ProtectedRoute path="/admin/users" component={AdminUserManagement} adminOnly /> */}


      {/* --- Fallback Route (within SPA) --- */}
      {/* This catches any path under /app/... that wasn't matched above */}
      <Route component={NotFound} />
    </Switch>
  );
}

// --- Main App Component ---
function App() {
  // IMPORTANT: Define the base path for wouter. This MUST match the path
  // prefix handled by Django's catch-all route for the React app.
  const base = "/app"; // Or "/something-else" if you changed it in Django's urls.py

  return (
    // Wrap with QueryClientProvider for react-query
    <QueryClientProvider client={queryClient}>
       {/* Wrap with AuthProvider to manage auth state */}
      <AuthProvider>
         {/* Wrap with TooltipProvider if using Shadcn tooltips */}
        <TooltipProvider>
           {/* Use WouterRouter and set the base path */}
          <WouterRouter base={base}>
             {/* Your Navigation/Layout Components can go here if needed */}
             {/* Example: <NavBar /> */}
             <main className="p-4"> {/* Example layout padding */}
                 <AppRouter /> {/* Render the routes */}
             </main>
             <Chatbot /> {/* Render chatbot */}
             <Toaster /> {/* Add Toaster for react-toast notifications */}
          </WouterRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}


// --- Render the App ---
// Assuming you have a root element with id 'root' in your index.html
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Failed to find the root element. Make sure your public/index.html has <div id=\"root\"></div>");
}

// --- Example Auth Context (Create this in e.g., src/context/AuthContext.tsx) ---
// This is a simplified example. You'll need to implement fetching user profile,
// handling login/logout API calls, etc.
import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import axios from 'axios'; // Or your apiRequest function

interface User { // Sync with your UserSerializer output
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  // Add other relevant user fields
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (/* loginData */) => Promise<void>; // Implement login logic
  logout: () => Promise<void>; // Implement logout logic
  checkAuthStatus: () => Promise<void>; // Function to check on load
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading initially

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
       // Use your apiRequest or axios configured with credentials
      const response = await axios.get<User>('/api/auth/profile/', { withCredentials: true });
      setUser(response.data);
      console.log("Auth Check: User authenticated.", response.data);
    } catch (error: any) {
       // Check if error is 401/403 (not authenticated)
      if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
           console.log("Auth Check: User not authenticated.");
           setUser(null);
      } else {
           console.error("Auth Check: Error fetching profile:", error);
           setUser(null); // Assume not logged in on other errors too
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth status on initial load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (/* loginData */) => {
     // TODO: Implement API call to /api/auth/login/
     // On success, call checkAuthStatus() to update user state
     console.log("Login function called - Implement API call");
     await checkAuthStatus(); // Re-check status after attempt
  };

  const logout = async () => {
     setIsLoading(true);
     try {
        // TODO: Implement API call to /api/auth/logout/ (POST request)
        await axios.post('/api/auth/logout/', {}, { withCredentials: true });
        setUser(null);
        queryClient.clear(); // Clear react-query cache on logout
        console.log("Logout successful");
        // Optionally navigate after logout
        // navigate('/app/login', { replace: true });
     } catch(error) {
         console.error("Logout failed:", error);
         // Handle logout errors if needed
     } finally {
         setIsLoading(false);
     }
  };

  // Use useMemo to prevent unnecessary re-renders of context consumers
  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user, // True if user object exists
    isLoading,
    login,
    logout,
    checkAuthStatus
  }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


// Default export for main.tsx or similar entry point
export default App; // Removed as rendering is now done here