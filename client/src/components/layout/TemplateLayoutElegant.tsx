// src/components/layouts/TemplateLayoutElegant.tsx
import React from 'react';
import { TemplateLayoutProps } from '@/types'; // Import shared types

// Import all reusable section components
import HeroSection from '../sections/HeroSection';
import InfoStripSection from '../sections/InfoStripSection';
import AboutSection from '../sections/AboutSection';
import ServicesSection from '../sections/ServicesSection';
import GallerySection from '../sections/GallerySection';
import TestimonialsSection from '../sections/TestimonialsSection';
import ContactSection from '../sections/ContactSection';
// Header and Footer are typically handled by the wrapper (SampleSite.tsx)


/**
 * Defines the layout structure for the 'Elegant' template.
 * This component arranges the reusable section components in a specific order.
 */
const TemplateLayoutElegant: React.FC<TemplateLayoutProps> = ({
  salon,
  template,
  isMobileMenuOpen, // Passed down, but likely only needed by Header/Footer if part of layout
  setIsMobileMenuOpen, // Passed down, but likely only needed by Header/Footer if part of layout
  openUrl,
  isPreview
}) => {

  // Elegant Layout might prioritize visuals or have a different flow

  return (
    // You could add layout-specific wrapper divs or classes here if needed
    // <div className="elegant-template-layout">
    <>
      {/* Hero Section - Maybe a different config */}
      <HeroSection
         salon={salon}
         template={template}
         config={template?.features?.hero_layout || 'elegant-layout'} // Pass layout-specific config
         openUrl={openUrl}
      />

      {/* Elegant might show the About and Info Strip side-by-side or nearby */}
       <div className="elegant-section-group-1 grid grid-cols-1 md:grid-cols-2 gap-8">
           <AboutSection
              salon={salon}
              template={template}
              openUrl={openUrl}
           />
            {/* Info Strip could be styled as a card here */}
           <InfoStripSection
              salon={salon}
              template={template}
              openUrl={openUrl}
           />
       </div>


      {/* Services Section */}
      <ServicesSection
         salon={salon}
         template={template}
         config={template?.features?.services_display || 'grid'} // Maybe elegant uses grid
         openUrl={openUrl}
      />

      {/* Testimonials Section */}
      <TestimonialsSection
         salon={salon}
         template={template}
         openUrl={openUrl}
      />

      {/* Gallery Section might be placed near the end */}
      <GallerySection
         salon={salon}
         template={template}
         config={{ cols: template?.features?.gallery_cols || 4 }} // Maybe elegant uses more columns
         openUrl={openUrl}
      />


      {/* Contact Section */}
      <ContactSection
         salon={salon}
         template={template}
         openUrl={openUrl}
      />

    </>
     // </div>
  );
}

export default TemplateLayoutElegant;