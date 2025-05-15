// src/components/layouts/TemplateLayoutFriendly.tsx
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
 * Defines the layout structure for the 'Friendly' template.
 * This component arranges the reusable section components.
 */
const TemplateLayoutFriendly: React.FC<TemplateLayoutProps> = ({
  salon,
  template,
  isMobileMenuOpen, setIsMobileMenuOpen,
  openUrl,
  isPreview
}) => {

  return (
    <>
      {/* Friendly layout might have a welcoming Hero */}
      <HeroSection
         salon={salon}
         template={template}
         config={template?.features?.hero_layout || 'friendly'}
         openUrl={openUrl}
      />

      {/* Info Strip upfront is helpful */}
       <InfoStripSection
         salon={salon}
         template={template}
         openUrl={openUrl}
       />

       {/* About section to build connection */}
      <AboutSection
         salon={salon}
         template={template}
         openUrl={openUrl}
      />

      {/* Services presented clearly */}
      <ServicesSection
         salon={salon}
         template={template}
         config={template?.features?.services_display || 'grid'}
         openUrl={openUrl}
      />

      {/* Testimonials reinforce friendliness */}
      <TestimonialsSection
         salon={salon}
         template={template}
         openUrl={openUrl}
      />

       {/* Gallery for a peek inside */}
       <GallerySection
          salon={salon}
          template={template}
          config={{ cols: template?.features?.gallery_cols || 2 }} // Maybe fewer columns for a more personal feel
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

export default TemplateLayoutFriendly;