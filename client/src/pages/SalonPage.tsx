// src/pages/SalonPage.tsx (This is likely the /demo/:sampleUrl route)
import React from 'react'; // Import React
// import { useParams, Link } from 'wouter'; // Remove routing hooks
import { TopNavigation } from "@/components/layout/TopNavigation"; // Assuming standalone or props based
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Phone, Mail, Clock, Scissors, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

// Define dummy types
interface DummyUser { username: string; email?: string; role: 'user' | 'admin'; }
interface DummySalon {
  id: number | string;
  name: string;
  location: string;
  address?: string | null;
  phone_number?: string | null;
  email?: string | null;
  description?: string | null;
  services?: string[] | null;
  opening_hours?: string | null;
  sample_url: string; // Keep for display/context
  // templateId?: number | null; // Not strictly needed for display
}

interface SalonPageProps {
    salon?: DummySalon | null;
    isLoading?: boolean;
    error?: Error | null;
    user?: DummyUser | null; // For TopNavigation
    sampleUrl?: string; // Pass the sampleUrl if needed for title etc.
}

// Sample dummy data
const dummyUserData: DummyUser | null = null; // Simulate public view (logged out)
const dummySalonData: DummySalon | null = {
    id: 'demo1',
    name: "Chic Demo Nails",
    location: "Example City, ST",
    address: "123 Demo Street",
    phone_number: "(555) DEMO-NAIL",
    email: "info@chicdemonails.com",
    description: "Welcome to Chic Demo Nails! We provide top-quality manicure, pedicure, and nail art services in a relaxing and stylish environment. Our expert technicians are here to pamper you.",
    services: ["Demo Manicure - $40", "Demo Pedicure - $55", "Gel Polish Add-on - $15", "Basic Nail Art - $10+"],
    opening_hours: "Mon - Sat: 10 AM - 7 PM\nSunday: Closed",
    sample_url: "chic-demo-nails-es" // Example sampleUrl
};

// Helper function to format opening hours
const formatOpeningHours = (hoursString: string | null | undefined): string[] => {
  if (!hoursString) return ["Opening hours not specified"];
  return hoursString.split(/[\n;]/).map(part => part.trim()).filter(Boolean);
};

// Helper function to format services array
const formatServices = (services: string[] | null | undefined): string[] => {
  if (!services || services.length === 0) return ["Services not listed"];
  return services;
};

export default function SalonPage({
    salon = dummySalonData, // Use prop or default dummy data
    isLoading = false,
    error = null,
    user = dummyUserData,
    sampleUrl = dummySalonData?.sampleUrl // Get from props or dummy data
}: SalonPageProps) {

  const isLoggedIn = !!user;

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <TopNavigation user={user} isLoggedIn={isLoggedIn} />
        <div className="flex-grow flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Handle Salon Not Found or Error state
  if (error || !salon) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <TopNavigation user={user} isLoggedIn={isLoggedIn} />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4 text-destructive">
            {error ? 'Error Loading Salon' : 'Salon Not Found'}
          </h1>
          <p className="text-muted-foreground mb-8">
             {error ? (error as Error).message : "Sorry, we couldn't find the salon you're looking for."}
          </p>
          <Button variant="outline" onClick={() => alert('Navigate to Home')}>Go to Homepage</Button>
        </main>
      </div>
    );
  }

  // --- Render Salon Page ---
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <TopNavigation user={user} isLoggedIn={isLoggedIn} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="overflow-hidden shadow-xl border border-border/50">
          <CardHeader className="bg-card p-6 border-b border-border">
            <CardTitle className="text-3xl font-bold text-foreground">{salon.name}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground flex items-center mt-1">
              <MapPin className="h-5 w-5 mr-2 flex-shrink-0" />
              {salon.location}
            </CardDescription>
             {/* Optional: Link back if needed, maybe only for admins? */}
             {/* {user?.role === 'admin' && (
                 <div className="mt-2">
                    <Link href="/admin/salons">
                        <Button variant="link" size="sm" className="text-xs p-0 h-auto">← Back to Salons List</Button>
                    </Link>
                 </div>
             )} */}
          </CardHeader>

          <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Contact Info & Hours */}
            <div className="md:col-span-1 space-y-6">
              <div>
                  <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2 mb-3">Contact</h2>
                  <div className="space-y-3 text-sm">
                      <div className="flex items-start">
                          <MapPin className="h-4 w-4 mr-3 text-muted-foreground mt-1 flex-shrink-0" />
                          <span className="text-foreground">{salon.address || 'Address not provided'}</span>
                      </div>
                      {salon.phone_number && (
                          <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
                              <a href={`tel:${salon.phone_number}`} className="text-primary hover:underline">{salon.phone_number}</a>
                          </div>
                      )}
                      {salon.email && (
                          <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
                              <a href={`mailto:${salon.email}`} className="text-primary hover:underline">{salon.email}</a>
                          </div>
                      )}
                  </div>
              </div>

              <Separator />

              <div>
                  <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2 mb-3">Hours</h2>
                  <div className="flex items-start">
                    <Clock className="h-4 w-4 mr-3 text-muted-foreground mt-1 flex-shrink-0" />
                    <div className="space-y-1 text-sm">
                        {formatOpeningHours(salon.opening_hours).map((line, index) => (
                            <p key={index} className="text-foreground">{line}</p>
                        ))}
                    </div>
                  </div>
              </div>
            </div>

             {/* Right Column: About & Services */}
            <div className="md:col-span-2 space-y-8">
               {salon.description && (
                 <div>
                   <h2 className="text-xl font-semibold text-foreground flex items-center mb-3">
                     <Info className="h-5 w-5 mr-2" /> About Us
                   </h2>
                   <p className="text-muted-foreground leading-relaxed text-sm">{salon.description}</p>
                 </div>
               )}
               <div>
                  <h2 className="text-xl font-semibold text-foreground flex items-center mb-3">
                     <Scissors className="h-5 w-5 mr-2" /> Our Services
                  </h2>
                  <ul className="space-y-2">
                    {formatServices(salon.services).map((service, index) => (
                       <li key={index} className="flex items-center text-sm">
                          <Badge variant="secondary" className="mr-3 h-2 w-2 p-0 rounded-full bg-primary/60"></Badge>
                          <span className="text-foreground">{service}</span>
                       </li>
                     ))}
                  </ul>
               </div>
            </div>
          </CardContent>
          {/* Optional Footer for Call to Action */}
          {/* <CardFooter className="bg-muted/50 p-4 border-t">
              <Button className="w-full" size="sm">Book Appointment Online</Button>
          </CardFooter> */}
        </Card>
      </main>
    </div>
  );
}

// Define dummy types if needed by TopNavigation or other imports
interface User { username: string; email?: string; role: 'user' | 'admin'; }
interface Salon { id: number | string; name: string; location: string; address?: string | null; phone_number?: string | null; email?: string | null; description?: string | null; services?: string[] | null; opening_hours?: string | null; sample_url: string; }
interface Template { id: number; name: string; description?: string; } // In case TopNav needs it indirectly