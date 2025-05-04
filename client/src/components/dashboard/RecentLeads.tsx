// src/components/dashboard/RecentLeads.tsx
import React, { useState } from 'react'; // Ensure React is imported
// import { Link, useLocation } from 'wouter'; // Link and useLocation not used directly for display
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

// Define a dummy Salon type for standalone display
interface DummySalon {
  id: number;
  name: string;
  location: string;
  contactStatus: 'notContacted' | 'contacted' | 'interested' | 'subscribed' | 'notInterested';
  sampleUrl: string;
  // Add other fields if your table displays them
}

interface RecentLeadsProps {
    leads?: DummySalon[];
    isLoading?: boolean;
}

// Sample dummy data
const dummyLeadsData: DummySalon[] = [
  { id: 1, name: "Glamour Nails NYC", location: "New York, NY", contactStatus: "notContacted", sampleUrl: "glamour-nyc" },
  { id: 2, name: "LA Nail Art Studio", location: "Los Angeles, CA", contactStatus: "contacted", sampleUrl: "la-nailart" },
  { id: 3, name: "Miami Beach Nails", location: "Miami, FL", contactStatus: "interested", sampleUrl: "miami-beach" },
  { id: 4, name: "Chicago Chic Nails", location: "Chicago, IL", contactStatus: "subscribed", sampleUrl: "chicago-chic" },
  { id: 5, name: "Austin Natural Nails", location: "Austin, TX", contactStatus: "notContacted", sampleUrl: "austin-natural" },
];


export function RecentLeads({ leads = dummyLeadsData, isLoading = false }: RecentLeadsProps) {
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [isContacting, setIsContacting] = useState(false); // For button loading state
  const { toast } = useToast();
  // const [, navigate] = useLocation(); // Not used for standalone display, remove if not navigating

  const toggleSelectLead = (id: number) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((leadId) => leadId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const displayLeads = leads; // Use prop or dummy
    if (displayLeads && displayLeads.length > 0) {
      if (selectedLeads.length === displayLeads.length) {
        setSelectedLeads([]);
      } else {
        setSelectedLeads(displayLeads.map((lead) => lead.id));
      }
    }
  };

  const contactSelectedLeads = async () => {
    if (selectedLeads.length === 0) {
      toast({
        title: "No leads selected",
        description: "Please select at least one lead to contact.",
        variant: "destructive",
      });
      return;
    }

    setIsContacting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Action Simulated!",
      description: `${selectedLeads.length} lead(s) would be marked as contacted.`,
    });
    setSelectedLeads([]); // Clear selection
    setIsContacting(false);
  };

  const getStatusBadge = (status: DummySalon['contactStatus']) => {
    switch (status) {
      case "notContacted":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200">Not Contacted</Badge>;
      case "contacted":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200">Contacted</Badge>;
      case "interested":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200">Interested</Badge>;
      case "subscribed":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200">Subscribed</Badge>;
      case "notInterested":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 hover:bg-red-200">Not Interested</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200">Unknown</Badge>;
    }
  };

  const displayLeads = leads; // Use prop or dummy

  return (
    <div className="mt-10">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h3 className="text-lg leading-6 font-medium text-foreground">Recent Leads</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Track salon owners who might be interested in your service.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-4 sm:flex-none"> {/* Adjusted ml-16 */}
          <Button
            onClick={contactSelectedLeads}
            disabled={selectedLeads.length === 0 || isContacting}
            className="inline-flex items-center"
          >
            {isContacting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Mail className="mr-2 h-4 w-4" />
            )}
            Email Selected
          </Button>
        </div>
      </div>
      <Card className="mt-4 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto"> {/* Ensure horizontal scroll on small screens */}
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50"> {/* Use theme variable */}
                <tr>
                  <th scope="col" className="relative px-6 py-3 sm:w-12 sm:px-6"> {/* Adjusted padding for checkbox */}
                    <Checkbox
                      checked={
                        displayLeads && displayLeads.length > 0
                          ? selectedLeads.length === displayLeads.length
                          : false
                      }
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all leads"
                      className="absolute left-4 top-1/2 -mt-2"
                    />
                  </th>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-foreground sm:pl-0"> {/* Adjusted padding */}
                    Salon
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground hidden sm:table-cell">
                    Location
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground hidden md:table-cell">
                    Sample URL
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {isLoading ? (
                  Array(5) // Show 5 skeleton rows
                    .fill(0)
                    .map((_, index) => (
                      <tr key={`skeleton-${index}`}>
                        <td className="relative px-6 py-4 sm:w-12 sm:px-6">
                            <Skeleton className="h-4 w-4 absolute left-4 top-1/2 -mt-2" />
                        </td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-0">
                           <Skeleton className="h-5 w-3/4" />
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground hidden sm:table-cell">
                             <Skeleton className="h-5 w-2/3" />
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                           <Skeleton className="h-6 w-24" />
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-primary hidden md:table-cell">
                             <Skeleton className="h-5 w-full" />
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                           <Skeleton className="h-8 w-16 inline-block mr-2" />
                           <Skeleton className="h-8 w-16 inline-block" />
                        </td>
                      </tr>
                    ))
                ) : displayLeads && displayLeads.length > 0 ? (
                  displayLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-muted/50 transition-colors">
                      <td className="relative px-6 py-4 sm:w-12 sm:px-6">
                        <Checkbox
                          checked={selectedLeads.includes(lead.id)}
                          onCheckedChange={() => toggleSelectLead(lead.id)}
                          aria-label={`Select ${lead.name}`}
                           className="absolute left-4 top-1/2 -mt-2"
                        />
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-foreground sm:pl-0">
                        {lead.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground hidden sm:table-cell">
                        {lead.location}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        {getStatusBadge(lead.contactStatus)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-primary hidden md:table-cell">
                        {/* Use a simple span for display, Link is not needed for standalone */}
                        <span className="hover:underline cursor-pointer" onClick={() => alert(`View demo: ${lead.sampleUrl}`)}>
                          {lead.sampleUrl}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Button
                          variant="link"
                          size="sm"
                          className="text-primary hover:text-primary/80 h-auto p-1 mr-1" // Make link buttons smaller
                          onClick={() => alert(`Edit lead: ${lead.id}`)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="link"
                           size="sm"
                          className="text-primary hover:text-primary/80 h-auto p-1"
                          onClick={() => alert(`Contact lead: ${lead.id}`)}
                        >
                          Contact
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-sm text-muted-foreground"> {/* Increased padding */}
                      No leads found. Generate a sample site to create leads.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}