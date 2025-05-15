// src/components/Footer.tsx
import React from 'react';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react'; // Assuming icons used in footer
import { SalonData, TemplateData, SocialLinkItem } from '@/types'; // Import types

interface FooterProps {
  salon: SalonData;
  template: TemplateData; // Template might influence footer style/content options
  openUrl: (url?: string | null, fallbackUrl?: string) => void;
}

const Footer: React.FC<FooterProps> = ({ salon, template, openUrl }) => {

    // Helper function to check if a section likely has content/is enabled for footer links
    const shouldShowSectionLink = (sectionId: string): boolean => {
        switch (sectionId) {
           case 'home': return true;
           case 'about': return !!(salon.description || salon.about_image);
           case 'services': return Array.isArray(salon.services) && salon.services.length > 0;
           case 'gallery': return template?.features?.show_gallery && Array.isArray(salon.gallery_images) && salon.gallery_images.length > 0;
           case 'testimonials': return template?.features?.show_testimonials && Array.isArray(salon.testimonials) && salon.testimonials.length > 0;
           case 'contact': return !!(salon.address || salon.phone_number || salon.email || salon.map_embed_url);
           default: return false;
        }
    };

    const navItems = ["Home", "About", "Services", "Gallery", "Testimonials", "Contact"];

    // Only show footer if there's any content to display
    const hasFooterContent =
        (salon.footer_logo_image || salon.logo_image) ||
        salon.footer_about ||
        (Array.isArray(salon.social_links) && salon.social_links.length > 0) ||
        (salon.address || salon.location || salon.phone_number || salon.email) ||
        navItems.some(item => shouldShowSectionLink(item.toLowerCase())); // Check if any nav links will show

    if (!hasFooterContent) {
        return null;
    }

    // Helper to get social icon component by platform name
    const getSocialIcon = (platform: string) => {
        switch (platform.toLowerCase()) {
            case 'facebook': return <Facebook size={20} />;
            case 'instagram': return <Instagram size={20} />;
            case 'twitter': return <Twitter size={20} />;
            // Add other cases for LinkedIn, Pinterest, etc.
            default: return null; // Or a generic link icon
        }
    };


  return (
     <footer style={{ backgroundColor: 'var(--primary-color)', color: "white" }}>
       <div className="container mx-auto px-6 py-12">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {/* Logo & About Text */}
           <div>
              {(salon.footer_logo_image || salon.logo_image) && (
                 <img
                   src={salon.footer_logo_image || salon.logo_image || '/placeholder-logo-dark.png'} // Fallback logo for dark background
                   alt={`${salon.name || 'Salon'} Logo`}
                   className="h-16 mb-4"
                 />
              )}
              {salon.footer_about && (
                  <p className="mb-4 text-sm opacity-90">
                      {salon.footer_about}
                  </p>
              )}
               {/* Fallback text if no footer_about but description exists */}
              {(!salon.footer_about && salon.description) && (
                   <p className="mb-4 text-sm opacity-90">
                      {/* Display first paragraph of description or a default */}
                      {salon.description.split('\n\n')[0] || 'Your premier destination for beauty services.'}
                   </p>
              )}
           </div>

           {/* Quick Links */}
           <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                 {navItems.map((item) => {
                       const sectionId = item.toLowerCase();
                       if (!shouldShowSectionLink(sectionId)) return null;

                    return (
                      <li key={item}>
                        <a
                          href={`#${sectionId}`}
                          className="opacity-90 hover:opacity-100 hover:underline"
                        >
                          {item}
                        </a>
                      </li>
                    );
                 })}
              </ul>
           </div>

           {/* Contact & Social */}
           <div>
             <h3 className="font-semibold text-lg mb-4">Connect With Us</h3>
             {/* Display contact info in footer if available */}
              {(salon.address || salon.location || salon.phone_number || salon.email) && (
                 <address className="not-italic mb-4 opacity-90">
                   {salon.address && <>{salon.address}<br /></>}
                   {salon.location && <>{salon.location}<br /></>}
                   {salon.phone_number && <>{salon.phone_number}<br /></>}
                   {salon.email && <>{salon.email}</>}
                 </address>
              )}

             {/* Social Icons */}
             {Array.isArray(salon.social_links) && salon.social_links.length > 0 && (
               <div className="flex space-x-4">
                 {salon.social_links.map((link, index) => {
                     const Icon = getSocialIcon(link.platform);
                     if (!Icon) return null;
                     return (
                         <a
                           key={index}
                           href={link.url}
                           target="_blank"
                           rel="noreferrer noopener" // Added security best practices
                           className="hover:opacity-80"
                           aria-label={`${link.platform} link`}
                         >
                           {Icon}
                         </a>
                     );
                 })}
               </div>
             )}
           </div>
         </div>

         {/* Copyright */}
         <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm opacity-80">
           © {new Date().getFullYear()} {salon.name || 'Salon Name'}. All rights reserved.
         </div>
       </div>
     </footer>
  );
}

export default Footer;