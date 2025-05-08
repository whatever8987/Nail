// client/src/components/modals/WebsitePreviewModal.tsx

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
// Import types from your custom API file
import { Template, Salon } from "@/lib/api"; 

import { useToast } from "@/hooks/use-toast";
import { Pencil, Phone, Copy, Loader2 as LoaderIcon } from "lucide-react"; // Rename Loader2

interface WebsitePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Use Template type from lib/api.ts
  template: Template;
  // Use Salon type from lib/api.ts for siteData
  siteData?: Salon; // siteData is optional
}

export function WebsitePreviewModal({
  isOpen,
  onClose,
  template,
  siteData
}: WebsitePreviewModalProps) {
  const { toast } = useToast();
  const [isIframeLoading, setIsIframeLoading] = useState(true); // State to track iframe loading

  // Handlers remain largely the same, but logic might change slightly based on siteData presence
  const handleEdit = () => {
    if (siteData) {

      toast({
        title: "Redirecting to editor",
        description: `Preparing to edit ${siteData.name}`,
      });
       // Placeholder for actual navigation
       console.log(`Navigate to /portal?salonId=${siteData.id}`);
    } else {
      // If no siteData (meaning it's just a template preview), maybe suggest creating a site
      toast({
        title: "Template Preview",
        description: "This is just a template preview. Create a site based on this template to edit.",
      });
       // Placeholder for suggesting action or navigating to template selection with intent
       console.log(`Navigate to /portal?templateId=${template.id}`);
    }
     // Close the modal after action (optional, depends on UX)
     // onClose();
  };

  const handleContact = () => {
    if (siteData) {
      // If siteData exists, this might be for contacting the salon (if it's a lead)
      // Or maybe this button shouldn't appear for a user's own claimed site?
      // Assuming this is an admin/sales view contacting a *lead* salon.
      toast({
        title: "Contact Form",
        description: `Opening contact options for ${siteData.name}.`,
      });
      // Placeholder for actual contact modal/page navigation
      console.log(`Navigate to /admin/salons/${siteData.id}/contact`); // Example admin route
    } else {
      // If no siteData, this button is probably not relevant for a template preview
      toast({
        title: "Template Preview",
        description: "This is just a template preview. 'Contact Salon' is not available here.",
      });
    }
     // Close the modal after action (optional)
     // onClose();
  };

  const handleCopyUrl = () => {
    if (siteData) {
      // Use siteData.sample_url (snake_case from lib/api.ts Salon type)
      // Ensure the base URL is correct for your demo sites
      const demoUrl = `${window.location.origin}/demo/${siteData.sample_url}`;
      navigator.clipboard.writeText(demoUrl);
      toast({
        title: "URL Copied",
        description: "Sample site URL has been copied to clipboard.",
      });
      // Log the URL for debugging
      console.log("Copied URL:", demoUrl);
    } else {
      toast({
        title: "Template Preview",
        description: "This is just a template preview. No specific site URL to copy.",
      });
    }
  };

  // Construct the iframe source URL
  // If siteData exists, use its sample_url (snake_case)
  // If not (it's a template preview), use the template.id
  // Assuming the /demo/preview route is the one that takes ?templateId=X
  const iframeSrc = siteData
    ? `/demo/${siteData.sample_url}?preview=true` // Use siteData.sample_url
    : `/demo/preview?templateId=${template.id}`; // Use template.id for preview

  // Text for the dialog title
  const titleText = siteData
    ? `Sample Website: ${siteData.name} - ${siteData.location}` // Use siteData.name, siteData.location
    : `Template Preview: ${template.name}`; // Use template.name


  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
       // Reset iframe loading state when modal closes
       if (!open) {
           setIsIframeLoading(true);
           onClose();
       }
    }}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{titleText}</DialogTitle>
        </DialogHeader>

        {/* Added height for consistent modal size even when loading */}
        <div className="mt-4 h-[600px] border border-gray-200 rounded-lg bg-gray-50 overflow-hidden relative">
          {isIframeLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-10"> {/* Overlay */}
              <LoaderIcon className="h-12 w-12 animate-spin text-primary" />
               <span className="ml-2 text-gray-600">Loading preview...</span>
            </div>
          )}

          <iframe
            src={iframeSrc}
            className="w-full h-full"
            title={titleText}
            onLoad={() => setIsIframeLoading(false)}
            onError={() => {
               setIsIframeLoading(false);
               toast({
                  title: "Preview Error",
                  description: `Could not load the preview from ${iframeSrc}`,
                  variant: "destructive"
               });
            }}
            // Initially hide iframe until loaded to prevent flash of broken state
            style={{ visibility: isIframeLoading ? 'hidden' : 'visible' }}
          />
        </div>

        <DialogFooter className="sm:justify-between">
          <div className="flex space-x-2">
             {/* Optionally hide/change buttons based on whether it's a template preview or a real site preview */}
             {siteData ? (
                <>
                 {/* Buttons for a generated/claimed site */}
                  <Button variant="default" onClick={handleEdit}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Website
                  </Button>
                  {/* Assuming Contact Salon is for lead management, hide if it's a user's own site */}
                  {/* <Button variant="outline" onClick={handleContact}>
                    <Phone className="mr-2 h-4 w-4" />
                    Contact Salon
                  </Button> */}
                </>
             ) : (
                <>
                 {/* Buttons for a template preview */}
                 <Button variant="default" onClick={handleEdit}>
                   <Pencil className="mr-2 h-4 w-4" />
                   Use This Template {/* Button text changed for preview mode */}
                 </Button>
                 {/* Contact button is not relevant for template preview */}
                </>
             )}
          </div>
           {/* Copy URL button is relevant if siteData exists */}
          {siteData && (
             <Button variant="outline" onClick={handleCopyUrl}>
               <Copy className="mr-2 h-4 w-4" />
               Copy Site URL
             </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}