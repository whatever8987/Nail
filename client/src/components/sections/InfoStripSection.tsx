// src/components/sections/InfoStripSection.tsx
import React from 'react';
import { Phone, MapPin, Clock } from 'lucide-react'; // Import icons used in this section
import { SectionProps } from '@/types'; // Import shared types
// import './InfoStripSection.css'; // Optional: Create if needed

const InfoStripSection: React.FC<SectionProps> = ({ salon, template, openUrl }) => {
    // Only show if there's at least one piece of info to display
    const hasInfo =
        (typeof salon.opening_hours === 'string' && salon.opening_hours.length > 0) || // Check if it's a non-empty string
        !!salon.phone_number ||
        (!!salon.address && !!salon.location); // Need both address and location to show that block meaningfully

    if (!hasInfo) {
        return null; // Don't render the section if no info
    }

    // Convert multi-line string hours to an array for mapping if necessary
    const hoursArray = typeof salon.opening_hours === 'string' ? salon.opening_hours.split('\n').filter(line => line.trim() !== '') : [];


    return (
        <section
          className="py-8 md:py-10"
          // Use CSS variables defined in the parent/root for styling
          style={{ backgroundColor: 'var(--background-color)', color: 'var(--text-color)' }}
        >
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Hours */}
               {hoursArray.length > 0 && (
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      <Clock size={24} style={{ color: 'var(--primary-color)' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Opening Hours</h3>
                      <ul>
                        {hoursArray.map((hours, index) => (
                          <li key={index}>{hours}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
               )}

              {/* Phone */}
               {salon.phone_number && (
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      <Phone size={24} style={{ color: 'var(--primary-color)' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Call Us</h3>
                      <a
                        href={`tel:${salon.phone_number}`}
                        className="hover:underline"
                      >
                        {salon.phone_number}
                      </a>
                    </div>
                  </div>
               )}

              {/* Address */}
               {(salon.address || salon.location) && ( // Show if address or location is present
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      <MapPin size={24} style={{ color: 'var(--primary-color)' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Find Us</h3>
                      <address style={{ fontStyle: 'normal' }}>
                        {salon.address && <>{salon.address}<br /></>}
                        {salon.location}
                      </address>
                    </div>
                  </div>
               )}
            </div>
          </div>
        </section>
    );
}

export default InfoStripSection;