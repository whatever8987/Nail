// src/components/layouts/TemplateLayoutDarkMode.tsx
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
 * Defines the layout structure for the 'Dark Mode' template.
 * This component arranges the reusable section components.
 */
const TemplateLayoutDarkMode: React.FC<TemplateLayoutProps> = ({
  salon,
  template,
  isMobileMenuOpen, setIsMobileMenuOpen,
  openUrl,
  isPreview
}) => {

  // Note: The dark/light mode *colors* are handled by CSS variables set in SampleSite.tsx
  // This layout component just defines the *order* and any specific structural overrides.

  return (
    <>
      {/* Dark Mode Hero */}
      <HeroSection
         salon={salon}
         template={template}
         config={template?.features?.hero_layout || 'dark-mode'}
         openUrl={openUrl}
      />

       {/* Info Strip */}
       <InfoStripSection
         salon={salon}
         template={template}
         openUrl={openUrl}
       />

       {/* About section */}
      <AboutSection
         salon={salon}
         template={template}
         openUrl={openUrl}
      />

      {/* Services section */}
      <ServicesSection
         salon={salon}
         template={template}
         config={template?.features?.services_display || 'grid'}
         openUrl={openUrl}
      />

      {/* Gallery */}
       <GallerySection
          salon={salon}
          template={template}
          config={{ cols: template?.features?.gallery_cols || 3 }}
          openUrl={openUrl}
       />

      {/* Testimonials */}
      <TestimonialsSection
         salon={salon}
         template={template}
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

export default TemplateLayoutDarkMode;