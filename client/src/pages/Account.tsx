// src/pages/Account.tsx
import React, { useState, useEffect } from 'react'; // Import React and useEffect
import { useForm, SubmitHandler } from 'react-hook-form';
import { useLocation } from 'wouter'; // Keep for potential internal navigation if needed
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, Key } from 'lucide-react';
import { TopNavigation } from '@/components/layout/TopNavigation'; // Assuming this is standalone or uses props
import { TabNavigation } from '@/components/layout/TabNavigation'; // Assuming this is standalone

// --- Dummy Data and Types ---
interface DummyUser {
    username: string;
    email: string;
    phone_number?: string | null; // Match model nullability
    role: 'user' | 'admin';
}

interface ProfileFormData {
  username: string;
  email: string;
  phone_number?: string | null; // Match DummyUser type
}

interface PasswordFormData {
  currentPassword?: string; // Made optional for display without Zod
  newPassword?: string;
  confirmPassword?: string; // Renamed from password2 for clarity
}

// Sample dummy user data
const dummyUserData: DummyUser = {
    username: "sampleUser",
    email: "sample@example.com",
    phone_number: "123-456-7890",
    role: "user"
};

export default function Account() {
  const [, navigate] = useLocation(); // Can keep for internal nav simulation
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile"); // Default tab
  const [isLoadingUser, setIsLoadingUser] = useState(false); // Simulate loading
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Use dummy user data
  const user = dummyUserData;
  const isLoggedIn = !!user; // Simulate logged-in state

  // --- Profile Form ---
  const profileForm = useForm<ProfileFormData>({
    // No resolver
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      phone_number: user?.phone_number || "",
    },
  });

  // Simulate profile update
  const onSubmitProfile: SubmitHandler<ProfileFormData> = async (data) => {
    setIsSavingProfile(true);
    console.log("Simulating profile update with:", data);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    toast({
      title: "Profile Updated (Simulated)",
      description: "Your profile details have been saved.",
    });
    setIsSavingProfile(false);
    profileForm.reset(data); // Reset form to keep saved values, mark as not dirty
  };

  // --- Password Form ---
  const passwordForm = useForm<PasswordFormData>({
    // No resolver
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Simulate password change
  const onSubmitPassword: SubmitHandler<PasswordFormData> = async (data) => {
      // Basic frontend validation
      if (!data.currentPassword) {
           passwordForm.setError("currentPassword", { type: "manual", message: "Current password required."});
           return;
      }
       if (!data.newPassword || data.newPassword.length < 6) {
           passwordForm.setError("newPassword", { type: "manual", message: "New password must be at least 6 characters."});
           return;
      }
      if (data.newPassword !== data.confirmPassword) {
          passwordForm.setError("confirmPassword", { type: "manual", message: "Passwords do not match." });
          return;
      }

    setIsChangingPassword(true);
    console.log("Simulating password change...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Password Changed (Simulated)",
      description: "Your password has been updated successfully.",
    });
    passwordForm.reset(); // Clear form
    setIsChangingPassword(false);
  };

  // Define tabs for navigation component
  const accountTabs = [
    { name: "Profile", href: "/account", id: "profile" }, // Match activeTab state value
    { name: "Security", href: "/account?tab=security", id: "security" }, // Example structure
    { name: "Preferences", href: "/account?tab=preferences", id: "preferences" },
  ];

  // Basic tab handling (replace with wouter state/params in real app)
   useEffect(() => {
     const params = new URLSearchParams(window.location.search);
     const tabParam = params.get("tab");
     if (tabParam && ["profile", "security", "preferences"].includes(tabParam)) {
       setActiveTab(tabParam);
     } else {
       setActiveTab("profile"); // Default if no valid tab param
     }
   }, []); // Run on mount to check URL


  // Show loading skeleton if needed
  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Basic check if user data is available (for standalone display)
  if (!user) {
     return (
         <div className="p-8 text-center text-red-600">Error: User data not available for display.</div>
     );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Pass dummy/controlled data to TopNavigation */}
      <TopNavigation user={user} isLoggedIn={isLoggedIn} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> {/* Reduced max-width */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
          <p className="mt-1 text-muted-foreground">Manage your account information and preferences</p>
        </div>

        {/* Simulate Tab Navigation Click (doesn't use wouter Link directly) */}
        <div className="border-b border-border mb-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {accountTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)} // Set state on click
                className={`whitespace-nowrap px-1 pb-4 pt-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
                aria-current={activeTab === tab.id ? "page" : undefined}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>


        <div className="mt-6">
          {/* --- Profile Tab --- */}
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
                    <FormField
                      control={profileForm.control}
                      name="username"
                      rules={{ required: "Username is required", minLength: {value: 3, message: "Min 3 chars"} }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Your username" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="email"
                      rules={{ required: "Email is required", pattern: {value: /^\S+@\S+$/i, message: "Invalid email"} }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} placeholder="you@example.com"/>
                          </FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number (Optional)</FormLabel>
                          <FormControl>
                            {/* Handle null value for input */}
                            <Input type="tel" {...field} value={field.value ?? ""} placeholder="(123) 456-7890" />
                          </FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={isSavingProfile || !profileForm.formState.isDirty}
                    >
                      {isSavingProfile ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save Changes
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* --- Security Tab --- */}
          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your password.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-6">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      rules={{ required: "Current password is required." }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} placeholder="Your current password"/>
                          </FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Separator className="my-4" />
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      rules={{ required: "New password is required.", minLength: {value: 6, message: "Min 6 chars"} }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} placeholder="New strong password"/>
                          </FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword" // Renamed from password2 for clarity
                      rules={{ required: "Please confirm new password."}}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} placeholder="Confirm new password"/>
                          </FormControl>
                           <FormMessage />
                           {/* Display cross-field validation error if passwords don't match */}
                           {passwordForm.formState.errors.confirmPassword?.type === 'manual' && (
                              <p className="text-sm font-medium text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                           )}
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Key className="mr-2 h-4 w-4" />
                      )}
                      Change Password
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* --- Preferences Tab --- */}
          {activeTab === "preferences" && (
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Manage your account preferences.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Preferences settings placeholder content.</p>
                {/* Add dummy preference toggles/options here */}
                 <div className="mt-4 space-y-2">
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="emailNotifications" defaultChecked/>
                        <label htmlFor="emailNotifications" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Receive email notifications
                        </label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <input type="checkbox" id="darkModePref"/>
                        <label htmlFor="darkModePref" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Enable dark mode preference
                        </label>
                    </div>
                 </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}