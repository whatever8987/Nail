import { useQuery } from "@tanstack/react-query";
import { Redirect, Route, RouteComponentProps } from "wouter";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
  adminOnly?: boolean;
}

export function ProtectedRoute({ path, component: Component, adminOnly = false }: ProtectedRouteProps) {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/user/me"],
    retry: false,
  });

  return (
    <Route path={path}>
      {(params) => {
        // Show loading indicator while checking authentication
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        // Redirect to login if not authenticated
        if (!user) {
          return <Redirect to={`/login?redirect=${encodeURIComponent(path)}`} />;
        }

        // Redirect to dashboard if not an admin but trying to access admin routes
        if (adminOnly && user.role !== "admin") {
          return <Redirect to="/dashboard" />;
        }

        // Render the protected component
        return <Component {...params} />;
      }}
    </Route>
  );
}