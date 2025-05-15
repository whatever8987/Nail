// src/components/layouts/TemplateLayoutClassic.tsx
import React from 'react';
import { TemplateLayoutProps } from '@/types';

// Import reusable section components
import HeroSection from '../sections/HeroSection';
import InfoStripSection from '../sections/InfoStripSection';
import AboutSection from '../sections/AboutSection';
import ServicesSection from '../sections/ServicesSection';
import GallerySection from '../sections/GallerySection';
import TestimonialsSection from '../sections/TestimonialsSection';
import ContactSection from '../sections/ContactSection';
// Footer and Header might be handled by the wrapper (SampleSite.tsx)

const TemplateLayoutClassic: React.FC<TemplateLayoutProps> = ({
  salon,
  template,
  isMobileMenuOpen, // Pass state down if needed by sections (less likely now)
  setIsMobileMenuOpen, // Pass state down if needed by sections
  openUrl,
  isPreview
}) => {
  // This component determines the ORDER and basic wrapping of sections
  // It passes salon/template data and utilities down to sections

  // Section visibility logic can be here or inside each section component.
  // Doing it inside the section component makes the layout simpler.
  // The layout component just *includes* the section component JSX.

  return (
    <>
      {/* Sections arranged in a classic order */}
      <HeroSection
         salon={salon}
         template={template}
         config={template?.features?.hero_layout || 'centered'} // Pass default layout if not specified
         openUrl={openUrl}
      />

      <InfoStripSection
         salon={salon}
         template={template}
         openUrl={openUrl}
      />

      <AboutSection
         salon={salon}
         template={template}
         openUrl={openUrl}
      />

      <ServicesSection
         salon={salon}
         template={template}
         config={template?.features?.services_display || 'grid'} // Pass default display if not specified
         openUrl={openUrl}
      />

      {/* Sections that are conditionally rendered based on template features */}
      {/* The section component itself can add the check for data existence */}
      <GallerySection
         salon={salon}
         template={template}
         config={{ cols: template?.features?.gallery_cols || 3 }} // Pass config for columns
         openUrl={openUrl}
      />

      <TestimonialsSection
         salon={salon}
         template={template}
         openUrl={openUrl}
      />

      <ContactSection
         salon={salon}
         template={template}
         openUrl={openUrl}
      />

    </>
  );
}

export default TemplateLayoutClassic;