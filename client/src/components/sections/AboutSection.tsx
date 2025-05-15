// src/components/sections/AboutSection.tsx
import React from 'react';
import { SectionProps } from '@/types'; // Import shared types
// import './AboutSection.css'; // Optional: Create if needed

const AboutSection: React.FC<SectionProps> = ({ salon, template }) => {
    // Only show if there's content (description or image)
    if (!salon.description && !salon.about_image && !template?.default_about_image) {
        return null;
    }

     // Determine about image source
    const aboutImage = salon.about_image || template?.default_about_image || '/placeholder-about.jpg'; // Fallback

    // Split description into paragraphs if it's a string
    const paragraphs = typeof salon.description === 'string' ? salon.description.split('\n\n').filter(p => p.trim() !== '') : [];


    return (
        <section id="about" className="py-16 md:py-24" style={{ color: 'var(--text-color)' }}>
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Image */}
              {aboutImage && ( // Show image column only if image exists
                 <div className="order-2 md:order-1">
                   <div className="relative">
                     {/* Decorative border */}
                     <div
                       className="absolute inset-0 -translate-x-4 -translate-y-4 border-2 z-0"
                       style={{ borderColor: 'var(--secondary-color)' }}
                       aria-hidden="true"
                     ></div>
                     <img
                       src={aboutImage}
                       alt="Salon interior"
                       className="w-full h-auto relative z-10 shadow-lg object-cover object-center"
                       style={{ aspectRatio: '3 / 2' }} // Maintain aspect ratio
                     />
                   </div>
                 </div>
              )}

              {/* Text */}
              {(salon.description || salon.hero_subtitle) && ( // Show text column if description or subtitle exists
                  // Adjust grid column span based on whether image is present
                  <div className={`order-1 md:order-2 ${!aboutImage ? 'md:col-span-2 text-center' : ''}`}>
                    <h2
                      className="text-3xl md:text-4xl font-bold mb-6"
                      style={{ color: 'var(--primary-color)' }}
                    >
                      About Us
                    </h2>
                     {/* Render paragraphs from description */}
                    {paragraphs.length > 0 ? (
                        <div className="prose prose-lg max-w-none space-y-4">
                            {paragraphs.map((paragraph, index) => (
                              <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                     ) : (
                        // Fallback to hero subtitle if no description
                        salon.hero_subtitle && (
                            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
                              {salon.hero_subtitle}
                            </p>
                        )
                     )}
                  </div>
              )}
            </div>
          </div>
        </section>
    );
}

export default AboutSection;