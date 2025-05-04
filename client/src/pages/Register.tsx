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
// Remove API/Context imports: apiRequest, useMutation, useAuth

// Define the shape of the registration form data
interface RegisterFormData {
    username: string;
    email: string;
    password?: string;
    password2?: string; // Use password2 for confirmation field
    first_name?: string;
    last_name?: string;
    phone_number?: string;
}

// Define potential backend errors (for simulation)
type RegisterBackendErrors = {
    username?: string[];
    email?: string[];
    password?: string[];
    password2?: string[];
    confirmPassword?: string[]; // Keep just in case mapping needed
    non_field_errors?: string[];
    detail?: string;
};

export default function Register() {
    const [, navigate] = useLocation(); // Keep for simulating navigation
    const { toast } = useToast();
    // Simulate auth state locally
    const [isAuthLoading, setIsAuthLoading] = useState(false); // Simulate loading
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Simulate logged in state
    const [isSubmitting, setIsSubmitting] = useState(false); // Simulate submitting state
    const [backendErrors, setBackendErrors] = useState<RegisterBackendErrors | null>(null);

    // Simulate checking auth status
     useEffect(() => {
        // Assume not logged in initially for register page
     }, []);

    // Simulate redirection if somehow logged in
     useEffect(() => {
         if (isAuthenticated) {
             alert("Already logged in, simulating redirect to dashboard.");
             // navigate("/", { replace: true });
         }
     }, [isAuthenticated, navigate]);

    const form = useForm<RegisterFormData>({
        defaultValues: {
            username: "", email: "", password: "", password2: "",
            first_name: "", last_name: "", phone_number: "",
        },
    });

    // Simulate registration submission
    const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
         setIsSubmitting(true);
         setBackendErrors(null);
         console.log("Simulating registration with:", data);

         if (data.password !== data.password2) {
             form.setError("password2", { type: "manual", message: "Passwords do not match" });
             setIsSubmitting(false);
             return;
         }

         await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay

         // Simulate Success/Failure
         const success = Math.random() > 0.2; // 80% chance success

         if (success) {
            toast({
                title: "Registration Successful! (Simulated)",
                description: `Welcome, ${data.username}! Please log in.`,
                // variant: "success" // Remove if not defined in toast component
            });
            alert("Simulating navigation to login page.");
            // navigate("/login"); // Real navigation
            form.reset(); // Reset form on success
         } else {
             // Simulate errors
             const simulatedErrors: RegisterBackendErrors = {
                 username: ["Username already taken (simulated)."],
                 email: ["Enter a valid email (simulated)."],
                 password2: ["Password complexity not met (simulated)."], // Example error on pw2
             };
             setBackendErrors(simulatedErrors);
             toast({
                title: "Registration Failed (Simulated)",
                description: "Please correct the errors below.",
                variant: "destructive",
             });
         }
         setIsSubmitting(false);
    };

    // --- Loading States ---
     if (isAuthLoading) {
         return (
             <div className="flex items-center justify-center min-h-screen"> <Loader2 className="h-8 w-8 animate-spin text-primary" /> </div>
         );
     }
    if (isAuthenticated) { // Prevent rendering form if somehow authenticated
        return (
            <div className="flex items-center justify-center min-h-screen"> <Loader2 className="h-8 w-8 animate-spin text-primary" /> <p className="ml-4">Redirecting...</p> </div>
        );
    }

    // Helper to display simulated errors
    const displayError = (fieldName: keyof RegisterFormData | string) => {
        const fieldNameStr = fieldName as keyof RegisterBackendErrors; // Type assertion
        // Check both password2 and confirmPassword for flexibility
        const errors = backendErrors?.[fieldNameStr] ?? (fieldNameStr === 'password2' ? backendErrors?.confirmPassword : undefined);
        if (errors && errors.length > 0) {
            return <p className="text-sm font-medium text-destructive mt-1">{errors[0]}</p>;
        }
        return null;
    };

    return (
        <div className="min-h-screen flex">
            {/* Left column - Registration form */}
            <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div>
                        <h2 className="mt-6 text-3xl font-extrabold text-foreground"> Create a new account </h2>
                        <p className="mt-2 text-sm text-muted-foreground"> Already have an account?{" "} <Link href="/login" className="font-medium text-primary hover:underline"> Sign in here </Link> </p>
                    </div>
                    <div className="mt-8">
                         {displayError('non_field_errors')}
                         {displayError('detail')}
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField control={form.control} name="username" rules={{ required: 'Username is required' }} render={({ field }) => ( <FormItem> <FormLabel>Username</FormLabel> <FormControl> <Input placeholder="choose_a_username" {...field} aria-invalid={!!form.formState.errors.username || !!backendErrors?.username} className={form.formState.errors.username || !!backendErrors?.username ? 'border-destructive' : ''} /> </FormControl> <FormMessage>{form.formState.errors.username?.message}</FormMessage> {displayError('username')} </FormItem> )} />
                                <FormField control={form.control} name="email" rules={{ required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address'} }} render={({ field }) => ( <FormItem> <FormLabel>Email</FormLabel> <FormControl> <Input type="email" placeholder="you@example.com" {...field} aria-invalid={!!form.formState.errors.email || !!backendErrors?.email} className={form.formState.errors.email || !!backendErrors?.email ? 'border-destructive' : ''} /> </FormControl> <FormMessage>{form.formState.errors.email?.message}</FormMessage> {displayError('email')} </FormItem> )} />
                                <FormField control={form.control} name="password" rules={{ required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters'} }} render={({ field }) => ( <FormItem> <FormLabel>Password</FormLabel> <FormControl> <Input type="password" placeholder="••••••••" {...field} aria-invalid={!!form.formState.errors.password || !!backendErrors?.password} className={form.formState.errors.password || !!backendErrors?.password ? 'border-destructive' : ''} /> </FormControl> <FormMessage>{form.formState.errors.password?.message}</FormMessage> {displayError('password')} </FormItem> )} />
                                <FormField control={form.control} name="password2" rules={{ required: 'Please confirm your password' }} render={({ field }) => ( <FormItem> <FormLabel>Confirm Password</FormLabel> <FormControl> <Input type="password" placeholder="••••••••" {...field} aria-invalid={!!form.formState.errors.password2 || !!backendErrors?.password2 || !!backendErrors?.confirmPassword } className={form.formState.errors.password2 || !!backendErrors?.password2 || !!backendErrors?.confirmPassword ? 'border-destructive' : ''} /> </FormControl> <FormMessage>{form.formState.errors.password2?.message}</FormMessage> {displayError('password2') || displayError('confirmPassword')} </FormItem> )} />
                                {/* Optional fields like first name, last name, phone could be added here */}
                                <div>
                                    <Button type="submit" className="w-full" disabled={isSubmitting} >
                                        {isSubmitting ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : null}
                                        Create Account
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
                     <h1 className="text-4xl font-bold mb-6">Get Started Today</h1>
                     <p className="text-xl text-center mb-8"> Create your salon website in minutes </p>
                     <div className="space-y-6 max-w-md">
                         <div className="bg-white/10 p-4 rounded-lg"> <h3 className="font-bold text-lg mb-2">Free 14-Day Trial</h3> <p className="text-white/80"> Try all features with no commitment. </p> </div>
                         <div className="bg-white/10 p-4 rounded-lg"> <h3 className="font-bold text-lg mb-2">Easy Content Management</h3> <p className="text-white/80"> Update services, hours, photos easily. </p> </div>
                         <div className="bg-white/10 p-4 rounded-lg"> <h3 className="font-bold text-lg mb-2">Mobile-Optimized</h3> <p className="text-white/80"> Your site looks great on all devices. </p> </div>
                     </div>
                 </div>
            </div>
        </div>
    );
}