// src/components/layouts/TemplateLayoutVibrant.tsx
import React from 'react';
import { TemplateLayoutProps } from '@/types';

// Import all reusable section components
import HeroSection from '../sections/HeroSection';
import InfoStripSection from '../sections/InfoStripSection';
import AboutSection from '../sections/AboutSection';
import ServicesSection from '../sections/ServicesSection';
import GallerySection from '../sections/GallerySection';
import TestimonialsSection from '../sections/TestimonialsSection';
import ContactSection from '../sections/ContactSection';

/**
 * Defines the layout structure for the 'Vibrant' template.
 * This component arranges the reusable section components.
 */
const TemplateLayoutVibrant: React.FC<TemplateLayoutProps> = ({
  salon,
  template,
  isMobileMenuOpen, setIsMobileMenuOpen,
  openUrl,
  isPreview
}) => {

  return (
    <>
      {/* Vibrant Hero might use bright colors or energetic imagery */}
      <HeroSection
         salon={salon}
         template={template}
         config={template?.features?.hero_layout || 'vibrant'}
         openUrl={openUrl}
      />

       {/* Info Strip, maybe with bold icons/colors */}
       <InfoStripSection
         salon={salon}
         template={template}
         openUrl={openUrl}
       />

      {/* Services section, possibly with colorful cards */}
      <ServicesSection
         salon={salon}
         template={template}
         config={template?.features?.services_display || 'grid-colorful'} // Example: custom grid style
         openUrl={openUrl}
      />

       {/* About section */}
      <AboutSection
         salon={salon}
         template={template}
         openUrl={openUrl}
      />

      {/* Gallery full of vibrant images */}
       <GallerySection
          salon={salon}
          template={template}
          config={{ cols: template?.features?.gallery_cols || 3 }}
          openUrl={openUrl}
       />

      {/* Testimonials, perhaps with accent colors */}
      <TestimonialsSection
         salon={salon}
         template={template}
         openUrl={openUrl}
      />

      {/* Contact section, maybe with an inviting form/map style */}
      <ContactSection
         salon={salon}
         template={template}
         openUrl={openUrl}
      />
    </>
  );
}

export default TemplateLayoutVibrant;