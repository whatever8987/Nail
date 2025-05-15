// src/components/sections/ServicesSection.tsx
import React from 'react';
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui Button
import { SectionProps, Service } from '@/types'; // Import shared types
// import './ServicesSection.css'; // Optional: Create if needed

const ServicesSection: React.FC<SectionProps> = ({ salon, template, config, openUrl }) => {
    // Only show if there are services
    const services = Array.isArray(salon.services) ? salon.services : [];
    if (services.length === 0) {
        return null;
    }

    // Determine display class based on 'config' prop (e.g., 'grid', 'list')
    const displayClass = config === 'list' ? 'services-list' : 'services-grid';

    return (
        <section
          id="services"
          className={`py-16 md:py-24 ${displayClass}`} // Use display class
          style={{ backgroundColor: 'var(--background-color)', color: 'var(--text-color)' }}
        >
          <div className="container mx-auto px-6">
            <h2
              className="text-3xl md:text-4xl font-bold mb-12 text-center"
              style={{ color: 'var(--primary-color)' }}
            >
              Our Services
            </h2>

            {/* Optional Tagline */}
            {salon.services_tagline && (
                 <p className="text-center text-lg mb-10 text-muted-foreground">{salon.services_tagline}</p>
            )}

             {/* Grid/List Container - Adjust grid/flex based on displayClass via CSS */}
            <div className={`gap-8 ${displayClass === 'services-grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}`}>
              {services.map((service: Service, index: number) => (
                <div
                  key={index}
                  className="p-6 border shadow-sm bg-white rounded-md" // Added rounded-md
                  style={{ borderColor: 'var(--secondary-color)' }}
                >
                  <div className="flex justify-between items-baseline mb-3">
                    <h3
                      className="font-semibold text-xl"
                      style={{ color: 'var(--text-color)' }}
                    >
                      {service.name}
                    </h3>
                    <span
                      className="font-medium"
                      style={{ color: 'var(--primary-color)' }}
                    >
                      {service.price}
                    </span>
                  </div>
                  {service.description && (
                    <p
                      className="text-sm text-muted-foreground"
                    >
                      {service.description}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {salon.services_url && (
              <div className="mt-12 text-center">
                <Button
                  className="px-6 py-2 rounded-sm hover:bg-opacity-90 transition-colors duration-200"
                  style={{
                    backgroundColor: 'var(--primary-color)',
                    color: "white"
                  }}
                   onClick={() => openUrl(salon.services_url)}
                >
                  View Full Service Menu
                </Button>
              </div>
            )}
          </div>
        </section>
    );
}

export default ServicesSection;