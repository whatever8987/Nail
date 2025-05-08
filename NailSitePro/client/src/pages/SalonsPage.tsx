import { TopNavigation } from "@/components/layout/TopNavigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input"; // Import Input
import { Loader2, EyeIcon, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { API, PaginatedResponse, Salon } from "@/lib/api";
import axios from "axios";

import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react"; // Import useState, useEffect, useRef


// Helper function to safely parse service features (similar to template features)
const parseServices = (servicesData: string | any): { service: string; price: number }[] => {
    if (typeof servicesData !== 'string') {
        if (Array.isArray(servicesData)) {
             return servicesData.filter(item => typeof item === 'object' && item !== null && 'service' in item && 'price' in item) as { service: string; price: number }[];
        }
        return [];
    }
    try {
        const parsed = JSON.parse(servicesData);
        return Array.isArray(parsed)
            ? parsed.filter(item => typeof item === 'object' && item !== null && 'service' in item && 'price' in item) as { service: string; price: number }[]
            : [];
    } catch {
        return [];
    }
};


export default function SalonsPage() {
  const { toast } = useToast();
  const { t } = useTranslation();

  // --- State for Search ---
  const [searchTerm, setSearchTerm] = useState(""); // Holds the current input value
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(""); // Holds the value after debounce


  // --- Debounce Logic ---
  // Use useEffect to update debouncedSearchTerm after a delay
  useEffect(() => {
    // Set a timeout to update debouncedSearchTerm after 500ms
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    // Cleanup function: Clear the timeout if searchTerm changes before the delay finishes
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]); // Only re-run effect if searchTerm changes


  // Fetch user profile (needed for TopNavigation and checking login status/admin role)
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const response = await API.user.getProfile();
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
           console.warn("Attempted to fetch user on salons page with invalid token (401). Global interceptor will handle logout.");
        } else {
           console.error("Error fetching user profile:", error);
        }
        return null;
      }
    },
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('access_token'),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const isLoggedIn = !!user;

  // --- Fetch the list of salons ---
  // Include the debouncedSearchTerm in the query key and the API call
  const { data: salonsData, isLoading: isLoadingSalons, error: salonsError } = useQuery<PaginatedResponse<Salon>>({
    queryKey: ["salons", debouncedSearchTerm], // Query key now includes the search term
    queryFn: async () => {
      try {
        // Pass the debounced search term as a 'search' parameter to the API
        // The backend API needs to be configured to accept and use this parameter
        const response = await API.salons.list({
             limit: 24, // Keep pagination limit
             search: debouncedSearchTerm // Pass the search term
        });
        return response.data;
      } catch (error) {
        console.error("Error loading salons:", error);
        toast({
          title: t("common.error_loading_salons_title"),
          description: t("common.error_loading_salons_description"),
          variant: "destructive"
        });
        throw error;
      }
    },
    enabled: true, // Always enabled
    retry: 1,
    staleTime: 60 * 1000,
  });

  // Handle loading state for both user (needed for TopNav) and salons
   // Show loader if user is loading AND a token exists, OR if salons are loading
  if (isLoadingUser && typeof window !== 'undefined' && !!localStorage.getItem('access_token') || isLoadingSalons) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">{t("common.loading")}...</span>
      </div>
    );
  }

  const salons = salonsData?.results || [];
  const hasSalonsError = !!salonsError;


  return (
    <div className="min-h-screen bg-background">
      <TopNavigation user={user} isLoggedIn={isLoggedIn} />

      <section className="py-12 md:py-20">
         {/* Optional: Add background pattern here */}

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

           {/* Page Header and Search Input */}
           <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900">{t("salons.title")}</h1>
              <p className="mt-2 text-xl text-muted-foreground">{t("salons.subtitle")}</p>

              {/* Search Input Field */}
              <div className="mt-6 max-w-sm mx-auto"> {/* Center and limit width */}
                 <Input
                   type="text"
                   placeholder={t("salons.search_placeholder")} 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full"
                 />
              </div>
           </div>

           {/* Display error message if fetching salons failed */}
            {hasSalonsError && (
                <div className="text-center text-red-500 p-8">
                   <p>{t("common.error_loading_salons_description")}</p>
                </div>
            )}

           {/* Salons Grid */}
           {!hasSalonsError && (salons.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
               {salons.map((salon) => (
                 <Card key={salon.id} className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                   <CardHeader className="relative pb-0">
                       <div className="relative aspect-video bg-gray-200 overflow-hidden rounded-md">
                           <img
                                src={salon.template?.preview_image || '/placeholder-template.png'}
                                alt={`${salon.name} preview`}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                    e.currentTarget.src = '/placeholder-template.png';
                                    e.currentTarget.onerror = null;
                                }}
                                loading="lazy"
                           />
                           <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black/30">
                                {salon.sample_url && (
                                    <Link to={`/demo/${salon.sample_url}`} target="_blank" rel="noopener noreferrer">
                                        <Button size="sm" className="z-10">
                                            <EyeIcon className="h-4 w-4 mr-2" />
                                            {t("common.preview")}
                                        </Button>
                                    </Link>
                                )}
                                {!salon.sample_url && (
                                     <span className="text-white text-sm">{t("salons.no_preview")}</span>
                                )}
                           </div>
                       </div>

                       <div className="mt-4">
                           <CardTitle className="text-lg font-bold mb-1">{salon.name}</CardTitle>
                           <CardDescription className="text-sm text-muted-foreground">{salon.location}</CardDescription>
                       </div>

                       {salon.claimed && (
                         <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" /> {t("salons.claimed")}
                         </Badge>
                       )}
                   </CardHeader>

                   <CardFooter className="pt-4 flex justify-end">
                     {salon.sample_url && (
                       <Link to={`/demo/${salon.sample_url}`} target="_blank" rel="noopener noreferrer">
                         <Button variant="outline" size="sm">
                           <EyeIcon className="h-4 w-4 mr-2" />
                           {t("salons.view_sample")}
                         </Button>
                       </Link>
                     )}
                       {!salon.sample_url && (
                            <Button variant="outline" size="sm" disabled>
                              {t("salons.sample_coming_soon")}
                            </Button>
                       )}
                   </CardFooter>
                 </Card>
               ))}
             </div>
           ) : (
             // Empty state (either no salons found, or search yielded no results)
             <div className="text-center py-12 text-muted-foreground">
               {debouncedSearchTerm ? t("salons.no_search_results") : t("salons.no_salons_found")} {/* Use translation key */}
             </div>
           ))}

            {/* Optional: Pagination Controls Here */}

         </div>
      </section>

    </div>
  );
}