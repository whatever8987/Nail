// src/App.tsx
import React from 'react';
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter"; // Added Redirect
import { TooltipProvider } from "@/components/ui/tooltip";
// import { AuthProvider } from '@/context/AuthContext'; // Keep commented out for pure UI display
// import ProtectedRoute from "@/lib/protected-route"; // Keep commented out for pure UI display

// --- Layout and Common Components ---
import { TopNavigation } from '@/components/layout/TopNavigation';
import Chatbot from '@/Chatbot';
// import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'; // Optional

// --- Page Components (Import the standalone versions) ---
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
// import AdminDashboard from "@/pages/AdminDashboard"; // Placeholder for Admin
import Login from "@/pages/Login";
import Register from "@/pages/Register";
// import SampleSite from "@/pages/SampleSite"; // Using SalonPage for demo route
import ClientPortal from "@/pages/ClientPortal";
import Subscribe from "@/pages/Subscribe";
import Checkout from "@/pages/Checkout"; // Assuming you have this page component
import LandingPage from "@/pages/LandingPage";
import Templates from "@/pages/Templates";
import Pricing from "@/pages/Pricing";
import Account from "@/pages/Account";
import Contact from "@/pages/Contact";
import SalonListPage from "@/pages/SalonListPage"; // Page to list salons
import SalonPage from "@/pages/SalonPage";       // Page to display a single demo salon

import { Toaster } from "@/components/ui/sonner"; // Assuming SonnerToaster is a named export

// --- Placeholder for Admin Dashboard ---
const AdminDashboardPlaceholder = () => (
    <div className="p-8 bg-red-100 border border-red-300 rounded-md">
        <h2 className="text-xl font-bold text-red-800">Admin Dashboard Placeholder</h2>
        <p className="text-red-700 mt-2">This page requires admin privileges and API connection.</p>
    </div>
);


const ProtectedRoutePlaceholder: React.FC<{ component: React.ComponentType<any>, path: string, adminOnly?: boolean }> = ({ component: Component, ...rest }) => {
    console.log(`Rendering placeholder for protected route: ${rest.path}`);
    // Simulate being logged in for UI display purposes
    const isAuthorized = true; // Change to false to test unauthorized view (though redirect won't work)
    const isAdminAuthorized = !rest.adminOnly || (rest.adminOnly && true); // Simulate admin access if needed

    if (isAuthorized && isAdminAuthorized) {
        return <Route {...rest} component={Component} />;
    } else {
        // In real app, useEffect would redirect. Here, just render placeholder.
        return (
             <div className="p-8 bg-yellow-100 border border-yellow-300 rounded-md">
                <p className="text-yellow-800">Access Denied Placeholder (Would redirect to Login)</p>
             </div>
        );
    }
};


// --- This component defines the actual routes ---
function AppRouter() {
  // const [location] = useLocation(); // Remove if not used for logging

  // useEffect(() => {
  //   console.log("Current route (relative):", location);
  // }, [location]);

  return (
    <Switch>
      {/* --- Public Routes --- */}
      <Route path="/" component={LandingPage} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/templates" component={Templates} />
      <Route path="/contact" component={Contact} />
      <Route path="/salons" component={SalonListPage} /> {/* List public salons */}
      {/* Use SalonPage for the demo route */}
      <Route path="/demo/:sampleUrl" component={SalonPage} />

      {/* --- Auth Routes --- */}
      {/* These will display the UI but login/register logic is simulated */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* --- Protected Routes (Using Placeholders for UI Display) --- */}
      {/* Dashboard/Portal might redirect based on internal logic in real app */}
      <ProtectedRoutePlaceholder path="/dashboard" component={Dashboard} />
      {/* Redirect base path for SPA root to dashboard */}
      <Route path="/"><Redirect to="/dashboard" /></Route>

      <ProtectedRoutePlaceholder path="/portal" component={ClientPortal} />
      <ProtectedRoutePlaceholder path="/account" component={Account} />
      <ProtectedRoutePlaceholder path="/subscribe" component={Subscribe} />
      <ProtectedRoutePlaceholder path="/checkout" component={Checkout} />


      {/* --- Fallback --- */}
      <Route component={NotFound} />
    </Switch>
  );
}

// --- Main App Component ---
function App() {
  // Define the base path IF your Django setup requires it (e.g., /app/)
  // If React handles all routes from root, base can be "/" or omitted.
  // For standalone display, base path doesn't strictly matter unless links depend on it.
  const base = "/"; // Assuming running standalone at root for now


  return (
   
    <TooltipProvider>
      {/* WouterRouter provides routing context */}
      <WouterRouter base={base}>
        {/* Render TopNavigation with simulated state */}
      

        {/* Main content area where routes are rendered */}
        <main className="flex-grow"> {/* Ensure main takes up space */}
          <AppRouter /> {/* Render the routes */}
        </main>

        {/* Render Chatbot globally */}
        <Chatbot />
        {/* Render Toaster globally */}

        {/* Render Sonner globally */}
        <Toaster />
      </WouterRouter>
    </TooltipProvider>

  );
}

export default App;