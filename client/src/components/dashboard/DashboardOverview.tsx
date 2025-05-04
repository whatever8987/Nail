// src/components/dashboard/DashboardOverview.tsx
import React from 'react'; // Ensure React is imported
import { ArrowUpIcon, ArrowDownIcon, Store, LayoutGrid, CreditCard, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Define a dummy Stats type for standalone display
interface DummyStats {
  totalSalons: number;
  sampleSites: number;
  activeSubscriptions: number;
  pendingContacts: number;
}

interface DashboardOverviewProps {
  stats?: DummyStats; // Make stats optional
  isLoading?: boolean; // Add isLoading prop for standalone control
}

// Sample dummy data if no props are passed
const dummyStatsData: DummyStats = {
  totalSalons: 125,
  sampleSites: 78,
  activeSubscriptions: 42,
  pendingContacts: 15,
};

export function DashboardOverview({ stats = dummyStatsData, isLoading = false }: DashboardOverviewProps) {
  // Use passed stats or default to dummy data
  const displayStats = stats;

  const statItems = [
    {
      name: "Total Salons",
      value: displayStats?.totalSalons,
      change: 12,
      changeType: "increase" as const,
      icon: Store,
      bgColor: "bg-blue-500", // Use Tailwind default colors or your theme's primary
    },
    {
      name: "Sample Sites",
      value: displayStats?.sampleSites,
      change: 8,
      changeType: "increase" as const,
      icon: LayoutGrid,
      bgColor: "bg-indigo-500", // Use Tailwind default colors or your theme's accent
    },
    {
      name: "Active Subscriptions",
      value: displayStats?.activeSubscriptions,
      change: 20,
      changeType: "increase" as const,
      icon: CreditCard,
      bgColor: "bg-green-500", // Use Tailwind default colors or your theme's secondary
    },
    {
      name: "Pending Contacts",
      value: displayStats?.pendingContacts,
      change: 5,
      changeType: "decrease" as const,
      icon: HelpCircle,
      bgColor: "bg-yellow-500", // Use Tailwind default colors or a warning color
    },
  ];

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-foreground">Admin Dashboard</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Monitor your salon website platform performance at a glance.
      </p>

      <dl className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {(isLoading ? Array(4).fill(0) : statItems).map((item, index) =>
          isLoading ? (
            <Card key={`skeleton-${index}`} className="overflow-hidden">
                <CardContent className="p-0">
                    <div className="relative bg-card pt-5 px-4 pb-6 sm:pt-6 sm:px-6">
                        <dt>
                            <div className={`absolute bg-muted rounded-md p-3`}>
                                <Skeleton className="h-5 w-5" />
                            </div>
                            <Skeleton className="ml-16 h-5 w-24" />
                        </dt>
                        <dd className="ml-16 pb-6 flex items-baseline">
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="ml-2 h-5 w-12" />
                        </dd>
                    </div>
                </CardContent>
            </Card>
          ) : (
          <Card key={item.name} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="relative bg-card pt-5 px-4 pb-6 sm:pt-6 sm:px-6">
                <dt>
                  <div className={`absolute ${item.bgColor} rounded-md p-3 shadow-md`}>
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="ml-16 text-sm font-medium text-muted-foreground truncate">
                    {item.name}
                  </p>
                </dt>
                <dd className="ml-16 pb-6 flex items-baseline">
                    <p className="text-2xl font-semibold text-foreground">
                      {item.value !== undefined ? item.value : 0}
                    </p>
                  <p
                    className={`ml-2 flex items-baseline text-sm font-semibold ${
                      item.changeType === "increase"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {item.changeType === "increase" ? (
                      <ArrowUpIcon className="h-4 w-4 self-center" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4 self-center" />
                    )}
                    <span className="sr-only">
                      {item.changeType === "increase" ? "Increased" : "Decreased"} by
                    </span>
                    {item.change}%
                  </p>
                </dd>
              </div>
            </CardContent>
          </Card>
          )
        )}
      </dl>
    </div>
  );
}