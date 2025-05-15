// src/pages/SampleSite.tsx
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { API } from "@/lib/api";
import { SalonData, TemplateData, User } from "@/types";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useParams } from "wouter";
import { Loader2, ArrowLeft, HandHelping, LogIn, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

// Import your common Header and Footer components
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Import your layout components - ADD ALL NEW IMPORTS
import TemplateLayoutClassic from '@/components/layout/TemplateLayoutClassic';
import TemplateLayoutElegant from '@/components/layout/TemplateLayoutElegant';
import TemplateLayoutModern from '@/components/layout/TemplateLayoutModern';
import TemplateLayoutLuxury from '@/components/layout/TemplateLayoutLuxury';
import TemplateLayoutFriendly from '@/components/layout/TemplateLayoutFriendly';
import TemplateLayoutMinimalist from '@/components/layout/TemplateLayoutMinimalist';
import TemplateLayoutArtistic from '@/components/layout/TemplateLayoutArtistic';
import TemplateLayoutVibrant from '@/components/layout/TemplateLayoutVibrant';
import TemplateLayoutDarkMode from '@/components/layout/TemplateLayoutDarkMode';
import TemplateLayoutNatural from '@/components/layout/TemplateLayoutNatural';


// Define the default template slug
const DEFAULT_TEMPLATE_SLUG = 'classic';

// Map backend template slugs to frontend Layout Components - ADD ALL NEW ENTRIES
const templateLayoutMap: { [key: string]: React.FC<any> } = {
  classic: TemplateLayoutClassic,
  elegant: TemplateLayoutElegant,
  modern: TemplateLayoutModern,
  luxury: TemplateLayoutLuxury,
  friendly: TemplateLayoutFriendly,
  minimalist: TemplateLayoutMinimalist,
  artistic: TemplateLayoutArtistic,
  vibrant: TemplateLayoutVibrant,
  'dark-mode': TemplateLayoutDarkMode, // Use slug 'dark-mode'
  natural: TemplateLayoutNatural,
};

export default function SampleSite() {
  const params = useParams<{ sampleUrl?: string; templateId?: string }>();
  const sampleUrlFromParams = params.sampleUrl;
  const templateIdFromParams = params.templateId;

  const isRealSite = !!sampleUrlFromParams;
  const isPreview = !isRealSite && !!templateIdFromParams;

  if (!isRealSite && !isPreview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center dark:bg-gray-900 dark:text-gray-300">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-300 mb-4">Missing Information</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 mb-6">
          Please provide a sample site URL or a template preview identifier.
        </p>
        <Button onClick={() => navigate("/")} className="mt-4">
          Return Home
        </Button>
        <Button onClick={() => navigate("/templates")} variant="outline" className="mt-4">
          Browse Templates
        </Button>
      </div>
    );
  }

  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showAdminBar, setShowAdminBar] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

   const openUrl = (url?: string | null, fallbackUrl: string = '#') => {
      const targetUrl = url && url !== '#' ? url : fallbackUrl;
       if (targetUrl === '#') {
           console.warn("Attempted to open '#' URL");
           return;
       }

      try {
          if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
              window.open(targetUrl, "_blank", "noopener,noreferrer");
          } else {
               window.location.href = targetUrl;
          }
      } catch (e) {
          console.error("Failed to navigate to URL:", targetUrl, e);
          toast({
              title: "Navigation Error",
              description: "Could not open the requested link.",
              variant: "destructive"
          });
      }
    };


  // --- Fetch User Profile ---
  const { data: user, isLoading: isLoadingUser } = useQuery<User | null>({
    queryKey: ["currentUser"],
    queryFn: async () => {
        if (typeof window === 'undefined' || !localStorage.getItem('access_token')) {
            return null;
        }
        try {
          const response = await API.user.getProfile(); // Assumes API.user.getProfile exists and returns User type
          return response.data as User; // Cast response data to User type
        } catch (error: any) {
          if (axios.isAxiosError(error) && error.response?.status !== 401) {
            console.error("Failed to fetch user profile in SampleSite:", error);
          }
          return null;
        }
    },
    enabled: typeof window !== 'undefined',
    retry: false,
    staleTime: Infinity,
  });

  const isLoggedIn = !!user;

  // --- Fetch Salon Data or Template Preview Data ---
  const {
    data: salonData,
    isLoading: isLoadingSalonData,
    error: salonDataError
  } = useQuery<SalonData>({
    queryKey: isRealSite ? ["salon", sampleUrlFromParams] : ["templatePreviewData", templateIdFromParams],
    queryFn: async () => {
      if (isRealSite && sampleUrlFromParams) {
        const response = await API.salons.getBySampleUrl(sampleUrlFromParams);
        return response.data as SalonData;
      } else if (isPreview && templateIdFromParams !== undefined) {
        const templateId = parseInt(templateIdFromParams, 10);
        if (isNaN(templateId)) throw new Error("Invalid template ID provided for preview.");
        const response = await API.templates.getPreviewData(templateId);
        return response.data as SalonData;
      }
      throw new Error("Invalid application state.");
    },
    enabled: isRealSite || (isPreview && templateIdFromParams !== undefined && !isNaN(parseInt(templateIdFromParams, 10))),
    retry: (failureCount, error) => {
         if (axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 401)) {
             return false;
         }
         return failureCount < 2;
    },
    staleTime: isRealSite ? 5 * 60 * 1000 : Infinity,
    gcTime: isRealSite ? 10 * 60 * 1000 : 60 * 60 * 1000,
  });

  const templateData = salonData?.template;

  // --- Select the Layout Component based on template slug ---
  // Use slug from templateData, fall back to default slug, then map to component
  const effectiveTemplateSlug = templateData?.slug || DEFAULT_TEMPLATE_SLUG; // Use default slug if templateData or slug is missing
  const SelectedTemplateLayout = templateLayoutMap[effectiveTemplateSlug] || templateLayoutMap[DEFAULT_TEMPLATE_SLUG]; // Fallback lookup

   const hasValidLayout = !!templateLayoutMap[effectiveTemplateSlug]; // Check if a specific layout component exists for the slug


  // --- Claim Salon Mutation ---
  const claimMutation = useMutation({
    mutationFn: async (salonId: number) => {
      const response = await API.salons.claim(salonId);
      return response.data as SalonData;
    },
    onSuccess: (claimedSalon) => {
      toast({
        title: "Site Claimed!",
        description: `You have successfully claimed "${claimedSalon.name || salonData?.name || 'this site'}".`,
      });
      if (sampleUrlFromParams) {
         queryClient.invalidateQueries({ queryKey: ["salon", sampleUrlFromParams] });
      }
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      const claimedSalonId = claimedSalon?.id || salonData?.id;
      if (claimedSalonId) {
         navigate(`/portal?salonId=${claimedSalonId}`, { replace: true });
      } else {
          navigate("/portal", { replace: true });
      }
    },
    onError: (error: any) => {
      console.error("Failed to claim site:", error);
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.detail
         ? error.response.data.detail
         : axios.isAxiosError(error) && error.response?.data?.message
         ? error.response.data.message
         : error instanceof Error ? error.message : "An unknown error occurred during claiming.";
      toast({
        title: "Claim Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // --- Handle "Use This Template" Button Click (Preview Mode) ---
  const handleUseTemplateClick = () => {
    if (!isPreview || templateIdFromParams === undefined) {
      toast({
        title: "Action Not Allowed",
        description: "This action is only available when previewing a template.",
        variant: "destructive"
      });
      return;
    }

     const templateId = parseInt(templateIdFromParams, 10);
     if (isNaN(templateId)) {
         toast({
            title: "Invalid Template",
            description: "Cannot use this template due to an invalid identifier.",
            variant: "destructive"
        });
        return;
     }

    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please log in to claim or create a salon site.",
        variant: "info"
      });
      const redirectUrl = encodeURIComponent(window.location.pathname + window.location.search);
      navigate(`/login?redirect=${redirectUrl}`);
    } else {
       if (user?.salon) {
            toast({
                title: "Already Own a Salon",
                description: "You already own a salon. You can manage it from your dashboard.",
                variant: "info"
            });
            navigate(`/portal?salonId=${user.salon.id}`, { replace: true });
       } else {
            navigate(`/portal/create?templateId=${templateId}`, { replace: true });
       }
    }
  };


  // --- Render Loading, Error, and Not Found States ---

  const isLoading = isLoadingSalonData || isLoadingUser;
  const error = salonDataError;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500 dark:text-gray-400 mb-4" />
        <p>{isPreview ? "Loading Template Preview..." : "Loading Salon Site..."}</p>
      </div>
    );
  }

  if (error) {
    const errorMessage = axios.isAxiosError(error) && error.response?.status === 404
        ? (isPreview ? "Template preview data not found." : "Salon site not found.")
        : (error as Error)?.message || "An unexpected error occurred.";

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center dark:bg-gray-900 dark:text-gray-300">
        <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">{isPreview ? "Error Loading Preview" : "Error Loading Site"}</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-6">{errorMessage}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
        <Button onClick={() => navigate("/")} variant="outline" className="mt-4">
           Return Home
        </Button>
      </div>
    );
  }

  // Handle case where data is loaded but is null or incomplete (e.g., template data missing)
   // Also handles the case where the fetched template slug doesn't match ANY known layout *and* the default fallback also doesn't exist
  if (!salonData || !templateData || !SelectedTemplateLayout) {
      const message = (isPreview && templateIdFromParams)
          ? `Could not load valid sample data for template ID "${templateIdFromParams}".`
          : (isRealSite && sampleUrlFromParams && !templateData)
              ? `The salon site "${sampleUrlFromParams}" was found, but template data is missing or invalid.`
              : (isRealSite && sampleUrlFromParams && templateData && !SelectedTemplateLayout)
                ? `The salon site "${salonData?.name || sampleUrlFromParams}" uses template "${templateData?.name || effectiveTemplateSlug}" which has no corresponding layout component built yet.`
                : "Salon or Template data could not be loaded."; // Fallback generic

     return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center dark:bg-gray-900 dark:text-gray-300">
           <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-300 mb-4">Data or Layout Not Available</h1>
           <p className="mt-2 text-gray-600 dark:text-gray-400 mb-6">
             {message}
           </p>
           {/* Offer to browse templates if a layout wasn't found */}
           {isRealSite && templateData && !SelectedTemplateLayout && (
                <Button onClick={() => navigate("/templates")} className="mt-4">
                  Browse Available Templates
                </Button>
           )}
            {/* Offer retry or return home otherwise */}
           {(!isRealSite || !templateData) && (
               <>
                   <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
                   <Button onClick={() => navigate("/")} variant="outline" className="mt-4">
                      Return Home
                   </Button>
               </>
           )}
        </div>
     );
  }


   // --- Render the Site/Preview ---

   const isUserOwner = isLoggedIn && user?.salon?.id === salonData.id;
   const isUnclaimedSite = isRealSite && !salonData.claimed;
   const isLoggedInAndUnclaimed = isUnclaimedSite && isLoggedIn;
   const isNotLoggedInAndUnclaimed = isUnclaimedSite && !isLoggedIn;
   const isClaimedByOther = isRealSite && salonData.claimed && isLoggedIn && !isUserOwner;


   // Apply overall styles based on template using CSS variables
   const rootStyle = {
       fontFamily: templateData.font_family || "'Poppins', sans-serif",
       backgroundColor: templateData.background_color || '#ffffff',
       color: templateData.text_color || '#1A1F2C',
       '--primary-color': templateData.primary_color || '#7E69AB',
       '--secondary-color': templateData.secondary_color || '#D6BCFA',
       '--background-color': templateData.background_color || '#ffffff',
       '--text-color': templateData.text_color || '#1A1F2C',
       // Add a variable for text color that contrasts with secondary color if needed
       // '--text-on-secondary-color': getContrastColor(templateData.secondary_color),
   } as React.CSSProperties;


  return (
    // Apply root styles to the main wrapper div
    <div className={`salon-site template-${effectiveTemplateSlug}`} style={rootStyle}>

      {/* Admin Bar (Conditionally displayed) */}
      {(showAdminBar && isRealSite) && (
        <div className="bg-gray-800 text-white p-3 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center text-sm">
              <Button
                variant="link"
                className="text-white p-0 mr-4"
                onClick={() => navigate(isPreview ? "/templates" : "/salons")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {isPreview ? "Back to Templates" : "Back to Directory"}
              </Button>
              <span>
                Viewing site: <strong>{salonData.name || 'Your Site'}</strong>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {isUserOwner && salonData.id && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
                  onClick={() => navigate(`/portal?salonId=${salonData.id}`)}
                >
                  Edit Site
                </Button>
              )}

             {isLoggedInAndUnclaimed && salonData.id && (
                <Button
                  size="sm"
                  className="gradient-bg border-0"
                  onClick={() => salonData.id && claimMutation.mutate(salonData.id)}
                  disabled={claimMutation.isPending || !salonData.id}
                >
                  {claimMutation.isPending ? (
                     <>
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                       Claiming...
                     </>
                  ) : (
                    <>
                       <HandHelping className="h-4 w-4 mr-2" />
                       Claim This Site
                    </>
                  )}
                </Button>
             )}

             {isNotLoggedInAndUnclaimed && (
                <Button
                   size="sm"
                   variant="secondary"
                   className="shadow-sm"
                   onClick={() => {
                      const redirectUrl = encodeURIComponent(window.location.pathname + window.location.search);
                      navigate(`/login?redirect=${redirectUrl}`);
                   }}
                >
                   <LogIn className="h-4 w-4 mr-2" />
                   Login to Claim
                </Button>
             )}

             {isClaimedByOther && (
                 <span className="text-sm text-yellow-400">This site is already claimed.</span>
             )}

             <Button
               variant="outline"
               size="sm"
               className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
               onClick={() => setShowAdminBar(false)}
             >
               Hide Admin Bar
             </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Bar (Conditionally displayed) */}
      {isPreview && (
        <div className="bg-blue-600 text-white p-3 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center flex-wrap gap-2">
            <span className="text-sm font-semibold mb-2 md:mb-0">
              Previewing Template: <strong>{templateData.name || 'Unnamed Template'}</strong>
            </span>
            <div className="flex items-center space-x-4">
              <Button
                variant="link"
                className="text-white p-0"
                onClick={() => navigate("/templates")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Templates
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Common Header (if used) - Pass necessary props */}
       <Header
            salon={salonData}
            template={templateData}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            openUrl={openUrl}
       />


      {/* Render the Selected Layout Component */}
       <SelectedTemplateLayout
            salon={salonData}
            template={templateData}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            openUrl={openUrl}
            isPreview={isPreview}
       />


      {/* Common Footer (if used) - Pass necessary props */}
       <Footer
           salon={salonData}
           template={templateData}
           openUrl={openUrl}
       />


      {/* Show Admin Bar Button (Conditionally displayed) */}
      {(!showAdminBar && isRealSite) && (
        <div className="fixed bottom-4 right-4 z-10">
          <Button
            size="sm"
            variant="secondary"
            className="shadow-lg"
            onClick={() => setShowAdminBar(true)}
          >
            Show Admin Bar
          </Button>
        </div>
      )}

      {/* Use This Template Button (Conditionally displayed in Preview mode) */}
      {(isPreview && templateIdFromParams && !isLoadingUser && user !== undefined && user !== null && !user?.salon) && (
         <div className="fixed bottom-4 left-0 right-0 z-10 flex justify-center">
           {isLoadingUser ? (
                <Button size="lg" className="shadow-lg" disabled>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Checking access...
                </Button>
           ) : (
               <Button
                 size="lg"
                 className="shadow-lg"
                 onClick={handleUseTemplateClick}
                 disabled={user?.salon !== null}
               >
                 Use This Template
               </Button>
            )}
        </div>
      )}

      {/* If preview, user is logged in, but already has a salon */}
      {(isPreview && templateIdFromParams && !isLoadingUser && user?.salon) && (
          <div className="fixed bottom-4 left-0 right-0 z-10 flex justify-center">
              <Button
                  size="lg"
                  className="shadow-lg"
                  onClick={() => navigate(`/portal?salonId=${user.salon.id}`, { replace: true })}
              >
                 <CheckCircle className="h-4 w-4 mr-2" /> Manage Your Salon
              </Button>
           </div>
      )}


    </div>
  );
}