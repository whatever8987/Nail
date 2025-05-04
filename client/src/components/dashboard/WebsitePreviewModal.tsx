// src/components/dashboard/WebsitePreviewModal.tsx
import React, { useState } from 'react'; // Import React
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Phone, Copy, Loader2 } from "lucide-react"; // Import Loader2

// Define dummy types for standalone display
interface DummyTemplate {
  id: number;
  name: string;
  // Add other fields if needed by the modal logic (unlikely for pure display)
}

interface DummySiteData {
    id: number;
    name: string;
    location: string;
    sampleUrl: string;
}

interface WebsitePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: DummyTemplate; // Template is always needed for preview title
  siteData?: DummySiteData; // siteData is optional (distinguishes preview from existing site)
}

export function WebsitePreviewModal({
  isOpen,
  onClose,
  template, // Use template prop directly
  siteData
}: WebsitePreviewModalProps) {
  const { toast } = useToast();
  // Simulate iframe loading state
  const [isLoadingIframe, setIsLoadingIframe] = useState(true);

  // --- Simulated Actions ---
  const handleEdit = () => {
    if (siteData) {
      toast({
        title: "Action Simulated",
        description: `Would navigate to edit page for ${siteData.name}`,
      });
      // Example: navigate(`/admin/salons/edit/${siteData.id}`); // If using wouter navigate
    } else {
      toast({
        title: "Template Preview",
        description: "Cannot edit a template preview. Generate site first.",
        variant: "default" // Use default variant instead of destructive
      });
    }
    onClose(); // Close modal after action
  };

  const handleContact = () => {
    if (siteData) {
      toast({
        title: "Action Simulated",
        description: `Would open contact form for ${siteData.name}.`,
      });
    } else {
      toast({
        title: "Template Preview",
        description: "No specific salon to contact.",
        variant: "default"
      });
    }
     onClose(); // Close modal after action
  };

  const handleCopyUrl = () => {
    const urlToCopy = siteData
        ? `${window.location.origin}/app/demo/${siteData.sampleUrl}` // Construct hypothetical URL
        : null;

    if (urlToCopy) {
      navigator.clipboard.writeText(urlToCopy).then(() => {
          toast({
            title: "URL Copied!",
            description: "Sample site URL copied to clipboard.",
          });
      }).catch(err => {
          console.error('Failed to copy URL: ', err);
           toast({ title: "Copy Failed", description: "Could not copy URL.", variant: "destructive" });
      });
    } else {
      toast({
        title: "Template Preview",
        description: "No site URL to copy.",
        variant: "default"
      });
    }
  };

  // Determine title based on whether siteData exists
  const titleText = siteData
    ? `Sample: ${siteData.name} (${siteData.location})`
    : `Preview: ${template?.name || 'Template'}`;

  // Determine iframe source (using placeholder for preview)
  const iframeSrc = siteData
    ? `/app/demo/${siteData.sampleUrl}?preview=true` // Use relative path for potential routing
    : `https://via.placeholder.com/1200x800.png?text=Template+Preview+of+${encodeURIComponent(template?.name || '')}`; // Placeholder image URL

   // Reset iframe loading state when modal opens or src changes
   React.useEffect(() => {
     if (isOpen) {
       setIsLoadingIframe(true);
     }
   }, [isOpen, iframeSrc]);


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl md:max-w-5xl lg:max-w-6xl p-0"> {/* Adjusted size and padding */}
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle>{titleText}</DialogTitle>
        </DialogHeader>

        {/* Iframe container with loading state */}
        <div className="mt-0 h-[60vh] md:h-[70vh] relative bg-muted overflow-hidden">
          {isLoadingIframe && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          )}
          {/* Prevent iframe loading if modal is closed */}
          {isOpen && (
             <iframe
                // Use a key to force re-render if src changes drastically
                key={iframeSrc}
                src={iframeSrc}
                className={`w-full h-full border-0 transition-opacity duration-300 ${isLoadingIframe ? 'opacity-0' : 'opacity-100'}`}
                title={titleText}
                onLoad={() => setIsLoadingIframe(false)}
                onError={() => {
                    console.error("Iframe failed to load:", iframeSrc);
                    setIsLoadingIframe(false);
                    // Optionally show an error message within the iframe area
                }}
                // sandbox="allow-scripts allow-same-origin" // Consider sandbox attributes for security if loading external/untrusted content
             />
          )}
        </div>

        {/* Footer with actions */}
        <DialogFooter className="p-4 border-t border-border sm:justify-between">
          <div className="flex flex-wrap gap-2 mb-2 sm:mb-0"> {/* Allow wrapping */}
            <Button variant="default" size="sm" onClick={handleEdit}>
              <Pencil className="mr-1.5 h-4 w-4" />
              Edit Sample
            </Button>
            <Button variant="outline" size="sm" onClick={handleContact}>
              <Phone className="mr-1.5 h-4 w-4" />
              Contact Salon
            </Button>
          </div>
          <Button variant="secondary" size="sm" onClick={handleCopyUrl} disabled={!siteData}>
            <Copy className="mr-1.5 h-4 w-4" />
            Copy URL
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Define Dummy Template type if not imported from elsewhere
interface Template {
    id: number;
    name: string;
    // Add other fields if needed by modal
}