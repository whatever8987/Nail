// src/pages/Checkout.tsx
import React, { useEffect, useState, FormEvent } from 'react';
// import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js'; // Remove Stripe imports
// import { loadStripe } from '@stripe/stripe-js'; // Remove Stripe imports
// import { useLocation } from 'wouter'; // Remove if not navigating

import { useToast } from '@/hooks/use-toast';
// import { useAuth, User } from '@/context/AuthContext'; // Remove AuthContext import

import { TopNavigation } from '@/components/layout/TopNavigation'; // Assuming standalone
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

// --- Define Dummy Types ---
interface DummyUser { username: string; email?: string; role: 'user' | 'admin'; }

// --- Stripe Initialization Simulation ---
// const stripePublishableKey = "pk_test_DUMMYKEYPROVIDED"; // Use a placeholder if needed for checks
// let stripePromise = stripePublishableKey ? Promise.resolve({}) : null; // Simulate promise resolving
// console.log(stripePublishableKey ? "Stripe key found (dummy)" : "Stripe key missing");

// --- Child Component: Checkout Form Simulation ---
const CheckoutForm = ({ amount, description }: { amount: number, description: string }) => {
  // const stripe = useStripe(); // Remove hook
  // const elements = useElements(); // Remove hook
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  // const [, navigate] = useLocation(); // Remove hook

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    console.log(`Simulating payment confirmation for $${amount.toFixed(2)} - ${description}`);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate success
    toast({ title: "Payment Successful (Simulated)", description: "Thank you for your purchase!" });
    alert("Simulating redirect to portal after successful payment.");
    // navigate("/app/portal", { replace: true }); // Real navigation

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Placeholder for Payment Element */}
      <div className="p-4 border rounded-md bg-muted h-40 flex items-center justify-center">
          <p className="text-muted-foreground text-center text-sm">
            [Stripe Payment Element Placeholder]<br/>
            (Card details would be entered here)
          </p>
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isProcessing} // Disable during simulated processing
      >
        {isProcessing ? (
           <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing... </>
        ) : (
           `Pay $${amount.toFixed(2)}`
        )}
      </Button>
    </form>
  );
};


// --- Main Checkout Page Component ---
export default function Checkout() {
  // Simulate states needed for UI flow
  const [clientSecret, setClientSecret] = useState<string | null>(null); // 'cs_dummysecret_123' or null
  const [amount, setAmount] = useState(50.00); // Example amount
  const [description, setDescription] = useState("Custom Design Service"); // Example description
  const [isLoadingIntent, setIsLoadingIntent] = useState(false);
  // const [, navigate] = useLocation(); // Remove hook
  const { toast } = useToast();
  // Simulate user state
  const user: DummyUser | null = { username: "CheckoutUser", role: "user" };
  const isAuthenticated = !!user;
  const isAuthLoading = false; // Simulate loaded

  // --- Simulate Authentication Check ---
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      console.log("Checkout: Not authenticated simulation.");
      alert("Simulating redirect to login (not authenticated).");
      // navigate(`/login?redirect=/checkout`, { replace: true });
    }
  }, [isAuthenticated, isAuthLoading]);


  // --- Simulate Parsing Initial Amount/Description ---
  useEffect(() => {
    // Simulating reading params without router dependency
    const params = new URLSearchParams("?amount=75.50&description=Urgent%20Fix"); // Example search string
    const amountParam = params.get("amount");
    const descParam = params.get("description");

    if (amountParam) {
      const parsedAmount = parseFloat(amountParam);
      if (!isNaN(parsedAmount) && parsedAmount > 0) {
          console.log("Setting amount from simulated params:", parsedAmount);
          setAmount(parsedAmount);
      }
    }
    if (descParam) {
      console.log("Setting description from simulated params:", descParam);
      setDescription(decodeURIComponent(descParam));
    }
  }, []); // Run only once


  // --- Simulate Function to Create Payment Intent ---
  const handleCreatePayment = async () => {
    if (amount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter amount > 0", variant: "destructive" });
      return;
    }
    if (!isAuthenticated) {
       toast({ title: "Auth Required", description: "Please log in.", variant: "destructive" });
       alert('Simulating redirect to login');
       return;
    }

    setIsLoadingIntent(true);
    setClientSecret(null);
    console.log("Simulating payment intent creation for:", { amount_cents: Math.round(amount * 100), description });

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate success
    setClientSecret(`cs_test_dummy_${Date.now()}`); // Set a dummy secret
    setIsLoadingIntent(false);
     toast({ title: "Ready for Payment", description: "Stripe form loaded." });
  };

  // --- Loading State ---
  // if (isAuthLoading) { // Removed as auth is simulated
  //   return ( <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div> );
  // }

  // --- Render Component ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopNavigation user={user} isLoggedIn={isAuthenticated} />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground">Secure Checkout</h1>
          <p className="text-muted-foreground mt-2">Complete your one-time payment</p>
        </div>

        <Card className="mx-auto max-w-xl shadow-lg">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription> Safe and secure payment processing </CardDescription>
          </CardHeader>

          <CardContent>
            {!clientSecret ? (
              // --- Step 1: Amount/Description Input ---
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Payment Amount (USD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount.toFixed(2)}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="text-lg h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Payment Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder='e.g., Invoice #12345'
                  />
                </div>
                <Button
                  className="w-full h-11 text-base"
                  onClick={handleCreatePayment}
                  disabled={isLoadingIntent || amount <= 0}
                >
                  {isLoadingIntent ? (
                     <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Initializing... </>
                  ) : ( "Continue to Payment" )}
                </Button>
              </div>
            ) : (
              // --- Step 2: Simulated Stripe Payment Element ---
              <>
                <div className="mb-6 p-4 bg-gray-100 rounded-lg border">
                  <div className="flex justify-between text-sm font-semibold"> <span>Amount Due:</span> <span>${amount.toFixed(2)}</span> </div>
                  <div className="flex justify-between text-sm mt-1 text-muted-foreground"> <span>For:</span> <span className="text-right ml-2">{description}</span> </div>
                </div>
                <Separator className="my-4" />

                {/* Remove Elements wrapper, show CheckoutForm directly */}
                {/* Check if clientSecret exists just for flow control */}
                {clientSecret && (
                   <CheckoutForm amount={amount} description={description} />
                )}

              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Define dummy User type if needed elsewhere
interface User { username: string; email?: string; role: 'user' | 'admin'; }