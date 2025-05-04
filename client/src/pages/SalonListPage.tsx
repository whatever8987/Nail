// src/pages/SalonListPage.tsx

import React from 'react'; // Import React
import { Link } from 'wouter'; // Keep Link for structure
import { TopNavigation } from '@/components/layout/TopNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, EyeIcon, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

// Define dummy types
interface DummyUser { username: string; email?: string; role: 'user' | 'admin'; }
interface DummySalon {
  id: number | string;
  name: string;
  location: string;
  description?: string | null;
  sampleUrl: string;
}

interface SalonListPageProps {
    salons?: DummySalon[];
    isLoading?: boolean;
    error?: Error | null;
    user?: DummyUser | null; // Add user prop for TopNavigation
}

// Dummy data
const dummyUserData: DummyUser | null = null; // Simulate logged out
const dummySalonsData: DummySalon[] = [
    { id: 1, name: "Ethereal Nails", location: "San Francisco, CA", description: "Minimalist designs and relaxing spa pedicures.", sampleUrl: "ethereal-sf" },
    { id: 2, name: "Downtown Nail Bar", location: "New York, NY", description: "Trendy nail art and express services in the heart of the city.", sampleUrl: "downtown-nyc" },
    { id: 3, name: "Beachside Polish", location: "Miami, FL", description: "Get your nails ready for the beach with our vibrant colors.", sampleUrl: "beachside-fl" },
    { id: 4, name: "The Cozy Corner", location: "Austin, TX", description: null, sampleUrl: "cozy-tx" },
    { id: 5, name: "Emerald City Nails", location: "Seattle, WA", description: "Eco-friendly products and precise application.", sampleUrl: "emerald-wa" },
    { id: 6, name: "Windy City Styles", location: "Chicago, IL", description: "Classic and modern nail services.", sampleUrl: "windy-il" },
];

// Dummy translation function
const t = (key: string, defaultText: string) => defaultText;

export default function SalonListPage({
    salons = dummySalonsData,
    isLoading = false,
    error = null,
    user = dummyUserData
}: SalonListPageProps) {

  const isLoggedIn = !!user;
  const publicSalons = salons?.filter(salon => salon.sampleUrl) || []; // Filter dummy data

  // --- Render Logic ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopNavigation user={user} isLoggedIn={isLoggedIn} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl sm:tracking-tight">
            {t('salonListPage.title', 'Explore Our Salon Websites')}
          </h1>
          <p className="mt-5 text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('salonListPage.description', 'See examples of websites built for salons like yours.')}
          </p>
        </div>

        {/* Display Error Message */}
        {error && (
             <div className="text-center text-destructive bg-destructive/10 p-4 rounded-md mb-8 max-w-3xl mx-auto">
                <p>Error loading salons: {(error as Error).message || 'Unknown error'}</p>
             </div>
        )}

        {/* Display Loading Skeletons */}
        {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array(6).fill(0).map((_, index) => (
                     <Card key={`skeleton-${index}`} className="flex flex-col overflow-hidden shadow-sm">
                        <Skeleton className="h-48 w-full bg-muted" />
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2 mt-2" />
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6 mt-2" />
                        </CardContent>
                        <CardFooter>
                             <Skeleton className="h-9 w-full" />
                        </CardFooter>
                     </Card>
                ))}
            </div>
        )}

        {/* Display Salon List */}
        {!isLoading && publicSalons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publicSalons.map((salon) => (
              <Card key={salon.id} className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 bg-card">
                <div className="h-48 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 flex items-center justify-center">
                   <span className="text-muted-foreground italic text-sm">Salon Image Placeholder</span>
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{salon.name}</CardTitle>
                  <CardDescription className="flex items-center text-sm text-muted-foreground pt-1">
                    <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                    {salon.location || 'Location N/A'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-3 h-[3.75rem]">
                    {salon.description || `Visit ${salon.name} in ${salon.location}.`}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" asChild className="w-full">
                    {/* Use button/alert instead of Link for standalone */}
                    <button onClick={() => alert(`View demo: /demo/${salon.sampleUrl}`)}>
                      <EyeIcon className="h-4 w-4 mr-2" />
                      {t('salonListPage.viewSite', 'View Site')}
                    </button>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : null}

        {/* Display No Salons Message */}
        {!isLoading && !error && publicSalons.length === 0 && (
             <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">{t('salonListPage.noSalons', 'No public salon sites available yet.')}</p>
                {/* Optional: Add a button to suggest creating one? */}
             </div>
          )
        }
      </main>
    </div>
  );
}

// Define dummy types if needed by TopNavigation or other imports
interface User { username: string; email?: string; role: 'user' | 'admin'; }
interface Salon { id: number | string; name: string; location: string; description?: string | null; sampleUrl: string; }