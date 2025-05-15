import { useQuery } from "@tanstack/react-query";
import { Redirect, Route, RouteComponentProps } from "wouter";
import { Loader2 } from "lucide-react";
import { API } from "@/lib/api";

// Define basic user type based on your API response
type User = {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin'; // Adjust roles as needed
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  salon?: string;
};

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
  adminOnly?: boolean;
}

export function ProtectedRoute({ path, component: Component, adminOnly = false }: ProtectedRouteProps) {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      try {
        const response = await API.user.getProfile();
        return response.data as User; // Type assertion here
      } catch (err: any) {
        if (err.response?.status === 401) {
          return null;
        }
        throw err;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <Route path={path}>
      {(params) => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        if (error) {
          console.error("Error fetching user profile:", error);
          return <Redirect to="/error" />;
        }

        if (!user) {
          return <Redirect to={`/login?redirect=${encodeURIComponent(path)}`} />;
        }

        if (adminOnly && user.role !== "admin") {
          return <Redirect to="/dashboard" />;
        }

        return <Component {...params} />;
      }}
    </Route>
  );
}