// src/components/dashboard/TemplateGallery.tsx
import React, { useState } from 'react'; // Ensure React is imported
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, CheckCircle } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast"; // Keep toast for UI interaction
// import { WebsitePreviewModal } from "./WebsitePreviewModal"; // Remove or mock if not critical for standalone display

// Define a dummy Template type
interface DummyTemplate {
  id: number;
  name: string;
  description: string;
  previewImageUrl: string;
  isMobileOptimized: boolean;
  features?: string[]; // Optional features array
}

interface TemplateGalleryProps {
    templates?: DummyTemplate[];
    isLoading?: boolean;
}

// Sample dummy data
const dummyTemplatesData: DummyTemplate[] = [
  { id: 1, name: "Elegant", description: "Light & Minimal design...", previewImageUrl: "https://picsum.photos/seed/elegant-template/600/800", isMobileOptimized: true, features: ["Minimalist Design", "Fast Loading"] },
  { id: 2, name: "Modern", description: "Bold & Contemporary design...", previewImageUrl: "https://picsum.photos/seed/modern-template/600/800", isMobileOptimized: true, features: ["Dark Mode Option", "Animations"] },
  { id: 3, name: "Luxury", description: "Premium & Sophisticated design...", previewImageUrl: "https://picsum.photos/seed/luxury-template/600/800", isMobileOptimized: true, features: ["High-res Images", "Booking Form"] },
  { id: 4, name: "Friendly", description: "Warm & Inviting design...", previewImageUrl: "https://picsum.photos/seed/friendly-template/600/800", isMobileOptimized: true, features: ["Color Schemes", "Testimonials"] },
];

// Mock WebsitePreviewModal if it's complex or has external dependencies not needed for UI display
const MockWebsitePreviewModal = ({ isOpen, onClose, templateName }: { isOpen: boolean, onClose: () => void, templateName: string }) => {
    if (!isOpen) return null;
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <h2>Previewing: {templateName}</h2>
                <p>(Actual preview modal would go here)</p>
                <button onClick={onClose} style={{ marginTop: '10px', padding: '5px 10px' }}>Close</button>
            </div>
        </div>
    );
};


export function TemplateGallery({ templates = dummyTemplatesData, isLoading = false }: TemplateGalleryProps) {
  const [previewTemplate, setPreviewTemplate] = useState<DummyTemplate | null>(null);
  const { toast } = useToast(); // Keep toast for basic UI feedback

  const handleAddTemplate = () => {
    toast({
      title: "Feature Info",
      description: "Adding custom templates is an admin feature.",
    });
  };

  const handlePreview = (template: DummyTemplate) => {
    setPreviewTemplate(template);
  };

  const closePreview = () => {
    setPreviewTemplate(null);
  };

  const displayTemplates = templates;

  return (
    <div className="mt-10">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h3 className="text-lg leading-6 font-medium text-foreground">Nail Salon Templates</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Pre-designed, mobile-friendly templates for nail salons.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-4 sm:flex-none"> {/* Adjusted ml-16 to ml-4 for better spacing */}
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10" // Adjusted hover
            onClick={handleAddTemplate}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Template
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8"> {/* Added xl:grid-cols-4 for more items */}
        {(isLoading ? Array(4).fill(0) : displayTemplates).map((templateOrSkeleton, index) =>
          isLoading ? (
            <Card key={`skeleton-${index}`} className="group relative overflow-hidden shadow-sm">
              <CardContent className="p-0">
                <AspectRatio ratio={3 / 4} className="bg-muted">
                   <Skeleton className="h-full w-full" />
                </AspectRatio>
                <div className="p-4 border-t border-border">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                   <Skeleton className="h-4 w-2/3" />
                  <div className="mt-3 flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card key={(templateOrSkeleton as DummyTemplate).id} className="group relative overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-0">
                <div className="relative w-full overflow-hidden bg-muted group-hover:opacity-90 transition-opacity">
                  <AspectRatio ratio={3 / 4}>
                    <img
                      src={(templateOrSkeleton as DummyTemplate).previewImageUrl}
                      alt={`${(templateOrSkeleton as DummyTemplate).name} template design`}
                      className="w-full h-full object-cover object-center"
                      onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/600x800?text=No+Image')} // Fallback image
                    />
                  </AspectRatio>
                   {/* Optional: Overlay for actions on hover */}
                   {/* <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Button variant="secondary" size="sm" onClick={() => handlePreview(templateOrSkeleton as DummyTemplate)}>Quick Preview</Button>
                   </div> */}
                </div>
                <div className="p-4 border-t border-border">
                  <h4 className="text-sm font-semibold text-foreground truncate">{ (templateOrSkeleton as DummyTemplate).name }</h4>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2 h-8">{(templateOrSkeleton as DummyTemplate).description}</p> {/* Fixed height for description */}
                  <div className="mt-3 flex justify-between items-center">
                    <div className="flex items-center">
                      {(templateOrSkeleton as DummyTemplate).isMobileOptimized && (
                        <>
                           <CheckCircle className="ml-0 h-4 w-4 text-green-500" />
                           <span className="ml-1 text-xs font-medium text-muted-foreground">Mobile Ready</span>
                        </>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:bg-primary/10"
                      onClick={() => handlePreview(templateOrSkeleton as DummyTemplate)}
                    >
                      Preview
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {(displayTemplates.length === 0 && !isLoading) && (
              <p className="col-span-full text-center text-muted-foreground py-10">No templates available at the moment.</p>
          )}
      </div>

      {/* Use the mock preview modal or your actual one */}
      {previewTemplate && (
        <MockWebsitePreviewModal
          isOpen={!!previewTemplate}
          onClose={closePreview}
          templateName={previewTemplate.name}
        />
        // Replace with your actual WebsitePreviewModal if it can run standalone:
        // <WebsitePreviewModal
        //   isOpen={!!previewTemplate}
        //   onClose={closePreview}
        //   template={previewTemplate} // Ensure it accepts DummyTemplate or adapt
        // />
      )}
    </div>
  );
}