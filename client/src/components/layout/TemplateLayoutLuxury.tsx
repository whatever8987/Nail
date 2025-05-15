// src/components/layouts/TemplateLayoutLuxury.tsx
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
 * Defines the layout structure for the 'Luxury' template.
 * This component arranges the reusable section components.
 */
const TemplateLayoutLuxury: React.FC<TemplateLayoutProps> = ({
  salon,
  template,
  isMobileMenuOpen, setIsMobileMenuOpen,
  openUrl,
  isPreview
}) => {

  return (
    <>
      {/* Luxury layout often features a very strong visual Hero */}
      <HeroSection
         salon={salon}
         template={template}
         config={template?.features?.hero_layout || 'luxury'}
         openUrl={openUrl}
      />

       {/* Info strip might be subtle or integrated differently */}
       <InfoStripSection
         salon={salon}
         template={template}
         openUrl={openUrl}
       />

       {/* Services and About might be presented in a polished way */}
       <ServicesSection
          salon={salon}
          template={template}
          config={template?.features?.services_display || 'list-detailed'} // Example: custom list style
          openUrl={openUrl}
       />

      <AboutSection
         salon={salon}
         template={template}
         openUrl={openUrl}
      />

      {/* Testimonials add credibility */}
      <TestimonialsSection
         salon={salon}
         template={template}
         openUrl={openUrl}
      />

       {/* High-quality Gallery images are key for luxury */}
       <GallerySection
          salon={salon}
          template={template}
          config={{ cols: template?.features?.gallery_cols || 3 }}
          openUrl={openUrl}
       />

      {/* Contact section */}
      <ContactSection
         salon={salon}
         template={template}
         openUrl={openUrl}
      />
    </>
  );
}

export default TemplateLayoutLuxury;