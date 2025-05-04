// src/components/dashboard/SubscriptionPlans.tsx
import React from 'react'; // Import React
// import { useLocation } from 'wouter'; // Remove navigation hooks if not navigating
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Define dummy SubscriptionPlan type
interface DummySubscriptionPlan {
  id: number;
  name: string;
  description?: string; // Optional description
  price: number; // Using simple price number for display
  features: string[];
  isPopular?: boolean;
}

interface SubscriptionPlansProps {
    plans?: DummySubscriptionPlan[];
    isLoading?: boolean;
}

// Sample dummy data
const dummyPlansData: DummySubscriptionPlan[] = [
    {
      id: 1,
      name: "Basic",
      price: 79,
      description: "Everything needed for a standard salon website.",
      features: ["Custom subdomain", "Mobile-friendly design", "Basic content management", "Email support"],
      isPopular: true,
    },
    {
      id: 2,
      name: "Premium",
      price: 149,
      description: "Enhanced features for growing salons.",
      features: ["All Basic features", "Custom domain connection", "Online booking integration", "Priority support"],
      isPopular: false,
    },
    {
      id: 3,
      name: "Luxury",
      price: 239,
       description: "Full-service solution for high-end salons.",
      features: ["All Premium features", "Custom design modifications", "SEO optimization", "Dedicated support manager"],
      isPopular: false,
    },
];

export function SubscriptionPlans({ plans = dummyPlansData, isLoading = false }: SubscriptionPlansProps) {
  // const [, navigate] = useLocation(); // Remove if not navigating

  const handleSelectPlan = (planId: number) => {
    // Simulate navigation or action
    alert(`Simulating navigation to subscribe page with Plan ID: ${planId}`);
    // navigate(`/subscribe?planId=${planId}`); // Real navigation
  };

  const displayPlans = plans; // Use passed prop or dummy data

  return (
    // Removed Card wrapper from original, assuming it's used within another card/section
    <div className="mt-10">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(isLoading ? Array(3).fill(0) : displayPlans).map((planOrSkeleton, index) =>
          isLoading ? (
            // Skeleton Loader Card
            <div key={`skeleton-${index}`} className="relative p-6 border border-border rounded-lg bg-card">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-10 w-1/2 mb-4" />
              <Skeleton className="h-4 w-full mb-6" />
              <div className="space-y-3 mb-8">
                {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-4 w-5/6" />)}
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            // Actual Plan Card
            <div
              key={(planOrSkeleton as DummySubscriptionPlan).id}
              className={`relative p-6 border rounded-lg flex flex-col ${
                (planOrSkeleton as DummySubscriptionPlan).isPopular ? "border-2 border-primary shadow-lg" : "border-border bg-card shadow-sm"
              }`}
            >
              {(planOrSkeleton as DummySubscriptionPlan).isPopular && (
                <div className="absolute -top-px right-4">
                    <div className="relative py-1 px-3 bg-primary text-center text-primary-foreground text-xs font-semibold rounded-b-md shadow-md">
                    Popular
                    </div>
                </div>
                // Alternative ribbon style:
                // <div className="absolute top-0 right-0 h-16 w-16 overflow-hidden">
                //   <div className="absolute transform rotate-45 bg-primary text-center text-white font-semibold py-1 right-[-35px] top-[32px] w-[170px]">
                //     Most Popular
                //   </div>
                // </div>
              )}
              <h3 className="text-lg font-semibold text-foreground">{(planOrSkeleton as DummySubscriptionPlan).name}</h3>
              <p className="mt-4 flex items-baseline text-foreground">
                <span className="text-4xl font-bold tracking-tight">
                  ${(planOrSkeleton as DummySubscriptionPlan).price}
                </span>
                <span className="ml-1 text-base font-medium text-muted-foreground">/mo</span>
              </p>
              <p className="mt-4 text-sm text-muted-foreground h-10"> {/* Fixed height for description */}
                {(planOrSkeleton as DummySubscriptionPlan).description || `Get started with the ${(planOrSkeleton as DummySubscriptionPlan).name} plan.`}
              </p>

              <ul role="list" className="mt-6 space-y-3 text-sm flex-grow">
                {(planOrSkeleton as DummySubscriptionPlan).features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-px flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button
                  className={`w-full`}
                  variant={(planOrSkeleton as DummySubscriptionPlan).isPopular ? "default" : "outline"}
                  onClick={() => handleSelectPlan((planOrSkeleton as DummySubscriptionPlan).id)}
                >
                  Select Plan
                </Button>
              </div>
            </div>
          ))}
        {(displayPlans.length === 0 && !isLoading) && (
           <p className="col-span-full text-center text-muted-foreground py-10">No subscription plans currently available.</p>
        )}
      </div>

      {/* Footer Text (can be kept) */}
      <div className="mt-8 text-center">
        <div className="flex items-center justify-center">
          <CreditCard className="h-5 w-5 text-green-500" />
          <span className="ml-2 text-sm text-muted-foreground">
            All plans include secure Stripe integration.
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Free 14-day trial available for all plans. No credit card required to start.
        </p>
      </div>
    </div>
  );
}

// Define Dummy SubscriptionPlan type if needed elsewhere without API calls
interface SubscriptionPlan {
  id: number;
  name: string;
  price: number; // Assuming simple price for display
  features: string[];
  isPopular?: boolean;
}