// src/App.tsx (or Router.tsx)

import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "./lib/protected-route"; // Make sure this is correctly imported

// Import your page components
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import SampleSite from "@/pages/SampleSite"; // This component will handle both /salons/sample and /preview
import ClientPortal from "@/pages/ClientPortal"; // Assuming this handles /portal
// import YourSalonCreationPage from "@/pages/YourSalonCreationPage"; // If you have a specific create page component
import Subscribe from "@/pages/Subscribe";
import Checkout from "@/pages/Checkout";
import LandingPage from "@/pages/LandingPage";
import Templates from "@/pages/Templates"; // The TemplatesPage component
import Pricing from "@/pages/Pricing";
import Account from "@/pages/Account";
import Contact from "@/pages/Contact";
import SalonsPage from "@/pages/SalonsPage"; // Import SalonsPage
// import Blog from "@/pages/Blog";
// import BlogPost from "@/pages/BlogPost";

import { Chatbot } from "@/components/common/Chatbot";
import { useEffect } from "react";

// Assuming you have a simple HomePage component
// const HomePage = () => <div>Welcome Home!</div>;
// Replace with your actual HomePage component if it exists
// import HomePage from "@/pages/HomePage"; // Uncomment if you have a specific HomePage

function Router() {
  const [location] = useLocation();

  useEffect(() => {
    // Optional: Log route changes for debugging
    // console.log("Current route:", location);
  }, [location]);

  return (
    <Switch>
      {/* Public Routes */}
      {/* Assuming LandingPage is the actual home page */}
      <Route path="/" component={LandingPage} />
      {/* If you have a separate HomePage that is also public, add it here */}
      {/* <Route path="/home" component={HomePage} /> */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Route for viewing a SPECIFIC Salon's site (real site mode in SampleSite) */}
      {/* Matches URLs like /salons/sample/luxurynail */}
      {/* Pass the sampleUrl param to the SampleSite component */}
      <Route path="/salons/sample/:sampleUrl">
          {params => <SampleSite sampleUrl={params.sampleUrl} />}
      </Route>

      {/* Route for viewing a TEMPLATE PREVIEW (preview mode in SampleSite) */}
      {/* Matches URLs like /preview/template/18 */}
      {/* Pass the templateId param to the SampleSite component */}
      <Route path="/preview/template/:templateId">
          {params => <SampleSite templateId={params.templateId} />}
      </Route>

      {/* Route for the public Salons listing page */}
      {/* Assuming SalonsPage is public */}
      <Route path="/salons" component={SalonsPage} />


      {/* Other Public or General Routes */}
      <Route path="/pricing" component={Pricing} />

      {/* --- MODIFIED LINE: Protect the Templates route and make it adminOnly --- */}
      {/* Replaced <Route> with <ProtectedRoute> and added adminOnly prop */}
      <ProtectedRoute path="/templates" component={Templates} adminOnly />
      {/* --- END MODIFIED LINE --- */}

      <Route path="/contact" component={Contact} />


      {/* Protected User Routes */}
      {/* Use ProtectedRoute for routes requiring login */}
      {/* The 'userHasSalon' check inside TemplatesPage and SampleSite is good for UI,
          but ProtectedRoute should enforce the access restriction first.
          If '/dashboard' is the default logged-in user page, it should be Protected. */}
      <ProtectedRoute path="/dashboard" component={Dashboard} />

      {/* Client Portal Routes */}
      {/* These should definitely be protected as they involve managing user data */}
      <ProtectedRoute path="/portal" component={ClientPortal} />
      {/* This route likely passes a templateId to ClientPortal to start creation */}
      <ProtectedRoute path="/portal/create" component={ClientPortal} />

      {/* Account Management, Subscription, Checkout */}
      <ProtectedRoute path="/account" component={Account} />
      <ProtectedRoute path="/subscribe" component={Subscribe} />
      <ProtectedRoute path="/checkout" component={Checkout} />

      {/* Protected Admin Routes */}
      {/* These already correctly use ProtectedRoute and adminOnly */}
      <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} adminOnly />
      <ProtectedRoute path="/admin/leads" component={AdminDashboard} adminOnly />
      <ProtectedRoute path="/admin/samples" component={AdminDashboard} adminOnly />
      <ProtectedRoute path="/admin/subscriptions" component={AdminDashboard} adminOnly />

      {/* Optional: Blog routes if needed */}
      {/* <Route path="/blog" component={Blog} /> */}
      {/* <Route path="/blog/:slug" component={BlogPost} /> */}

      {/* Fallback - This should be the very last route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        {/* Chatbot is rendered outside the Switch so it's always present */}
        <Chatbot />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;