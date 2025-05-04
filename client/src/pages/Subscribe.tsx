// src/pages/Subscribe.tsx
import React, { useEffect, useState, FormEvent } from 'react';
// import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js'; // Remove Stripe imports
// import { loadStripe } from '@stripe/stripe-js'; // Remove Stripe imports
import { useLocation } from 'wouter'; // Keep for potential internal navigation simulation

import { useToast } from '@/hooks/use-toast';
// import { useAuth, User } from '@/context/AuthContext'; // Removed AuthContext

import { TopNavigation } from '@/components/layout/TopNavigation'; // Assuming standalone
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

// --- Dummy Data and Types ---
interface DummyUser { username: string; email?: string; role: 'user' | 'admin'; }
interface DummySubscriptionPlan {
    id: number;
    name: string;
    description?: string;
    price_cents: number;
    display_price: string;
    currency: string;
    features: string[];
    stripe_price_id: string;
    trial_period_days: number;
    is_active: boolean;
    is_popular: boolean;
}

const dummyUserData: DummyUser | null = { username: "SubscribingUser", role: "user" };
// const dummyUserData: DummyUser | null = null; // Simulate logged out

const dummyPlansData: DummySubscriptionPlan[] = [
    { id: 1, name: "Basic", price_cents: 7900, display_price: "79.00", currency: "usd", features: ["Website", "Mobile Ready"], stripe_price_id: "price_basic_fake", trial_period_days: 14, is_active: true, is_popular: true, description: "Essential features" },
    { id: 2, name: "Premium", price_cents: 14900, display_price: "149.00", currency: "usd", features: ["All Basic", "Domain", "Booking"], stripe_price_id: "price_premium_fake", trial_period_days: 14, is_active: true, is_popular: false, description: "More features" },
    { id: 3, name: "Luxury", price_cents: 23900, display_price: "239.00", currency: "usd", features: ["All Premium", "SEO", "Support"], stripe_price_id: "price_luxury_fake", trial_period_days: 14, is_active: true, is_popular: false, description: "Top tier" },
];

// --- Stripe Initialization Simulation ---
// Remove actual Stripe loading
// const stripePromise = null; // Indicate Stripe is not loaded

// --- Child Component: Subscribe Form Simulation ---
const SubscribeForm = ({ planName }: { planName: string }) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [, navigate] = useLocation(); // Keep for simulating navigation

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    console.log(`Simulating payment confirmation for ${planName}...`);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate success
    toast({ title: "Subscription Started! (Simulated)", description: "Welcome aboard!" });
    // navigate("/app/portal", { replace: true }); // Simulate navigation
    alert("Simulating navigation to portal after successful subscription.");

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Placeholder for Payment Element */}
      <div className="p-4 border rounded-md bg-muted text-muted-foreground text-center text-sm">
        [Stripe Payment Element Placeholder]
        <p className="mt-2 text-xs">Enter dummy card details here in a real test environment.</p>
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isProcessing} // Disable while processing
      >
        {isProcessing ? (
           <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing... </>
        ) : (
           "Start Free Trial & Subscribe"
        )}
      </Button>
      <p className="text-xs text-muted-foreground text-center px-4">
        Your free trial begins now. You won't be charged until the trial ends. Cancel anytime.
      </p>
    </form>
  );
};

// --- Main Subscribe Page Component ---
export default function Subscribe() {
  // Use dummy data, remove clientSecret state
  // const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false); // Keep for simulation
  const [, navigate] = useLocation();
  const { toast } = useToast();
  // Use dummy user and plans
  const user = dummyUserData;
  const plans = dummyPlansData;
  const isAuthenticated = !!user;
  const isAuthLoading = false; // Simulate loaded
  const isLoadingPlans = false; // Simulate loaded

  // --- Authentication Check Simulation ---
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      console.log("Subscribe: Not authenticated, simulating redirect to login.");
      alert("Simulating redirect to login page (not authenticated).");
      // navigate(`/login?redirect=/subscribe`, { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);


  // --- Get Plan ID from URL on initial load ---
  useEffect(() => {
    // Simulate reading from URL without actual router dependency if needed
    const fakeSearchParams = new URLSearchParams(window.location.search); // Use actual search params
    const planIdParam = fakeSearchParams.get("planId");
    if (planIdParam && !selectedPlanId) {
      const parsedId = parseInt(planIdParam, 10);
      if (!isNaN(parsedId) && plans?.some(p => p.id === parsedId)) { // Check if ID is valid
          setSelectedPlanId(parsedId);
      } else {
          console.warn(`Invalid planId (${planIdParam}) in URL.`);
      }
    }
  }, [selectedPlanId, plans]); // Depend on plans loading as well


  // --- Simulate Subscription Intent Creation ---
  useEffect(() => {
    // Simulate the process: if a plan is selected, show the form after a delay
    if (selectedPlanId && isAuthenticated && !isLoadingSubscription) {
      setIsLoadingSubscription(true);
      console.log(`Simulating subscription intent creation for plan ID: ${selectedPlanId}`);
      const timer = setTimeout(() => {
          // Simulate success - in real app, we'd get clientSecret here
          setIsLoadingSubscription(false);
           toast({ title: "Ready to Subscribe", description: "Please enter your payment details below." });
      }, 1000); // Simulate 1s delay

      return () => clearTimeout(timer); // Cleanup timer on unmount or re-run
    }
    // Reset loading if plan is deselected while loading
    if (!selectedPlanId) {
        setIsLoadingSubscription(false);
    }
  }, [selectedPlanId, isAuthenticated, isLoadingSubscription, toast]);

  // --- Derived State ---
  const selectedPlan = plans?.find(plan => plan.id === selectedPlanId);


  // --- Loading States ---
   if (isAuthLoading || isLoadingPlans) { // Check main loading states
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // --- Render Component ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopNavigation user={user} isLoggedIn={isAuthenticated} />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground">Choose Your Subscription Plan</h1>
          <p className="text-muted-foreground mt-2">Select a plan that works best for your salon</p>
        </div>

        {/* --- Show Plan Selection --- */}
        {!selectedPlanId && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Use SubscriptionPlans component if available and accepts props */}
            {/* <SubscriptionPlans plans={plans} isLoading={isLoadingPlans} onSelectPlan={setSelectedPlanId} /> */}
            {/* Or render cards directly: */}
             {(isLoadingPlans ? Array(3).fill(0) : plans).map((planOrSkeleton, index) =>
                 isLoadingPlans ? (
                     <Card key={`skeleton-${index}`}><CardHeader><Skeleton className="h-6 w-1/2"/></CardHeader><CardContent><Skeleton className="h-40 w-full"/></CardContent><CardFooter><Skeleton className="h-10 w-full"/></CardFooter></Card>
                 ) : (
                     <Card key={(planOrSkeleton as DummySubscriptionPlan).id} className={`flex flex-col overflow-hidden transition-shadow hover:shadow-lg ${ (planOrSkeleton as DummySubscriptionPlan).is_popular ? 'border-2 border-primary shadow-xl' : 'border' }`}>
                        {(planOrSkeleton as DummySubscriptionPlan).is_popular && (<div className="bg-primary text-primary-foreground text-center py-1.5 text-sm font-semibold">Most Popular</div>)}
                        <CardHeader className="pb-4"><CardTitle className="text-xl">{(planOrSkeleton as DummySubscriptionPlan).name}</CardTitle><div className="mt-2 flex items-baseline"><span className="text-4xl font-bold tracking-tight">${(planOrSkeleton as DummySubscriptionPlan).display_price}</span><span className="text-sm font-medium text-muted-foreground ml-1">/month</span></div><CardDescription className="pt-2 text-sm">{(planOrSkeleton as DummySubscriptionPlan).description}</CardDescription></CardHeader>
                        <CardContent className="flex-grow"><ul className="space-y-2 text-sm">{(planOrSkeleton as DummySubscriptionPlan).features?.map((feature, idx) => (<li key={idx} className="flex items-start"><CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" /><span className="text-muted-foreground">{feature}</span></li>))}</ul></CardContent>
                        <CardFooter><Button className="w-full" variant={(planOrSkeleton as DummySubscriptionPlan).is_popular ? "default" : "secondary"} onClick={() => setSelectedPlanId((planOrSkeleton as DummySubscriptionPlan).id)} disabled={isLoadingSubscription}>Choose Plan</Button></CardFooter>
                     </Card>
                 )
             )}
             {(plans?.length === 0 && !isLoadingPlans) && (<p className='text-center col-span-full text-muted-foreground'>No plans available.</p>)}
          </div>
        )}

         {/* --- Show Loading Spinner while "creating" subscription --- */}
        {selectedPlanId && isLoadingSubscription && (
          <div className="flex flex-col justify-center items-center py-20 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Preparing subscription for the {plans?.find(p=>p.id === selectedPlanId)?.name} plan...</p>
            <Button variant="link" onClick={() => { setSelectedPlanId(null); setIsLoadingSubscription(false); }} className="mt-4">Cancel</Button>
          </div>
        )}

        {/* --- Show Simulated Stripe Form (if plan selected and "intent" created) --- */}
        {selectedPlan && !isLoadingSubscription && (
          <Card className="mx-auto max-w-xl shadow-lg mt-10">
            <CardHeader>
              <CardTitle>Complete Your Subscription</CardTitle>
              <CardDescription> You're subscribing to the <span className='font-semibold'>{selectedPlan.name}</span> plan at <span className='font-semibold'>${selectedPlan.display_price}/month</span>. </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedPlan.trial_period_days > 0 && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-md">
                    <div className="flex"> <div className="flex-shrink-0"> <AlertCircle className="h-5 w-5 text-blue-500" /> </div> <div className="ml-3"> <p className="text-sm text-blue-800"> Your <span className='font-medium'>{selectedPlan.trial_period_days}-day free trial</span> starts today. You won't be charged until the trial ends. Cancel anytime. </p> </div> </div>
                  </div>
              )}
              {/* --- Remove Elements wrapper, show SubscribeForm directly --- */}
              <SubscribeForm planName={selectedPlan.name} />
              {/* ---------------------------------------------------------- */}
              <Button variant="link" size="sm" onClick={() => { setSelectedPlanId(null); /* setClientSecret(null); */ }} className="w-full mt-4 text-muted-foreground"> Change Plan </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Define dummy types if needed elsewhere
interface User { username: string; email?: string; role: 'user' | 'admin'; }
// interface SubscriptionPlan defined above