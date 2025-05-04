// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react'; // Import React
// import { useLocation } from 'wouter'; // Keep if using navigate for buttons
import { useNavigate } from 'react-router-dom'; // Or use react-router navigate
import { TopNavigation } from '@/components/layout/TopNavigation';
import { TabNavigation } from '@/components/layout/TabNavigation';
import { TemplateGallery } from '@/components/dashboard/TemplateGallery'; // Assuming standalone
import { SubscriptionPlans } from '@/components/dashboard/SubscriptionPlans'; // Assuming standalone
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Removed unused Card imports
import {
  Loader2,
  Edit,
  Eye,
  CreditCard,
  Settings,
  Sparkles,
  Globe,
  LineChart,
  Palette,
  BarChart4,
  CheckCircle,
  ArrowRight
} from "lucide-react";

// --- Dummy Data and Types ---
interface DummyUser { username: string; email?: string; role: 'user' | 'admin'; stripeSubscriptionId?: string | null; }
interface DummySalon { id: number; name: string; location: string; templateId?: number | null; sampleUrl: string; claimedAt?: string | Date | null; }
interface DummyTemplate { id: number; name: string; description?: string; } // Needed if TemplateGallery is used

// Sample dummy data
const dummyUserData: DummyUser | null = { username: "demoUser", role: "user", stripeSubscriptionId: "sub_fake123" };
// const dummyUserData: DummyUser | null = null; // Simulate logged out
// const dummyUserData: DummyUser | null = { username: "demoAdmin", role: "admin" }; // Simulate admin
const dummySalonData: DummySalon | null = { id: 1, name: "Demo Salon", location: "Virtual City", sampleUrl: "demo-salon-vc", claimedAt: new Date() };
// const dummySalonData: DummySalon | null = null; // Simulate no salon yet

export default function Dashboard() {
  const [activeTab] = useState("dashboard"); // Keep for TabNavigation active state simulation
  // const [, navigate] = useLocation(); // Use wouter navigate
  const navigate = useNavigate(); // Or use react-router navigate

  // Use dummy data directly
  const user = dummyUserData;
  const userSalon = dummySalonData;
  const isLoadingUser = false; // Simulate loaded
  const isLoadingSalon = false;

  const isLoggedIn = !!user;

  // Simulate admin redirect (if needed for UI testing)
  useEffect(() => {
    if (user?.role === "admin") {
       console.log("Simulating redirect to admin dashboard");
      // In a real app with routing: navigate("/admin/dashboard", { replace: true });
    }
  }, [user]);

  // Tabs definition
  const userTabs = [
    { name: "Dashboard", href: "/" }, // Assuming base path '/' maps to Dashboard for logged in
    { name: "My Website", href: "/portal" },
    { name: "Billing", href: "/subscribe" },
    { name: "Account", href: "/account" },
  ];

  // Simulate loading state
  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Pass dummy data/state to TopNavigation */}
      <TopNavigation user={user} isLoggedIn={isLoggedIn} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Dashboard Header */}
        <div className="py-4 md:py-10 mb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/10 text-secondary mb-2">
                <Sparkles className="h-4 w-4 mr-2" /> Salon Dashboard
              </div>
              <h1 className="text-3xl font-bold text-foreground">Welcome{user ? `, ${user.username}` : ''}!</h1>
              <p className="text-muted-foreground">Manage your salon website and subscription here.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => alert('Navigate to Account')}>
                <Settings className="h-4 w-4 mr-2" />
                Account Settings
              </Button>
              <Button className="gradient-bg border-0" onClick={() => alert('Navigate to Portal')}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Website
              </Button>
            </div>
          </div>
          {/* Simulate active tab */}
          <TabNavigation tabs={userTabs} activeHref={activeTab === 'dashboard' ? '/' : `/${activeTab}`} />
        </div>

        {/* Website Status */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Globe className="h-5 w-5 mr-2 text-primary" /> Website Status
          </h2>
           {/* Using glass-card requires custom CSS not included here - using standard Card */}
           <Card className="overflow-hidden border shadow-sm">
             {isLoadingSalon ? (
              <CardContent className="p-8 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </CardContent>
            ) : userSalon ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{userSalon.name}</CardTitle>
                      <CardDescription>{userSalon.location}</CardDescription>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      <CheckCircle className="h-3 w-3 mr-1" /> Active
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-6 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Template</p>
                      {/* Needs actual template name based on ID */}
                      <p className="text-foreground font-medium">Template #{userSalon.templateId || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">URL</p>
                      <a
                        href="#" // Prevent navigation
                        onClick={(e) => { e.preventDefault(); alert(`View demo/${userSalon.sampleUrl}`); }}
                        className="text-primary hover:underline font-medium flex items-center break-all"
                      >
                        .../demo/{userSalon.sampleUrl}
                        <ArrowRight className="h-3 w-3 ml-1 flex-shrink-0" />
                      </a>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Claimed On</p>
                      <p className="text-foreground font-medium">
                        {userSalon.claimedAt ? new Date(userSalon.claimedAt).toLocaleDateString() : 'Not Claimed'}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <div className="bg-muted/50 border-t p-4 flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => alert(`View demo/${userSalon.sampleUrl}`)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Site
                  </Button>
                  <Button className="gradient-bg border-0" size="sm" onClick={() => alert('Navigate to Portal')}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Content
                  </Button>
                </div>
              </>
            ) : (
              <CardContent className="p-8 text-center">
                 <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">Get Started with Your Website</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">You don't have a salon website set up yet. Create one in minutes.</p>
                <div className="flex justify-center">
                  <Button onClick={() => alert('Navigate to Portal')} className="gradient-bg border-0 px-8">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Set Up Your Website
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
           <h2 className="text-xl font-bold mb-6 flex items-center text-foreground">
             <Palette className="h-5 w-5 mr-2 text-secondary" /> Quick Actions
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Edit Content */}
             <Card className="transition-shadow hover:shadow-lg overflow-hidden">
               <CardContent className="p-6 flex flex-col h-full">
                 <div className="h-12 w-12 rounded-lg gradient-bg flex items-center justify-center mb-4"><Edit className="h-6 w-6 text-white" /></div>
                 <h3 className="text-lg font-bold mb-2 text-foreground">Manage Content</h3>
                 <p className="text-muted-foreground text-sm mb-6 flex-grow">Update services, photos, info.</p>
                 <Button variant="outline" className="w-full" onClick={() => alert('Navigate to Portal')}>Edit Website</Button>
               </CardContent>
             </Card>
             {/* Card 2: Billing */}
             <Card className="transition-shadow hover:shadow-lg overflow-hidden">
               <CardContent className="p-6 flex flex-col h-full">
                 <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center mb-4"><CreditCard className="h-6 w-6 text-secondary-foreground" /></div>
                 <h3 className="text-lg font-bold mb-2 text-foreground">Billing & Subscription</h3>
                 <p className="text-muted-foreground text-sm mb-6 flex-grow">Update payment or change plan.</p>
                 <Button variant="outline" className="w-full" onClick={() => alert('Navigate to Subscribe')}>Manage Subscription</Button>
               </CardContent>
             </Card>
              {/* Card 3: One-time Payment */}
             <Card className="transition-shadow hover:shadow-lg overflow-hidden">
               <CardContent className="p-6 flex flex-col h-full">
                 <div className="h-12 w-12 rounded-lg bg-amber-500 flex items-center justify-center mb-4"><Sparkles className="h-6 w-6 text-white" /></div>
                 <h3 className="text-lg font-bold mb-2 text-foreground">One-time Services</h3>
                 <p className="text-muted-foreground text-sm mb-6 flex-grow">Pay for custom services.</p>
                 <Button variant="outline" className="w-full" onClick={() => alert('Navigate to Checkout')}>Make a Payment</Button>
               </CardContent>
             </Card>
           </div>
         </div>

        {/* Data Overview (Dummy values) */}
        <div className="mb-12">
           <h2 className="text-xl font-bold mb-6 flex items-center text-foreground">
             <BarChart4 className="h-5 w-5 mr-2 text-purple-500" /> Analytics Overview (Sample)
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {[
                {title: "Total Visits", value: 128, change: 12, icon: LineChart, color: "text-purple-500"},
                {title: "Appt. Requests", value: 24, change: 8, icon: LineChart, color: "text-blue-500"},
                {title: "Page Views", value: 349, change: 15, icon: LineChart, color: "text-cyan-500"},
                {title: "Avg. Time on Site", value: "2:34", change: 5, icon: LineChart, color: "text-emerald-500"},
             ].map(item => (
                 <Card key={item.title} className="shadow-sm">
                   <CardContent className="p-6">
                     <div className="flex justify-between items-start mb-4">
                       <h3 className="text-sm font-medium text-muted-foreground">{item.title}</h3>
                       <item.icon className={`h-5 w-5 ${item.color}`} />
                     </div>
                     <p className="text-3xl font-bold mb-1 text-foreground">{item.value}</p>
                     <p className="text-sm text-green-600">+{item.change}% this month</p>
                   </CardContent>
                 </Card>
             ))}
           </div>
         </div>

        {/* Conditionally render TemplateGallery/SubscriptionPlans based on dummy data */}
        {(!userSalon?.templateId) && (
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-6 flex items-center text-foreground">
              <Palette className="h-5 w-5 mr-2 text-indigo-500" /> Choose a Template
            </h2>
            <TemplateGallery isLoading={isLoadingTemplates} /> {/* Pass loading state */}
          </div>
        )}

        {(!user?.stripeSubscriptionId) && (
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-6 flex items-center text-foreground">
              <CreditCard className="h-5 w-5 mr-2 text-emerald-500" /> Subscription Plans
            </h2>
            {/* Assuming SubscriptionPlans component is also standalone or takes props */}
            <SubscriptionPlans />
          </div>
        )}
      </main>
    </div>
  );
}

// Define dummy types needed by the component if not imported
interface User { username: string; email?: string; role: 'user' | 'admin'; stripeSubscriptionId?: string | null; }
interface Salon { id: number; name: string; location: string; templateId?: number | null; sampleUrl: string; claimedAt?: string | Date | null; description?: string | null; services?: string[] | null; openingHours?: string | null; email?: string | null; phoneNumber?: string | null; claimed?: boolean }
interface Template { id: number; name: string; description?: string } // Add Template type if needed by TemplateGallery