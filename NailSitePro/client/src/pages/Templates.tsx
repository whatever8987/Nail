import { TopNavigation } from "@/components/layout/TopNavigation";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // Import useQueryClient
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, PlusCircle, CheckCircle, EyeIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useState } from "react";
import { API } from "@/lib/api"; // Import our API client
import axios from "axios"; // For error handling

// Helper function to safely parse features (unchanged)
const parseFeatures = (featuresString: string | any): string[] => {
  // Handle cases where features is not a string (e.g., null, undefined, object)
  if (typeof featuresString !== 'string') {
     // If it's already an array, map it, otherwise return empty
     if (Array.isArray(featuresString)) {
         return featuresString.map((item: any) => item.feature || item.desc || 'Unnamed feature');
     }
     return [];
  }
  try {
    const parsed = JSON.parse(featuresString);
    return Array.isArray(parsed)
      ? parsed.map((item: any) => item.feature || item.desc || 'Unnamed feature')
      : [];
  } catch {
    return [];
  }
};

export default function Templates() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient(); // Get the query client instance
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  // Updated user query to use our API client
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const response = await API.user.getProfile();
        return response.data;
      } catch (error) {
        // *** FIX: Remove localStorage.removeItem calls from here.
        // The global Axios interceptor in api.ts now handles token cleanup and redirect on 401.
        // This catch block simply needs to return null if the user fetch fails.
        if (axios.isAxiosError(error) && error.response?.status === 401) {
           // Optionally log, but do NOT clear tokens or redirect here.
           console.warn("Attempted to fetch user on templates page with invalid token (401). Global interceptor will handle logout.");
           // Ensure cache is removed if 401 happens here before interceptor? Redundant with interceptor,
           // but safe if this query somehow runs before the interceptor is fully set up/triggered.
           queryClient.removeQueries({ queryKey: ['currentUser'] });
        } else {
           // Log other errors
           console.error("Failed to fetch user profile on templates page:", error);
        }
        return null; // Return null if fetching user failed (user is not logged in or token invalid)
      }
    },
     // Only enabled if a token might exist, avoid requests for genuinely public users
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('access_token'),
    retry: false,
  });

  // Updated templates query to use our API client
  const { data: templatesData, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      try {
        const response = await API.templates.list();
        return response.data.results || [];
      } catch (error) {
        console.error("Error loading templates:", error); // Log the actual error
        toast({
          title: "Error loading templates",
          description: "Could not fetch templates. Please try again later.",
          variant: "destructive"
        });
        return [];
      }
    },
    retry: false, // Don't retry if template fetching fails (e.g. server error)
  });

  const isLoggedIn = !!user; // Determine login status based on whether user data was successfully fetched

  const handleTemplateSelect = (templateId: number) => {
    if (!isLoggedIn) {
      toast({
        title: "Login required",
        description: "Please log in to select a template.",
        variant: "destructive"
      });
      navigate("/login?redirect=/templates"); // Redirect to login, with redirect back
      return;
    }

    // Check if user already has a salon claimed
    if (user && user.salon) {
         toast({
            title: "You already have a salon",
            description: "You can manage your existing salon from the dashboard.",
            variant: "info"
         });
         navigate("/dashboard"); // Or redirect to their salon's portal/editor
         return;
    }
    
    setSelectedTemplate(templateId);
    toast({
      title: "Template selected",
      description: "This template will be used for your new website.",
      variant: "success" // Use success variant
    });
  };

  const handleTemplatePreview = (templateId: number) => {
    // Find the template by ID to get its sample_url if available
    const template = templates.find(t => t.id === templateId);
    if (template) {
        // Assuming your API returns a way to link to a preview based on template ID
        // Or perhaps you have static preview routes like /preview/{templateId}
        // For now, let's assume a simple static preview route or a direct URL from template data if available
         // If template.preview_url exists and is a full URL, use that
        if ((template as any).preview_url) { // Assuming a potential preview_url field not in type
             window.open((template as any).preview_url, '_blank');
        } else {
             // Fallback to a static route pattern if you have one set up
            window.open(`/preview/${templateId}`, '_blank');
        }
    } else {
        toast({
            title: "Preview not available",
            description: "Could not find details for this template preview.",
            variant: "warning"
        });
    }
  };

  const handleContinue = () => {
    if (selectedTemplate === null) {
      toast({
        title: "No template selected",
        description: "Please select a template to continue.",
        variant: "destructive"
      });
      return;
    }
    
    // If the user is logged in and has selected a template, navigate to the salon creation/portal page
    // Pass the selected template ID
    navigate(`/portal/create?templateId=${selectedTemplate}`); // Adjusted path based on potential flow
  };

  // Safely handle templates data
  const templates = Array.isArray(templatesData) ? templatesData : [];

  // Show loader if either user or templates are loading, *and* a token exists
  // If no token exists, isLoadingUser will be false and we won't show this loader.
  if (isLoadingUser && typeof window !== 'undefined' && !!localStorage.getItem('access_token') || isLoadingTemplates) {
     return (
       <div className="flex items-center justify-center min-h-screen">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
     );
   }


  return (
    // Main container for the page - setting its background to match the section
    <div className="min-h-screen bg-background">
      {/* Top navigation is outside the scrollable content area */}
      <TopNavigation user={user} isLoggedIn={isLoggedIn} />

      {/* This section will contain the background and the content */}
      <section className="relative py-12 md:py-20"> {/* Added vertical padding */}
        {/* The absolute background layer */}
        <div className="absolute inset-0 bg-grid-slate-200/70 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>

        {/* The content layer - centered, padded, and above the background */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* Content header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Choose Your Website Template</h1>
            <p className="mt-2 text-xl text-muted-foreground"> {/* Changed text color for better contrast */}
              Select from our professionally designed templates
            </p>
          </div>

          {/* Templates Grid */}
          {templates.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {templates.map((template) => (
                  <Card key={template.id} className={`overflow-hidden transition-all duration-200 ${selectedTemplate === template.id ? 'ring-2 ring-primary scale-[1.02]' : ''}`}>
                    <div className="relative aspect-video bg-gray-200"> {/* Added gray background while image loads/fails */}
                      <img
                        src={template.preview_image}
                        alt={template.name}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          // Fallback image if the primary preview_image fails
                          e.currentTarget.src = '/placeholder-template.png'; // Make sure you have a placeholder
                          e.currentTarget.onerror = null; // Prevent infinite loop if placeholder fails too
                        }}
                        loading="lazy" // Improve performance by lazy loading images
                      />
                       {/* Overlay to make text/badges more readable on busy images */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent"></div>
                      {template.is_mobile_optimized && (
                        <Badge className="absolute top-2 right-2 bg-primary hover:bg-primary"> {/* hover:bg-primary to prevent interaction change */}
                          Mobile Ready
                        </Badge>
                      )}
                       {/* Maybe add a little overlay on hover? */}
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black/20">
                            <Button size="sm" onClick={() => handleTemplatePreview(template.id)} className="z-10">
                                <EyeIcon className="h-4 w-4 mr-2" />
                                Preview
                            </Button>
                       </div>
                    </div>
                    <CardHeader>
                      <CardTitle>{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    {/* Check if features are valid before mapping */}
                    {parseFeatures(template.features).length > 0 && (
                      <CardContent className="space-y-2">
                        {parseFeatures(template.features).map((feature, i) => (
                          <div key={i} className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{feature}</span> {/* Adjusted text color */}
                          </div>
                        ))}
                      </CardContent>
                    )}
                    <CardFooter className="flex justify-between gap-2">
                       {/* Moved preview button logic */}
                       {/* Re-added the preview button here, as it's needed alongside select */}
                       <Button variant="outline" size="sm" onClick={() => handleTemplatePreview(template.id)}>
                         <EyeIcon className="h-4 w-4 mr-2" />
                         Preview
                       </Button>
                      <Button
                        size="sm"
                        onClick={() => handleTemplateSelect(template.id)}
                        variant={selectedTemplate === template.id ? "default" : "secondary"}
                         disabled={!!user?.salon} // Disable if user already has a salon
                      >
                        {!!user?.salon ? (
                             <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Salon Created {/* Indicate user has a salon */}
                             </>
                        ) : selectedTemplate === template.id ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Selected
                          </>
                        ) : (
                          <>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Select
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Continue Button (only shows if logged in AND has a template selected AND doesn't already have a salon) */}
              {isLoggedIn && selectedTemplate !== null && !user?.salon && (
                <div className="mt-10 flex justify-center">
                  <Button size="lg" onClick={handleContinue}>
                    Continue to Create Your Salon
                  </Button>
                </div>
              )}
               {/* Message if user already has a salon */}
               {isLoggedIn && user?.salon && (
                   <div className="mt-10 text-center text-muted-foreground">
                       You already have a salon. Manage it from your <Link href="/dashboard" className="text-primary hover:underline">dashboard</Link>.
                   </div>
               )}

            </>
          ) : (
            // Empty state
            <div className="text-center py-12 text-muted-foreground"> {/* Adjusted text color */}
              No templates available at the moment.
            </div>
          )}
        </div>
      </section>

       {/* Optional: Add a footer outside the styled section if you want */}
       {/* <footer className="bg-slate-900 text-slate-300">...</footer> */}
    </div>
  );
}