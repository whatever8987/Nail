// src/components/Header.tsx
import React from 'react';
import { Phone, Mail, MapPin, Clock, Menu, X, Facebook, Instagram, Twitter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { SalonData, TemplateData, SocialLinkItem } from '@/types'; // Import types

interface HeaderProps {
  salon: SalonData;
  template: TemplateData;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  openUrl: (url?: string | null, fallbackUrl?: string) => void;
}

const Header: React.FC<HeaderProps> = ({ salon, template, isMobileMenuOpen, setIsMobileMenuOpen, openUrl }) => {

    // Helper function to check if a section likely has content/is enabled
    const shouldShowSectionLink = (sectionId: string): boolean => {
        switch (sectionId) {
           case 'home': return true; // Always show home link
           case 'about': return !!(salon.description || salon.about_image); // Need description OR image
           case 'services': return Array.isArray(salon.services) && salon.services.length > 0; // Need services data
           case 'gallery': return template?.features?.show_gallery && Array.isArray(salon.gallery_images) && salon.gallery_images.length > 0; // Need feature flag AND images
           case 'testimonials': return template?.features?.show_testimonials && Array.isArray(salon.testimonials) && salon.testimonials.length > 0; // Need feature flag AND testimonials
           case 'contact': return !!(salon.address || salon.phone_number || salon.email || salon.map_embed_url); // Need some contact info
           default: return false;
        }
    };

    const navItems = ["Home", "About", "Services", "Gallery", "Testimonials", "Contact"];

    return (
      <header
        className="relative px-6 py-4 md:py-6 md:px-10 flex justify-between items-center shadow-md z-40" // Add z-index
        style={{ backgroundColor: 'var(--primary-color)' }} // Use CSS variable
      >
        {/* Logo */}
        <div className="flex-shrink-0">
          <img
            src={salon.logo_image || '/placeholder-logo.png'} // Fallback logo
            alt={`${salon.name || 'Salon'} Logo`}
            className="h-auto max-h-16" // Adjust max-h as needed
          />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => {
              const sectionId = item.toLowerCase();
              if (!shouldShowSectionLink(sectionId)) return null;

              return (
                <a
                  key={item}
                  href={`#${sectionId}`}
                  className="font-medium text-white hover:text-opacity-80 transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
                >
                  {item}
                </a>
             );
          })}
        </nav>

        {/* Book Appointment Button (Desktop) */}
        {salon.booking_url && (
            <div className="hidden md:block flex-shrink-0">
              <Button
                className="border-2 px-6 py-2 rounded-sm hover:bg-white/10 transition-colors duration-200"
                style={{
                  borderColor: 'var(--secondary-color)', // Use CSS variable
                  color: "white"
                }}
                onClick={() => openUrl(salon.booking_url)}
              >
                Book Appointment
              </Button>
            </div>
        )}

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white flex-shrink-0 z-50" // Ensure toggle is above mobile menu
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu - Use a portal or render outside header if z-index stacking contexts are an issue */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[49] bg-black/90 flex flex-col p-6 md:hidden"> {/* Adjust z-index */}
            <div className="flex justify-end mb-8">
              <button
                className="text-white"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close mobile menu"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="flex flex-col items-center justify-center space-y-6 flex-1">
               {navItems.map((item) => {
                    const sectionId = item.toLowerCase();
                    if (!shouldShowSectionLink(sectionId)) return null;

                   return (
                      <a
                        key={item}
                        href={`#${sectionId}`}
                        className="text-2xl font-medium text-white"
                        onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
                      >
                        {item}
                      </a>
                   );
                })}
                {salon.booking_url && (
                   <Button
                     className="mt-8 border-2 px-6 py-2 rounded-sm hover:bg-white/10 transition-colors duration-200"
                     style={{
                       borderColor: 'var(--secondary-color)',
                       color: "white"
                     }}
                     onClick={() => {
                        openUrl(salon.booking_url);
                        setIsMobileMenuOpen(false); // Close menu on click
                     }}
                   >
                     Book Appointment
                   </Button>
                )}
             </nav>
           </div>
         )}
       </header>
    );
}

export default Header;