// src/pages/SampleSite.js

import { useQuery } from "@tanstack/react-query";
import { API } from "@/lib/api"; // Your API client
import { Salon, Template } from "@/lib/api/types"; // Your types

import { Button } from "@/components/ui/button"; // Shadcn Button
import { useToast } from "@/hooks/use-toast"; // Your toast hook
import { useLocation, useParams } from "wouter"; // Wouter routing

import { Loader2, ArrowLeft } from "lucide-react"; // Icons
import { useState } from "react";

// --- Import your template components ---
import DefaultTemplate from '../templates/DefaultTemplate';
import Template1 from '../templates/Template1'; // Modern Design Example
import Template2 from '../templates/Template2'; // Classic Design Example
// Import other templates as you create them
// import AnotherTemplate from '../templates/AnotherTemplate';

// --- Mapping from Template ID to React Component ---
// Get Template IDs from your Django admin or database
// Example IDs: 1 for Modern, 2 for Classic
const templateComponentMap = {
  1: Template1,
  2: Template2,
  // Add more mappings:
  // 3: AnotherTemplate,
};
// --- End Mapping ---


export default function SampleSite() {
  const params = useParams<{ sampleUrl?: string, templateId?: string }>();
  const sampleUrl = params.sampleUrl;
  const templateIdParam = params.templateId;

  // Parse templateId from param, handle potential NaN
  const templateId = templateIdParam ? parseInt(templateIdParam, 10) : undefined;

  const isPreview = typeof templateId === 'number' && !isNaN(templateId);
  const isRealSite = !!sampleUrl;

  // Ensure at least one mode is active
  if (!isRealSite && !isPreview) {
       // This case should ideally be handled by routing,
       // but as a safety net, maybe redirect or show an error.
       // For now, we'll let the render logic below handle it,
       // but a direct redirect might be better UX.
       // console.error("SampleSite: Insufficient parameters (sampleUrl or templateId).");
  }


  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showAdminBar, setShowAdminBar] = useState(true);

  // --- Query 1: Fetch Salon Data (or sample data in preview) ---
  // This query fetches the main data structure (Salon type).
  // If isPreview, it assumes the API endpoint for templates.get(id)
  // or potentially a dedicated preview endpoint returns a Salon-compatible structure
  // populated with sample data and potentially template-specific defaults.
  const {
    data: mainData, // Renamed from 'salon' to 'mainData' for clarity in preview mode
    isLoading: isLoadingMainData,
    error: mainDataError
  } = useQuery<Salon>({ // We expect data shaped like Salon, even in preview
    queryKey: isRealSite ? ["salon", sampleUrl] : (isPreview ? ["templatePreview", templateId] : []),
    queryFn: async () => {
      if (isRealSite && sampleUrl) {
        const response = await API.salons.getBySampleUrl(sampleUrl);
        // Add templateId to salon data if API doesn't embed it directly in the top level
        // If your serializer puts it on the Salon object as `templateId`, this is fine.
        // If the serializer puts it on `salon.template.id`, you might need to map it here:
        // return { ...response.data, templateId: response.data.template?.id };
        return response.data; // Assuming templateId is directly on the salon object
      } else if (isPreview && templateId !== undefined) {
        // Assuming API.templates.get(templateId) or a preview endpoint
        // returns a Salon-like structure with dummy data and template details.
        // If templates.get(id) ONLY returns Template data, you'd need
        // a dedicated preview endpoint or create dummy data here.
        // Let's assume for this code that templates.get(id) returns
        // template details *and* the sample Salon data.
        const response = await API.templates.get(templateId);
        // Assuming the API response for a template GET includes a 'sample_salon_data' field
        // or similar that matches the Salon interface. ADJUST THIS based on your ACTUAL API.
        // Alternatively, if the API structure is just the Template:
        // const templateResponse = await API.templates.get(templateId);
        // return createDummySalonData(templateResponse.data); // Need a helper function
        // Assuming response.data contains the salon-like structure:
         return {
            ...response.data, // This would ideally be sample salon data
            // Ensure templateId is correctly set for the template details query
             templateId: templateId
         } as Salon; // Assert type if structure isn't exactly Salon

      }
      // Should not reach here if enabled logic is correct
       throw new Error("Invalid mode or missing parameters for data fetch.");
    },
    enabled: isRealSite || isPreview, // Only run query if in a valid mode
    retry: 0, // Disable retries for simplicity in error handling
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // --- Query 2: Fetch Template Details (if a templateId is determined) ---
  // This query is enabled if the mainData is loaded and has a templateId
  const {
    data: templateDetails, // Renamed from 'template' to 'templateDetails'
    isLoading: isLoadingTemplateDetails
  } = useQuery<Template | null>({
    queryKey: ["template", mainData?.templateId], // Use templateId from mainData
    queryFn: async () => {
      if (!mainData?.templateId) return null;
      try {
        const response = await API.templates.get(mainData.templateId);
        return response.data; // This should be the Template object
      } catch (error) {
        console.error("Error fetching template details:", error);
        // Don't re-throw, just return null so the page can still render with defaults
        return null;
      }
    },
    enabled: !!mainData?.templateId, // Only run if mainData loaded and has templateId
    retry: 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const isLoading = isLoadingMainData || (mainData?.templateId !== undefined && isLoadingTemplateDetails);
  const effectiveTemplateData = templateDetails; // Use the fetched template details

  // --- Render Loading and Error States ---

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-700">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500 mb-4" />
        <p>{isPreview ? "Loading Template Preview..." : "Loading Salon Site..."}</p>
      </div>
    );
  }

  if (mainDataError) {
      // Handle errors from the primary data fetch (salon or preview)
         return (
              <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center">
                <h1 className="text-3xl font-bold text-red-600 mb-4">{isPreview ? "Error Loading Preview" : "Error Loading Site"}</h1>
                {/* Display error message from the query hook */}
                <p className="text-gray-700 mb-6">{(mainDataError as Error).message || "An unexpected error occurred."}</p>
                 <Button onClick={() => window.location.reload()} className="mt-4">
                  Retry
                </Button>
                {/* Navigate differently based on mode */}
                <Button onClick={() => navigate(isPreview ? "/templates" : "/")} variant="outline" className="mt-4">
                  {isPreview ? "Back to Templates" : "Return Home"}
                </Button>
              </div>
         );
  }

  // Handle case where no main data was loaded successfully
  if (!mainData) {
      // This should ideally be caught by isLoading or mainDataError,
      // but acts as a final safeguard if enabled was true but data is null/undefined
       return (
         <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center">
           <h1 className="text-3xl font-bold text-gray-800 mb-4">{isPreview ? "Preview Not Available" : "Salon Not Found"}</h1>
           <p className="mt-2 text-gray-600 mb-6">
               {isPreview ? "Could not load the template preview data." : "The salon site you're looking for doesn't exist or data could not be loaded."}
           </p>
           <Button onClick={() => navigate(isPreview ? "/templates" : "/")} className="mt-4">
             {isPreview ? "Back to Templates" : "Return Home"}
           </Button>
         </div>
       );
  }


  // --- Core Logic: Select the Template Component ---
  // For real sites, use the templateId from the fetched salon data (mainData).
  // For previews, use the templateId from the URL params.
  // Use templateComponentMap to get the component, fallback to DefaultTemplate.
  const templateIdToUse = isRealSite ? mainData.templateId : templateId;

  // Find the component in the map, default to DefaultTemplate if not found or templateId is null
  const SelectedTemplateComponent = templateComponentMap[templateIdToUse as number] || DefaultTemplate;

  // Data to pass to the template component
   // The 'mainData' object contains the salon details (real or sample).
   // The 'effectiveTemplateData' object contains the actual template details.
  const dataToPassToTemplate = mainData;


  // --- Render the Sample Site Container with Bars and Selected Template ---
  // The main div holds global styles like font/background color based on template,
  // and also contains the admin/preview bars.
  return (
    <div
       style={{
           fontFamily: effectiveTemplateData?.font_family || "'Poppins', sans-serif", // Apply template font or fallback
           backgroundColor: effectiveTemplateData?.background_color || '#ffffff', // Apply template background or fallback
            // Note: textColor is often better applied within template components
            // but can be set here as a global default
            // color: effectiveTemplateData?.text_color || '#333333',
            minHeight: '100vh'
       }}
    >
      {/* Admin Bar - Only show if it's a real site AND showAdminBar is true */}
      {(showAdminBar && isRealSite) && (
        <div className="bg-gray-800 text-white p-3 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center">
              <Button
                variant="link"
                className="text-white p-0 mr-4"
                onClick={() => navigate("/")} // Navigate back to dashboard/home
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <span className="text-sm">
                Viewing site: <strong>{mainData.name || 'Loading...'}</strong>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {/* Edit Site Button - Only show for real sites with an ID */}
               {isRealSite && mainData.id && (
                   <Button
                       variant="outline"
                       size="sm"
                       className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
                       onClick={() => navigate(`/portal?salonId=${mainData.id}`)} // Navigate to portal with salon ID
                   >
                       Edit Site
                   </Button>
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

      {/* Preview Bar - Show ONLY in preview mode */}
      {isPreview && (
         <div className="bg-blue-600 text-white p-3 sticky top-0 z-50 text-center">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
                <span className="text-sm font-semibold mb-2 md:mb-0">
                    Previewing Template: <strong>{effectiveTemplateData?.name || 'Loading...'}</strong>
                </span>
                 <div className="flex items-center space-x-4">
                     <Button
                         variant="link"
                         className="text-white p-0"
                         onClick={() => navigate("/templates")} // Go back to template selection
                     >
                         <ArrowLeft className="h-4 w-4 mr-2" />
                         Back to Templates
                     </Button>
                 </div>
            </div>
         </div>
      )}


      {/* Render the selected template component */}
      {/* Pass the main data (salon details) and template details as props */}
      <SelectedTemplateComponent
          salon={dataToPassToTemplate}
          template={effectiveTemplateData}
          isPreview={isPreview} // Pass mode flag down if needed by template components
      />


      {/* Mobile Book Now Button - Only show if it's a real site AND admin bar is hidden */}
       {(!showAdminBar && isRealSite) && (
            <div className="fixed bottom-4 left-0 right-0 z-10 flex justify-center md:hidden">
              <Button
                size="lg"
                className="shadow-lg"
                style={{ backgroundColor: effectiveTemplateData?.primary_color || '#f43f5e' }} // Use template primary color
              >
                <Phone className="mr-2 h-4 w-4" />
                Book Now
              </Button>
            </div>
       )}

      {/* Toggle Admin Bar Button - Only show if it's a real site AND admin bar is hidden */}
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

      {/* Use This Template Button in Preview Mode */}
       {isPreview && templateId !== undefined && ( // Show only in preview mode if templateId is known
           <div className="fixed bottom-4 left-0 right-0 z-10 flex justify-center">
               <Button
                   size="lg"
                   className="shadow-lg"
                   onClick={() => navigate(`/portal?template=${templateId}`)} // Navigate to portal with the template ID to select it
               >
                   Use This Template
               </Button>
           </div>
       )}

    </div>
  );
}