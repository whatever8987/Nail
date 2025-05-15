// src/components/layouts/TemplateLayoutNatural.tsx
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
 * Defines the layout structure for the 'Natural' template.
 * This component arranges the reusable section components.
 */
const TemplateLayoutNatural: React.FC<TemplateLayoutProps> = ({
  salon,
  template,
  isMobileMenuOpen, setIsMobileMenuOpen,
  openUrl,
  isPreview
}) => {

  return (
    <>
      {/* Natural Hero might use earthy tones or nature imagery */}
      <HeroSection
         salon={salon}
         template={template}
         config={template?.features?.hero_layout || 'natural'}
         openUrl={openUrl}
      />

       {/* Info Strip */}
       <InfoStripSection
         salon={salon}
         template={template}
         openUrl={openUrl}
       />

       {/* About section, emphasizing organic feel */}
      <AboutSection
         salon={salon}
         template={template}
         openUrl={openUrl}
      />

      {/* Services section, maybe with softer borders/styles */}
      <ServicesSection
         salon={salon}
         template={template}
         config={template?.features?.services_display || 'list'} // Natural might prefer list
         openUrl={openUrl}
      />

      {/* Gallery with focus on textures/natural light */}
       <GallerySection
          salon={salon}
          template={template}
          config={{ cols: template?.features?.gallery_cols || 2 }} // Maybe fewer, larger images
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

export default TemplateLayoutNatural;