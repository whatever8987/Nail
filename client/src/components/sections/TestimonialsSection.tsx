// src/components/sections/TestimonialsSection.tsx
import React from 'react';
import { SectionProps, Testimonial } from '@/types'; // Import shared types
// import './TestimonialsSection.css'; // Optional: Create if needed

const TestimonialsSection: React.FC<SectionProps> = ({ salon, template }) => {
     // Only show if template feature is enabled AND there are testimonials
    const testimonials = Array.isArray(salon.testimonials) ? salon.testimonials : [];
    const isEnabled = template?.features?.show_testimonials;

    if (!isEnabled || testimonials.length === 0) {
        return null;
    }


    return (
        <section
          id="testimonials"
          className="py-16 md:py-24"
          style={{ backgroundColor: 'var(--background-color)', color: 'var(--text-color)' }}
        >
          <div className="container mx-auto px-6">
            <h2
              className="text-3xl md:text-4xl font-bold mb-12 text-center"
              style={{ color: 'var(--primary-color)' }}
            >
              What Clients Are Saying
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial: Testimonial, index: number) => (
                <div
                  key={index}
                  className="bg-white p-6 shadow-sm border rounded-md"
                  style={{ borderColor: 'var(--secondary-color)' }}
                >
                  <div
                    className="mb-4 text-2xl italic"
                    style={{ color: 'var(--secondary-color)' }}
                  >
                    "
                  </div>
                  <p
                    className="mb-4 text-muted-foreground"
                  >
                    {testimonial.quote}
                  </p>
                  <div className="flex justify-end">
                    <p
                      className="font-medium"
                      style={{ color: 'var(--primary-color)' }}
                    >
                      — {testimonial.client_name}
                    </p>
                  </div>
                   {/* Optional Rating stars (if testimonial.rating exists) */}
                   {/* {typeof testimonial.rating === 'number' && testimonial.rating > 0 && (
                       <div className="flex items-center justify-end mt-2">
                           {[...Array(5)].map((_, i) => (
                               <svg
                                   key={i}
                                   className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                   fill="currentColor"
                                   viewBox="0 0 20 20"
                               >
                                   <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.803 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.803-2.034a1 1 0 00-1.175 0l-2.803 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                               </svg>
                           ))}
                       </div>
                   )} */}
                </div>
              ))}
            </div>
          </div>
        </section>
    );
}

export default TestimonialsSection;