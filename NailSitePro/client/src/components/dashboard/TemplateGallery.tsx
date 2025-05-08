import { useQuery } from "@tanstack/react-query";
import { Template } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, CheckCircle } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { WebsitePreviewModal } from "./WebsitePreviewModal";

export function TemplateGallery() {
  const { data: templates, isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });
  
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const { toast } = useToast();

  const handleAddTemplate = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Adding custom templates will be available in a future update.",
    });
  };

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
  };

  const closePreview = () => {
    setPreviewTemplate(null);
  };

  return (
    <div className="mt-10">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Nail Salon Templates</h3>
          <p className="mt-1 text-sm text-gray-500">
            Pre-designed, mobile-friendly templates for nail salons.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button
            variant="outline"
            className="text-primary border-primary hover:bg-gray-50"
            onClick={handleAddTemplate}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Template
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
        {isLoading
          ? Array(3)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="group relative overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative h-80 w-full overflow-hidden bg-gray-200">
                      <Skeleton className="h-full w-full" />
                    </div>
                    <div className="p-4">
                      <Skeleton className="h-5 w-24 mb-2" />
                      <Skeleton className="h-4 w-full" />
                      <div className="mt-2 flex justify-between items-center">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          : templates?.map((template) => (
              <Card key={template.id} className="group relative overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-80 w-full overflow-hidden bg-gray-200 group-hover:opacity-75">
                    <AspectRatio ratio={3/4}>
                      <img
                        src={template.previewImageUrl}
                        alt={`${template.name} nail salon template design`}
                        className="w-full h-full object-cover object-center"
                      />
                    </AspectRatio>
                  </div>
                  <div className="p-4">
                    <h4 className="text-sm font-medium text-gray-900">{template.name}</h4>
                    <p className="mt-1 text-sm text-gray-500">{template.description}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-xs font-medium text-gray-500">
                          Mobile Optimized
                        </span>
                        {template.isMobileOptimized && (
                          <CheckCircle className="ml-1 h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:bg-gray-50"
                        onClick={() => handlePreview(template)}
                      >
                        Preview
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {previewTemplate && (
        <WebsitePreviewModal
          isOpen={!!previewTemplate}
          onClose={closePreview}
          template={previewTemplate}
        />
      )}
    </div>
  );
}
