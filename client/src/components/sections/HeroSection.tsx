// src/components/sections/HeroSection.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { SectionProps } from '@/types'; // Use shared types


const HeroSection: React.FC<SectionProps> = ({ salon, template, config, openUrl }) => {
  // Decide if the section should render based on data availability
  if (!salon.name && !salon.cover_image && !template?.default_cover_image && !salon.hero_subtitle && !salon.booking_url) {
      return null; // Don't render if no content exists
  }

  // Determine background image source (Salon image takes priority, then template default)
  const bgImage = salon.cover_image || template?.default_cover_image || '/placeholder-cover.jpg'; // Fallback

  // Determine layout class based on the 'config' prop passed from the layout component
  // Example: config could be 'centered', 'left-aligned', 'full-width-image'
  const layoutClass = config ? `hero-layout-${config}` : 'hero-layout-centered';


  return (
    <section
      id="home" // Keep ID for navigation
      className={`relative h-[70vh] md:h-[80vh] flex items-center text-white overflow-hidden hero-section ${layoutClass}`} // Add base class and layout class
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        // text color is handled by the parent div's style or CSS variables
      }}
    >
      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-black/50" // Adjust overlay opacity as needed
        aria-hidden="true"
      ></div>

      {/* Content Container - Adjust position/alignment based on layoutClass via CSS */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl"> {/* Adjust max-width/position based on layout */}
          {/* Use CSS variables for text color, applied by the layout/wrapper */}
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {salon.name || 'Your Salon'}
          </h1>
          {salon.hero_subtitle && (
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              {salon.hero_subtitle}
            </p>
          )}
          {salon.booking_url && (
              <Button
                className="px-8 py-3 text-lg rounded-sm hover:bg-opacity-90 transition-colors duration-200"
                 style={{
                  backgroundColor: 'var(--secondary-color)', // Use CSS variable
                  color: 'var(--text-on-secondary-color, white)' // Assume contrasting color or define another variable
                }}
                onClick={() => openUrl(salon.booking_url)}
              >
                Book Your Visit
              </Button>
          )}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;