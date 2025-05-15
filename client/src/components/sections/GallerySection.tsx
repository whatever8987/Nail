// src/components/sections/GallerySection.tsx
import React from 'react';
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui Button
import { SectionProps } from '@/types'; // Import shared types
// import './GallerySection.css'; // Optional: Create if needed

const GallerySection: React.FC<SectionProps> = ({ salon, template, config, openUrl }) => {
    // Only show if template feature is enabled AND there are gallery images
    const galleryImages = Array.isArray(salon.gallery_images) ? salon.gallery_images : [];
    const isEnabled = template?.features?.show_gallery;

    if (!isEnabled || galleryImages.length === 0) {
        return null;
    }

    // Determine grid columns based on config prop (e.g., { cols: 3 })
    const cols = config?.cols || 3; // Default to 3 columns

    // Tailwind CSS grid classes are tricky with dynamic values directly in template literals.
    // A common approach is to use a lookup object or apply styles dynamically.
    // For simplicity here, let's stick to common grid sizes or use inline style for grid-template-columns.
    // Using a lookup for grid columns class
    const gridColsClass = {
        1: 'grid-cols-1',
        2: 'sm:grid-cols-2',
        3: 'sm:grid-cols-2 md:grid-cols-3',
        4: 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        // Add more cases as needed
    }[cols] || 'sm:grid-cols-2 md:grid-cols-3'; // Fallback


    return (
        <section id="gallery" className="py-16 md:py-24" style={{ color: 'var(--text-color)' }}>
          <div className="container mx-auto px-6">
            <h2
              className="text-3xl md:text-4xl font-bold mb-12 text-center"
              style={{ color: 'var(--primary-color)' }}
            >
              Our Work
            </h2>
             {/* Optional Tagline */}
            {salon.gallery_tagline && (
                 <p className="text-center text-lg mb-10 text-muted-foreground">{salon.gallery_tagline}</p>
            )}

            {/* Use dynamic grid class */}
            <div className={`grid grid-cols-1 ${gridColsClass} gap-6`}>
              {galleryImages.map((image: string, index: number) => (
                <div key={index} className="overflow-hidden shadow-md rounded-md">
                  <img
                    src={image}
                    alt={`Salon work ${index + 1}`}
                    className="w-full h-64 object-cover transform hover:scale-105 transition-transform duration-300"
                    loading="lazy" // Added lazy loading
                  />
                </div>
              ))}
            </div>

             {salon.gallery_url && (
              <div className="mt-12 text-center">
                <Button
                  variant="outline"
                  className="px-6 py-2 rounded-sm hover:opacity-90 transition-colors duration-200"
                   style={{
                    borderColor: 'var(--primary-color)',
                    color: 'var(--primary-color)'
                  }}
                   onClick={() => openUrl(salon.gallery_url)}
                >
                  View Full Gallery
                </Button>
              </div>
            )}
          </div>
        </section>
    );
}

export default GallerySection;