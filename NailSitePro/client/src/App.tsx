import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import SampleSite from "@/pages/SampleSite"; // This component will handle both /demo and /preview
import ClientPortal from "@/pages/ClientPortal";
import Subscribe from "@/pages/Subscribe";
import Checkout from "@/pages/Checkout";
import LandingPage from "@/pages/LandingPage";
import Templates from "@/pages/Templates";
import Pricing from "@/pages/Pricing";
import Account from "@/pages/Account";
import Contact from "@/pages/Contact";
import SalonsPage from "@/pages/SalonsPage"; // Import the new SalonsPage component
//import Blog from "@/pages/Blog";
//import BlogPost from "@/pages/BlogPost";
import { Chatbot } from "@/components/common/Chatbot";
import { useEffect } from "react";

function Router() {
  const [location] = useLocation();

  useEffect(() => {
    console.log("Current route:", location);
  }, [location]);

  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Route for real sample sites loaded by sampleUrl */}
      <Route path="/demo/:sampleUrl" component={SampleSite} />

      {/* Route for template previews loaded by templateId */}
      <Route path="/preview/:templateId" component={SampleSite} />

      <Route path="/pricing" component={Pricing} />
      <Route path="/templates" component={Templates} />
      <Route path="/contact" component={Contact} />

      {/* NEW: Route for the public Salons listing page */}
      <Route path="/salons" component={SalonsPage} />

      {/* Protected User Routes */}
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/portal" component={ClientPortal} />
      <ProtectedRoute path="/account" component={Account} />
      <ProtectedRoute path="/subscribe" component={Subscribe} />
      <ProtectedRoute path="/checkout" component={Checkout} />

      {/* Protected Admin Routes */}
      <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} adminOnly />
      <ProtectedRoute path="/admin/leads" component={AdminDashboard} adminOnly />
      <ProtectedRoute path="/admin/samples" component={AdminDashboard} adminOnly />
      <ProtectedRoute path="/admin/subscriptions" component={AdminDashboard} adminOnly />

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
        <Chatbot />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;