// src/pages/Pricing.tsx
import React from 'react'; // Import React
// import { useLocation } from 'wouter'; // Remove wouter if not navigating
import { TopNavigation } from "@/components/layout/TopNavigation"; // Assuming standalone or props based
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast"; // Keep toast for UI interaction
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

// Define dummy types
interface DummyUser { username: string; email?: string; role: 'user' | 'admin'; }
interface DummySubscriptionPlan {
  id: number;
  name: string;
  description?: string;
  price: number; // Simple price number
  features: string[];
  isPopular?: boolean;
  trialDays?: number;
}

interface PricingPageProps {
    plans?: DummySubscriptionPlan[];
    isLoading?: boolean;
    user?: DummyUser | null; // Add user prop for TopNavigation
}

// Sample dummy data
const dummyUserData: DummyUser | null = { username: "PricingViewer", role: "user" };
// const dummyUserData: DummyUser | null = null; // Simulate logged out

const dummyPlansData: DummySubscriptionPlan[] = [
    { id: 1, name: "Basic", price: 79, description: "Ideal start", features: ["Website", "Mobile Ready", "Basic Edits", "Email Support"], isPopular: true, trialDays: 14 },
    { id: 2, name: "Premium", price: 149, description: "For growing salons", features: ["All Basic", "Custom Domain", "Booking", "Priority Help"], isPopular: false, trialDays: 14 },
    { id: 3, name: "Luxury", price: 239, description: "Full service", features: ["All Premium", "Design Tweaks", "SEO Boost", "Dedicated Manager"], isPopular: false, trialDays: 14 },
];

export default function Pricing({
    plans = dummyPlansData,
    isLoading: isLoadingPlans = false, // Renamed for clarity
    user = dummyUserData
}: PricingPageProps) {
  // const [, navigate] = useLocation(); // Remove if not navigating
  const { toast } = useToast(); // Keep for interaction feedback

  // Use dummy data directly
  const isLoggedIn = !!user;
  const isLoadingUser = false; // Simulate user loaded

  const handleSelectPlan = (planId: number) => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required (Simulated)",
        description: "Please log in to select a plan.",
        variant: "destructive"
      });
      // navigate("/login?redirect=/pricing"); // Real navigation
      alert("Simulating redirect to login page.");
      return;
    }
    // navigate(`/subscribe?planId=${planId}`); // Real navigation
    alert(`Simulating navigation to subscribe page for Plan ID: ${planId}`);
  };

  const handleContactSales = () => {
      alert("Simulating navigation to contact page.");
      // navigate("/contact"); // Real navigation
  }

  // Combined loading state
  const isLoading = isLoadingUser || isLoadingPlans;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const displayPlans = plans;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopNavigation user={user} isLoggedIn={isLoggedIn} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl sm:tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-5 text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that works best for your salon. All plans include a 14-day free trial.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {(isLoadingPlans ? Array(3).fill(0) : displayPlans).map((planOrSkeleton, index) =>
             isLoadingPlans ? (
                <Card key={`skeleton-${index}`} className="flex flex-col overflow-hidden shadow-sm border border-border bg-card">
                    <CardHeader className={'pt-8'}>
                        <Skeleton className="h-7 w-1/2 mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <Skeleton className="h-10 w-1/3 mb-5" />
                        <Skeleton className="h-5 w-20 mb-6" />
                        <div className="space-y-3 mt-6">
                            {Array(4).fill(0).map((_, i)=><Skeleton key={i} className="h-5 w-5/6"/>)}
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Skeleton className="h-10 w-full"/>
                    </CardFooter>
                </Card>
             ) : (
                <Card key={(planOrSkeleton as DummySubscriptionPlan).id} className={`overflow-hidden flex flex-col h-full shadow-sm hover:shadow-lg transition-shadow duration-200 ${ (planOrSkeleton as DummySubscriptionPlan).isPopular ? 'ring-2 ring-primary relative' : 'border border-border' }`}>
                  {(planOrSkeleton as DummySubscriptionPlan).isPopular && (
                    <div className="absolute top-0 inset-x-0 bg-primary text-center py-1 text-xs font-medium text-primary-foreground rounded-t-lg"> MOST POPULAR </div>
                  )}
                  <CardHeader className={(planOrSkeleton as DummySubscriptionPlan).isPopular ? 'pt-10' : 'pt-6'}>
                    <CardTitle className="text-xl">{ (planOrSkeleton as DummySubscriptionPlan).name }</CardTitle>
                    <CardDescription>{ (planOrSkeleton as DummySubscriptionPlan).description }</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="mb-5">
                      <span className="text-4xl font-bold text-foreground">${ (planOrSkeleton as DummySubscriptionPlan).price }</span>
                      <span className="text-muted-foreground ml-1">/month</span>
                    </div>

                    {(planOrSkeleton as DummySubscriptionPlan).trialDays && (planOrSkeleton as DummySubscriptionPlan).trialDays > 0 && (
                      <Badge variant="outline" className="mb-4 font-medium">
                        {(planOrSkeleton as DummySubscriptionPlan).trialDays}-day free trial
                      </Badge>
                    )}

                    <ul className="space-y-3 mt-6 text-sm">
                      {(planOrSkeleton as DummySubscriptionPlan).features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-px flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => handleSelectPlan((planOrSkeleton as DummySubscriptionPlan).id)}
                      className="w-full"
                      variant={(planOrSkeleton as DummySubscriptionPlan).isPopular ? "default" : "outline"}
                    >
                      {isLoggedIn ? "Select Plan" : "Get Started"}
                    </Button>
                  </CardFooter>
                </Card>
              )
          )}
           {(displayPlans.length === 0 && !isLoadingPlans) && (
               <p className="col-span-full text-center text-muted-foreground py-10">Pricing plans coming soon.</p>
           )}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-card rounded-lg shadow-md border border-border p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">What's included in all plans?</h3>
              <p className="text-muted-foreground text-sm">A professional website, mobile optimization, content updates, basic SEO, and support.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Can I cancel anytime?</h3>
              <p className="text-muted-foreground text-sm">Yes, cancel anytime without penalty. Your site stays active until the end of the billing period.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Do I need technical skills?</h3>
              <p className="text-muted-foreground text-sm">No skills needed. Our editor makes updating your site easy.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">What happens after the free trial?</h3>
              <p className="text-muted-foreground text-sm">Your selected plan begins automatically. Cancel before the trial ends to avoid charges.</p>
            </div>
             <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Can I use my own domain name?</h3>
              <p className="text-muted-foreground text-sm">Yes, custom domain connection is available on our Premium and Luxury plans.</p>
            </div>
             <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Is online booking included?</h3>
              <p className="text-muted-foreground text-sm">Online booking integration (with compatible providers) is included in the Premium and Luxury plans.</p>
            </div>
          </div>
        </div>

        {/* Contact Sales Section */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-semibold text-foreground mb-3">Need a custom solution?</h2>
          <p className="text-lg text-muted-foreground mb-6">Contact us for custom features, designs, or multi-location chains.</p>
          <Button size="lg" variant="secondary" onClick={handleContactSales}>
            Contact Sales
          </Button>
        </div>
      </main>
    </div>
  );
}

// Define dummy types if needed elsewhere
interface User { username: string; email?: string; role: 'user' | 'admin'; }
interface SubscriptionPlan { id: number; name: string; description?: string; price: number; features: string[]; isPopular?: boolean; trialDays?: number; }