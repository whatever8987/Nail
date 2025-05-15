// src/components/layouts/TemplateLayoutArtistic.tsx
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
 * Defines the layout structure for the 'Artistic' template.
 * This component arranges the reusable section components.
 */
const TemplateLayoutArtistic: React.FC<TemplateLayoutProps> = ({
  salon,
  template,
  isMobileMenuOpen, setIsMobileMenuOpen,
  openUrl,
  isPreview
}) => {

  return (
    <>
      {/* Artistic Hero might be visually striking */}
      <HeroSection
         salon={salon}
         template={template}
         config={template?.features?.hero_layout || 'artistic'}
         openUrl={openUrl}
      />

       {/* Info Strip could have unique styling */}
       <InfoStripSection
         salon={salon}
         template={template}
         openUrl={openUrl}
       />

       {/* About section might have a creative arrangement */}
      <AboutSection
         salon={salon}
         template={template}
         openUrl={openUrl}
      />

      {/* Services presentation could be unconventional */}
      <ServicesSection
         salon={salon}
         template={template}
         config={template?.features?.services_display || 'cards-artistic'} // Example: custom card style
         openUrl={openUrl}
      />

      {/* Gallery is often central to artistic themes */}
       <GallerySection
          salon={salon}
          template={template}
          config={{ cols: template?.features?.gallery_cols || 3 }} // Or maybe asymmetrical layout config?
          openUrl={openUrl}
       />

      {/* Testimonials styled creatively */}
      <TestimonialsSection
         salon={salon}
         template={template}
         openUrl={openUrl}
      />

      {/* Contact section might include unique visual elements */}
      <ContactSection
         salon={salon}
         template={template}
         openUrl={openUrl}
      />
    </>
  );
}

export default TemplateLayoutArtistic;