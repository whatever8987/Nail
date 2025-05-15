// src/components/layouts/TemplateLayoutModern.tsx
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
 * Defines the layout structure for the 'Modern' template.
 * This component arranges the reusable section components in a specific order.
 */
const TemplateLayoutModern: React.FC<TemplateLayoutProps> = ({
  salon,
  template,
  isMobileMenuOpen, // Passed down, but likely only needed by Header/Footer if part of layout
  setIsMobileMenuOpen, // Passed down, but likely only needed by Header/Footer if part of layout
  openUrl,
  isPreview
}) => {

  // This component focuses on the ORDER and potentially top-level wrappers
  // for sections, but the content rendering is within the section components.

  return (
    // You could add layout-specific wrapper divs or classes here if needed
    // <div className="modern-template-layout">
    <>
      {/* Example: Hero Section */}
      <HeroSection
         salon={salon}
         template={template}
         config={template?.features?.hero_layout || 'modern-layout'} // Pass layout-specific config
         openUrl={openUrl}
      />

      {/* Example: Arrange sections differently */}
      {/* Modern Layout might put Gallery higher */}
      <GallerySection
         salon={salon}
         template={template}
         config={{ cols: template?.features?.gallery_cols || 2 }} // Maybe modern uses 2 columns by default
         openUrl={openUrl}
      />

      {/* Then About */}
      <AboutSection
         salon={salon}
         template={template}
         openUrl={openUrl}
      />

      {/* Then Services */}
      <ServicesSection
         salon={salon}
         template={template}
         config={template?.features?.services_display || 'list'} // Maybe modern uses list layout for services
         openUrl={openUrl}
      />

      {/* Info Strip might come later */}
       <InfoStripSection
         salon={salon}
         template={template}
         openUrl={openUrl}
       />

      {/* Testimonials */}
      <TestimonialsSection
         salon={salon}
         template={template}
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

export default TemplateLayoutModern;