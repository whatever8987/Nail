// src/components/layouts/TemplateLayoutMinimalist.tsx
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
 * Defines the layout structure for the 'Minimalist' template.
 * This component arranges the reusable section components.
 */
const TemplateLayoutMinimalist: React.FC<TemplateLayoutProps> = ({
  salon,
  template,
  isMobileMenuOpen, setIsMobileMenuOpen,
  openUrl,
  isPreview
}) => {

  return (
    <>
      {/* Minimalist Hero might be simple text or clean image */}
      <HeroSection
         salon={salon}
         template={template}
         config={template?.features?.hero_layout || 'minimalist'}
         openUrl={openUrl}
      />

       {/* Info strip, perhaps very subtle */}
       <InfoStripSection
         salon={salon}
         template={template}
         openUrl={openUrl}
       />

       {/* About section, clean and direct */}
      <AboutSection
         salon={salon}
         template={template}
         openUrl={openUrl}
      />

      {/* Services, clear list or simple grid */}
      <ServicesSection
         salon={salon}
         template={template}
         config={template?.features?.services_display || 'list'} // Minimalist might prefer a list
         openUrl={openUrl}
      />

      {/* Gallery, perhaps only essential images */}
       <GallerySection
          salon={salon}
          template={template}
          config={{ cols: template?.features?.gallery_cols || 3 }}
          openUrl={openUrl}
       />

      {/* Testimonials, concise */}
      <TestimonialsSection
         salon={salon}
         template={template}
         openUrl={openUrl}
      />

      {/* Contact section, straightforward */}
      <ContactSection
         salon={salon}
         template={template}
         openUrl={openUrl}
      />
    </>
  );
}

export default TemplateLayoutMinimalist;