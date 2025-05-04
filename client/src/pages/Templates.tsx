// src/pages/Templates.tsx
import React, { useState } from 'react'; // Import React
// import { useLocation } from 'wouter'; // Remove if not navigating
import { TopNavigation } from "@/components/layout/TopNavigation"; // Assuming standalone or props based
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, PlusCircle, EyeIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

// Define dummy types
interface DummyUser { username: string; email?: string; role: 'user' | 'admin'; }
interface DummyTemplate {
  id: number;
  name: string;
  description: string;
  previewImageUrl: string;
  isMobileOptimized: boolean;
  features?: string[] | null; // Optional features
}

interface TemplatesPageProps {
    templates?: DummyTemplate[];
    isLoading?: boolean;
    user?: DummyUser | null; // For TopNavigation
}

// Sample dummy data
const dummyUserData: DummyUser | null = null; // Simulate logged out
const dummyTemplatesData: DummyTemplate[] = [
    { id: 1, name: "Elegant", description: "Light & Minimal design for upscale salons.", previewImageUrl: "https://picsum.photos/seed/elegant/600/400", isMobileOptimized: true, features: ["Clean Layout", "Fast Load", "Booking Form"] },
    { id: 2, name: "Modern", description: "Bold & Contemporary design with accents.", previewImageUrl: "https://picsum.photos/seed/modern/600/400", isMobileOptimized: true, features: ["Image Gallery", "Animations", "Color Options"] },
    { id: 3, name: "Luxury", description: "Premium & Sophisticated high-end look.", previewImageUrl: "https://picsum.photos/seed/luxury/600/400", isMobileOptimized: true, features: ["Video Background", "Testimonials", "Advanced Booking"] },
    { id: 4, name: "Friendly", description: "Warm & Inviting for a welcoming feel.", previewImageUrl: "https://picsum.photos/seed/friendly/600/400", isMobileOptimized: true, features: ["Map Integration", "Team Section", "Blog Ready"] },
    { id: 5, name: "Minimalist", description: "Clean & Simple, focus on content.", previewImageUrl: "https://picsum.photos/seed/minimal/600/400", isMobileOptimized: true, features: ["Fast Loading", "Easy Navigation", "Contact Form"] },
    { id: 6, name: "Vibrant", description: "Colorful & Energetic design.", previewImageUrl: "https://picsum.photos/seed/vibrant/600/400", isMobileOptimized: true, features: ["Bold Colors", "Gallery Showcase", "Social Links"] },
];


export default function Templates({
    templates = dummyTemplatesData,
    isLoading: isLoadingTemplates = false, // Renamed for clarity
    user = dummyUserData
}: TemplatesPageProps) {
  // const [, navigate] = useLocation(); // Remove if not navigating
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  // Use dummy data
  const isLoggedIn = !!user;
  const isLoadingUser = false; // Simulate user loaded

  // Simulate selecting a template
  const handleTemplateSelect = (templateId: number) => {
    if (!isLoggedIn) {
      toast({ title: "Login required", description: "Please log in to select a template", variant: "destructive" });
      alert("Simulating redirect to login.");
      // navigate("/login?redirect=/templates");
      return;
    }
    setSelectedTemplate(templateId);
    toast({ title: "Template Selected", description: "Ready to continue." });
  };

  // Simulate previewing a template
  const handleTemplatePreview = async (templateId: number) => {
      const templateName = templates.find(t => t.id === templateId)?.name || `Template ${templateId}`;
      // Construct a fake preview URL for simulation
      const previewUrl = `/app/demo/sample-salon-${templateId}`; // Use relative path for display
      alert(`Simulating preview: Would open ${previewUrl} (based on ${templateName}) in new tab.`);
      // window.open(previewUrl, '_blank'); // Uncomment to attempt navigation
  };

  // Simulate continuing with selection
  const handleContinue = () => {
    if (selectedTemplate) {
        alert(`Simulating navigation to Portal/Setup with Template ID: ${selectedTemplate}`);
      // navigate(`/portal?template=${selectedTemplate}`); // Real navigation
    } else {
      toast({ title: "No template selected", description: "Please select a template", variant: "destructive" });
    }
  };

  const isLoading = isLoadingUser || isLoadingTemplates;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const displayTemplates = templates;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopNavigation user={user} isLoggedIn={isLoggedIn} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Choose Your Website Template</h1>
          <p className="mt-3 text-xl text-muted-foreground max-w-2xl mx-auto">
            Select a professionally designed, mobile-friendly template for your salon.
          </p>
        </div>

        {isLoadingTemplates && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                 {Array(6).fill(0).map((_, index) => (
                     <Card key={`skeleton-${index}`} className="overflow-hidden shadow-sm border border-border">
                         <Skeleton className="h-48 w-full bg-muted" />
                         <CardHeader>
                             <Skeleton className="h-6 w-3/4" />
                             <Skeleton className="h-4 w-full mt-2" />
                         </CardHeader>
                         <CardContent>
                              <div className="space-y-2">
                                 <Skeleton className="h-4 w-5/6" />
                                 <Skeleton className="h-4 w-4/6" />
                              </div>
                         </CardContent>
                         <CardFooter className="flex justify-between">
                              <Skeleton className="h-9 w-24" />
                              <Skeleton className="h-9 w-24" />
                         </CardFooter>
                     </Card>
                 ))}
             </div>
        )}

        {!isLoadingTemplates && displayTemplates && displayTemplates.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {displayTemplates.map((template) => (
                <Card
                  key={template.id}
                  className={`overflow-hidden transition-all duration-200 flex flex-col shadow-md hover:shadow-xl ${selectedTemplate === template.id ? 'ring-2 ring-primary ring-offset-2' : 'border border-border'}`}
                >
                  <div className="aspect-video relative"> {/* Use aspect-video or similar */}
                    <img
                      src={template.previewImageUrl}
                      alt={template.name}
                      className="object-cover w-full h-full"
                      onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Preview')} // Fallback
                    />
                    {template.isMobileOptimized && (
                      <Badge className="absolute top-2 right-2 bg-primary/80 backdrop-blur-sm text-primary-foreground text-xs"> Mobile Ready </Badge>
                    )}
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="text-sm h-10 line-clamp-2">{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    {template.features && template.features.length > 0 && (
                       <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Features</p>
                         {template.features.map((feature, index) => (
                           <div key={index} className="flex items-center">
                             <CheckCircle className="h-4 w-4 text-green-500 mr-1.5 flex-shrink-0" />
                             <span className="text-xs text-muted-foreground">{feature}</span>
                           </div>
                         ))}
                       </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between gap-2 pt-4 border-t border-border bg-muted/50">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTemplatePreview(template.id)}
                    >
                      <EyeIcon className="h-4 w-4 mr-1.5" /> Preview
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleTemplateSelect(template.id)}
                      variant={selectedTemplate === template.id ? "default" : "secondary"}
                      className="flex-grow sm:flex-grow-0" // Let select button take more space if needed
                    >
                      {selectedTemplate === template.id ? (
                         <CheckCircle className="h-4 w-4 mr-1.5" />
                      ) : (
                         <PlusCircle className="h-4 w-4 mr-1.5" />
                      )}
                      {selectedTemplate === template.id ? "Selected" : "Select"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Sticky Continue Button */}
            {selectedTemplate && (
              <div className="sticky bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border mt-10 flex justify-center z-40 shadow-lg">
                <Button size="lg" onClick={handleContinue}>
                  Continue with Selected Template
                </Button>
              </div>
            )}
          </>
        ) : null}

         {/* No Templates Message */}
         {!isLoadingTemplates && (!displayTemplates || displayTemplates.length === 0) && (
              <div className="text-center py-16">
                 <p className="text-lg text-muted-foreground">No templates available at the moment.</p>
              </div>
         )}
      </main>
    </div>
  );
}

// Define dummy types if needed elsewhere
interface User { username: string; email?: string; role: 'user' | 'admin'; }
interface Template { id: number; name: string; description: string; previewImageUrl: string; isMobileOptimized: boolean; features?: string[] | null; }