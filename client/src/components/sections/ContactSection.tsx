// src/components/sections/ContactSection.tsx
import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react'; // Import icons
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui Button
import { SectionProps } from '@/types'; // Import shared types
// import './ContactSection.css'; // Optional: Create if needed

const ContactSection: React.FC<SectionProps> = ({ salon, template, openUrl }) => {
    // Only show if there is any contact info or the map embed URL
    const hasContactInfo =
         !!salon.address || !!salon.location || !!salon.phone_number || !!salon.email ||
         (typeof salon.opening_hours === 'string' && salon.opening_hours.length > 0) ||
         !!salon.map_embed_url;
     const isMapEnabled = template?.features?.show_map !== false; // Check if map is explicitly disabled

    if (!hasContactInfo) {
        return null;
    }

     // Convert multi-line string hours to an array for mapping if necessary
    const hoursArray = typeof salon.opening_hours === 'string' ? salon.opening_hours.split('\n').filter(line => line.trim() !== '') : [];

    return (
        <section id="contact" className="py-16 md:py-24" style={{ color: 'var(--text-color)' }}>
          <div className="container mx-auto px-6">
            <h2
              className="text-3xl md:text-4xl font-bold mb-12 text-center"
              style={{ color: 'var(--primary-color)' }}
            >
              Contact Us
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div>
                <div className="space-y-6">
                  {/* Address */}
                   {(salon.address || salon.location) && (
                     <div className="flex items-start space-x-4">
                       <div className="mt-1">
                         <MapPin size={20} style={{ color: 'var(--primary-color)' }} />
                       </div>
                       <div>
                         <h3 className="font-semibold mb-1">Address</h3>
                         <address style={{ fontStyle: 'normal' }}>
                           {salon.address && <>{salon.address}<br /></>}
                           {salon.location}
                         </address>
                       </div>
                     </div>
                   )}

                  {/* Phone */}
                  {salon.phone_number && (
                    <div className="flex items-start space-x-4">
                      <div className="mt-1">
                        <Phone size={20} style={{ color: 'var(--primary-color)' }} />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Phone</h3>
                        <a
                          href={`tel:${salon.phone_number}`}
                          className="hover:underline"
                        >
                          {salon.phone_number}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {salon.email && (
                    <div className="flex items-start space-x-4">
                      <div className="mt-1">
                        <Mail size={20} style={{ color: 'var(--primary-color)' }} />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Email</h3>
                        <a
                          href={`mailto:${salon.email}`}
                          className="hover:underline"
                        >
                          {salon.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Hours */}
                   {hoursArray.length > 0 && (
                      <div className="flex items-start space-x-4">
                        <div className="mt-1">
                          <Clock size={20} style={{ color: 'var(--primary-color)' }} />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Hours</h3>
                          <ul>
                            {hoursArray.map((hours, index) => (
                              <li key={index}>{hours}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                   )}
                </div>

                {salon.booking_url && (
                  <div className="mt-8">
                    <Button
                      className="px-6 py-3 rounded-sm hover:bg-opacity-90 transition-colors duration-200"
                      style={{
                        backgroundColor: 'var(--primary-color)',
                        color: "white"
                      }}
                       onClick={() => openUrl(salon.booking_url)}
                    >
                      Book an Appointment
                    </Button>
                  </div>
                )}
              </div>

              {/* Map */}
              {salon.map_embed_url && isMapEnabled && ( // Only show if URL exists AND map feature is enabled
                <div className="h-96 border rounded-md overflow-hidden" style={{ borderColor: 'var(--secondary-color)' }}>
                  <iframe
                    src={salon.map_embed_url}
                    width="100%"
                    height="100%"
                    style={{border: 0}}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Salon location map"
                  ></iframe>
                </div>
              )}
            </div>
          </div>
        </section>
    );
}

export default ContactSection;