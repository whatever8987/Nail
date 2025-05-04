import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link, useLocation } from 'wouter'; // Keep Link, useLocation for simulation
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
// Removed useAuth import

// Define the shape of the login form data
interface LoginFormData {
    username: string;
    password?: string;
}

// Define the shape of potential backend validation errors (for simulation)
type LoginBackendErrors = {
  username?: string[];
  password?: string[];
  non_field_errors?: string[];
  detail?: string;
  error?: string;
};

export default function Login() {
    const [, navigate] = useLocation(); // Keep for simulating navigation
    const { toast } = useToast();
    // Simulate auth state locally
    const [isLoading, setIsLoading] = useState(false); // Simulate loading/submitting state
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Simulate logged in state
    const [backendLoginError, setBackendLoginError] = useState<LoginBackendErrors | null>(null);

    // Simulate fetching redirect path
    const queryParams = new URLSearchParams(window.location.search);
    const redirectPath = queryParams.get("redirect") || "/"; // Default to SPA root

    // Simulate checking auth status initially (e.g., if there was a cookie)
    useEffect(() => {
        // In standalone, assume not logged in initially unless simulating
        // setIsLoading(true);
        // setTimeout(() => setIsLoading(false), 500); // Simulate check delay
    }, []);

    // Simulate redirection if state changes to authenticated
    useEffect(() => {
        if (isAuthenticated) {
            const destination = redirectPath; // Simplified redirect logic for demo
            alert(`Simulating redirect to: ${destination}`);
            // navigate(destination, { replace: true }); // Real navigation
            // Reset state for demo purposes if needed
            // setIsAuthenticated(false);
        }
    }, [isAuthenticated, navigate, redirectPath]);

    const form = useForm<LoginFormData>({
        defaultValues: {
            username: "",
            password: "",
        },
    });

    // Simulate login submission
    const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
        setIsLoading(true); // Indicate submission process
        setBackendLoginError(null); // Clear previous errors
        console.log("Simulating login with:", data);

        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

        // Simulate success/failure
        if (data.username === "test" && data.password === "password") {
            toast({ title: "Login Successful (Simulated)", description: `Welcome back, ${data.username}!` });
            setIsAuthenticated(true); // Trigger redirect effect
        } else if (data.username === "fail") {
             const simulatedErrors: LoginBackendErrors = {
                 username: ["Invalid username provided (simulated)."],
                 password: ["Password check failed (simulated)."]
             };
             setBackendLoginError(simulatedErrors);
             toast({ title: "Login Failed (Simulated)", description: "Please check errors.", variant: "destructive" });
        } else {
             const simulatedErrors: LoginBackendErrors = {
                non_field_errors: ["Invalid credentials (simulated generic error)."]
             };
             setBackendLoginError(simulatedErrors);
             toast({ title: "Login Failed (Simulated)", description: "Invalid username or password.", variant: "destructive" });
        }
        setIsLoading(false);
    };

    // --- Loading / Authenticated States ---
    // Note: In standalone, isLoading might only be true during submit simulation
    // If simulating an initial check, you'd use a separate loading state
    // if (isLoadingInitial) { return <Loader.../>; }

    if (isAuthenticated) { // If simulated login was successful, show redirecting message
         return (
             <div className="flex items-center justify-center min-h-screen">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 <p className="ml-4">Login Successful! Redirecting...</p>
             </div>
         );
    }

    // Helper to display simulated backend errors
    const displayNonFieldError = () => {
         const errors = backendLoginError;
         const message = errors?.non_field_errors?.[0] ?? errors?.detail ?? (typeof errors?.error === 'string' ? errors.error : null);
         if (message) {
             return <p className="text-sm font-medium text-destructive mb-4">{message}</p>;
         }
         return null;
     };

    return (
        <div className="min-h-screen flex">
            {/* Left column - Login form */}
            <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div>
                        <h2 className="mt-6 text-3xl font-extrabold text-foreground"> Sign in to your account </h2>
                        <p className="mt-2 text-sm text-muted-foreground"> Or{" "} <Link href="/register" className="font-medium text-primary hover:underline"> register for a new account </Link> </p>
                    </div>
                    <div className="mt-8">
                        {displayNonFieldError()}
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    rules={{ required: 'Username is required' }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username or Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                   placeholder="your_username or you@example.com"
                                                   {...field}
                                                   aria-invalid={!!form.formState.errors.username || !!backendLoginError?.username}
                                                   className={form.formState.errors.username || !!backendLoginError?.username ? 'border-destructive' : ''}
                                                   />
                                            </FormControl>
                                            <FormMessage>{form.formState.errors.username?.message}</FormMessage>
                                            {backendLoginError?.username?.map((err, i) => <p key={i} className="text-sm font-medium text-destructive">{err}</p>)}
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    rules={{ required: 'Password is required' }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                   type="password"
                                                   placeholder="••••••"
                                                   {...field}
                                                   aria-invalid={!!form.formState.errors.password || !!backendLoginError?.password}
                                                    className={form.formState.errors.password || !!backendLoginError?.password ? 'border-destructive' : ''}
                                                   />
                                            </FormControl>
                                             <FormMessage>{form.formState.errors.password?.message}</FormMessage>
                                              {backendLoginError?.password?.map((err, i) => <p key={i} className="text-sm font-medium text-destructive">{err}</p>)}
                                        </FormItem>
                                    )}
                                />
                                <div>
                                    <Button type="submit" className="w-full" disabled={isLoading} >
                                        {isLoading ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : null}
                                        Sign in
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
            {/* Right column - Hero section (Keep as is) */}
            <div className="hidden lg:block relative flex-1">
                 <div className="absolute inset-0 bg-primary"><div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-700 opacity-90"></div></div>
                 <div className="relative flex flex-col justify-center items-center h-full px-10 text-white">
                     <h1 className="text-4xl font-bold mb-6">Salon Site Builder</h1>
                     <p className="text-xl text-center mb-8"> Easiest way to create & manage a professional website </p>
                     <ul className="space-y-4">
                        <li className="flex items-center"><svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> No upfront costs</li>
                        <li className="flex items-center"><svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> Mobile-optimized design</li>
                        <li className="flex items-center"><svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> Easy content updates</li>
                        <li className="flex items-center"><svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> 14-day free trial</li>
                     </ul>
                 </div>
            </div>
        </div>
    );
}