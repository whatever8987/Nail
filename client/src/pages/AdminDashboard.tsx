import { TopNavigation } from "@/components/layout/TopNavigation";
import { TabNavigation } from "@/components/layout/TabNavigation";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { NewSampleSiteCreator } from "@/components/dashboard/NewSampleSiteCreator";
import { RecentLeads } from "@/components/dashboard/RecentLeads";
import { TemplateGallery } from "@/components/dashboard/TemplateGallery";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const currentPath = window.location.pathname;
  
  // Extract the active tab from the URL path
  let activeTab = "dashboard";
  if (currentPath.includes("/admin/leads")) {
    activeTab = "leads";
  } else if (currentPath.includes("/admin/samples")) {
    activeTab = "samples";
  } else if (currentPath.includes("/admin/subscriptions")) {
    activeTab = "subscriptions";
  }
  
  const { data: user, isLoading: isLoadingUser } = useQuery<User | null>({
    queryKey: ["/api/user/me"],
    retry: false,
  });

  // Admin tabs configuration
  const tabs = [
    { name: "Dashboard", href: "/admin/dashboard" },
    { name: "Lead Management", href: "/admin/leads" },
    { name: "Sample Websites", href: "/admin/samples" },
    { name: "Subscriptions", href: "/admin/subscriptions" },
  ];

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    // Redirect non-admin users to dashboard
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation user={user} isLoggedIn={true} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
        
        <TabNavigation tabs={tabs} activeTab={activeTab} />
        
        {/* Dashboard overview - always show on all admin pages */}
        <DashboardOverview />
        
        {/* Content specific to tabs */}
        {activeTab === "dashboard" && (
          <div className="mt-6 space-y-8">
            <h2 className="text-xl font-semibold">Platform Overview</h2>
            {/* Platform stats would go here */}
          </div>
        )}
        
        {/* Lead management tab */}
        {activeTab === "leads" && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Lead Management</h2>
            <RecentLeads />
          </div>
        )}
        
        {/* Sample websites tab */}
        {activeTab === "samples" && (
          <div className="mt-6 space-y-8">
            <h2 className="text-xl font-semibold mb-4">Sample Websites</h2>
            <NewSampleSiteCreator />
            <TemplateGallery />
          </div>
        )}
        
        {/* Subscriptions tab */}
        {activeTab === "subscriptions" && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Subscription Management</h2>
            {/* Subscription management content would go here */}
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-gray-500">Manage customer subscriptions, review payment history, and handle subscription changes.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}