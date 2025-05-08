import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { API, setAuthTokens } from "@/lib/api"; // Import the API client we created

const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const redirectPath = queryParams.get("redirect") || "/dashboard";

  // Updated user query to use our API client
  const { data: user, isLoading: isUserLoading } = useQuery<User | null>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const response = await API.user.getProfile();
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          clearAuthTokens();
        }
        return null;
      }
    },
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('access_token'),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!isUserLoading && user) {
      navigate(user.role === "admin" ? "/admin/dashboard" : redirectPath, { 
        replace: true 
      });
    }
  }, [user, isUserLoading, navigate, redirectPath]);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Updated login mutation to use our API client
  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      try {
        const response = await API.auth.login(data);
        return response.data;
      } catch (error) {
        let errorMessage = "Login failed. Please try again.";
        
        if (axios.isAxiosError(error)) {
          if (error.response?.data?.detail) {
            errorMessage = error.response.data.detail;
            if (errorMessage.toLowerCase().includes('no active account found') || 
                errorMessage.toLowerCase().includes('incorrect password')) {
              errorMessage = "Invalid username or password.";
            }
          } else if (error.response?.status === 401) {
            errorMessage = "Invalid username or password.";
          } else if (error.message === "Network Error") {
            errorMessage = "Network error. Could not connect to the server.";
          }
        }
        
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data: TokenResponse) => {
      setAuthTokens(data.access, data.refresh);
      
      toast({
        title: "Login successful",
        description: "You have been logged in.",
      });

      navigate(redirectPath, { replace: true });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      form.setValue('password', '');
    },
  });

  function onSubmit(data: LoginFormData) {
    form.clearErrors();
    loginMutation.mutate(data);
  }

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-600">Checking login status...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Or{" "}
              {/* Link to the registration page */}
              <Link href="/register" className="font-medium text-primary hover:underline">
                register for a new account
              </Link>
            </p>
          </div>

          <div className="mt-8">
            {/* React Hook Form context provider */}
            <Form {...form}>
              {/* The actual HTML form element */}
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Username Form Field */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="username" {...field} />
                      </FormControl>
                      {/* Displays validation errors for this field */}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Form Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••" {...field} />
                      </FormControl>
                      {/* Displays validation errors for this field */}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending} // Disable button while mutation is running
                  >
                    {/* Show loading spinner if mutation is pending */}
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </div>
                 {/* Display general/non-field errors, if any */}
                 {/* react-hook-form v7 and above can display errors on the 'root' */}
                 {form.formState.errors.root && (
                    <div className="text-destructive text-sm mt-2 text-center">
                        {form.formState.errors.root.message}
                    </div>
                 )}
              </form>
            </Form>
          </div>
        </div>
      </div>

      {/* Right section for styling/marketing (hidden on small screens) */}
      <div className="hidden lg:block relative flex-1">
        <div className="absolute inset-0 bg-primary">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-700 opacity-90"></div>
        </div>
        <div className="relative flex flex-col justify-center items-center h-full px-10 text-white">
          <h1 className="text-4xl font-bold mb-6">Salon Site Builder</h1>
          <p className="text-xl text-center mb-8">
            The easiest way to create and manage a professional website for your nail salon
          </p>
          <ul className="space-y-4">
            <li className="flex items-center">
              <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No upfront costs or design fees
            </li>
            <li className="flex items-center">
              <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Mobile-optimized and professionally designed
            </li>
            <li className="flex items-center">
              <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Easy content updates with no technical knowledge
            </li>
            <li className="flex items-center">
              <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              14-day free trial with no credit card required
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}