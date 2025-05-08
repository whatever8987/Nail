// src/templates/Template2.js (Classic Design Example)
import React from 'react';
import { Button } from "@/components/ui/button"; // Assuming Shadcn Button
import { Phone, Mail, MapPin, Clock, Calendar } from "lucide-react"; // Icons
// import './Template2.css'; // Optional: specific styles

const SAMPLE_OPENING_HOURS_FALLBACK = "Mon-Fri: 9AM-6PM\nSat: 10AM-4PM\nSun: Closed"; // Different fallback style
const DEFAULT_COVER_IMAGE_CLASSIC = 'https://images.unsplash.com/photo-1550803977-1360167e4d67?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'; // Different default image
const DEFAULT_ABOUT_IMAGE_CLASSIC = 'https://images.unsplash.com/photo-1567095761054-fa3a01e51c3c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';


function Template2({ salon, template }) {
    // Use template data for styling
     const styles = {
        primaryColor: template?.primary_color || '#5a3e3b', // Default brown/burgundy
        secondaryColor: template?.secondary_color || '#b08968', // Default tan/beige
        fontFamily: template?.font_family || "'Georgia', serif",
        backgroundColor: template?.background_color || '#f5f5dc', // Beige background
        textColor: template?.text_color || '#4a4a4a',
    };

     // Access template features
    const features = template?.features || {};


    return (
        <div className="salon-template-classic" style={{ fontFamily: styles.fontFamily, backgroundColor: styles.backgroundColor, color: styles.textColor }}>

            {/* Header */}
            <header className="py-6" style={{ backgroundColor: styles.primaryColor, color: styles.secondaryColor }}>
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                  <h1 className="text-3xl font-serif">{salon.name || 'Classic Salon'}</h1>
                   {features.show_navigation !== false && (
                        <nav className="space-x-6 hidden md:block">
                           <a href="#about" className="hover:text-white transition">About</a>
                           <a href="#services" className="hover:text-white transition">Services</a>
                           <a href="#contact" className="hover:text-white transition">Contact</a>
                        </nav>
                   )}
              </div>
            </header>

             {/* Hero Section */}
            <section className="relative bg-cover bg-center h-[70vh] flex items-center justify-center text-center" style={{
              backgroundImage: `url(${salon.cover_image || template?.default_cover_image_url || DEFAULT_COVER_IMAGE_CLASSIC})`,
              backgroundColor: styles.secondaryColor
            }}>
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                <div className="relative z-10 text-white px-4 max-w-2xl">
                    <h2 className="text-5xl font-serif mb-6">{salon.name || 'Classic Salon'}</h2>
                     <p className="text-xl mb-8">
                         {salon.description || `Experience timeless beauty at ${salon.name || 'our salon'}.`}
                     </p>
                     <Button size="lg" style={{ backgroundColor: styles.secondaryColor, color: styles.primaryColor }} className="font-bold hover:bg-white">
                         <Calendar className="h-5 w-5 mr-2" /> Book Your Visit
                     </Button>
                </div>
            </section>


            {/* About Section */}
            <section id="about" className="py-20" style={{ backgroundColor: '#fdfbf7' }}> {/* Light cream background */}
                 <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
                     <div className="order-2 md:order-1">
                         <h2 className="text-3xl font-serif mb-6" style={{ color: styles.primaryColor }}>Our Philosophy</h2>
                         <p className="text-gray-700 mb-6">
                            {salon.description || `We believe in providing a serene and luxurious experience...`}
                         </p>
                          {/* Could add bullet points or values here */}
                     </div>
                     <div className="order-1 md:order-2">
                         <img
                           src={salon.about_image || template?.default_about_image_url || DEFAULT_ABOUT_IMAGE_CLASSIC}
                           alt="Classic Salon Interior"
                           className="rounded-lg shadow-xl"
                         />
                     </div>
                 </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-20" style={{ backgroundColor: styles.backgroundColor }}>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-serif mb-6" style={{ color: styles.primaryColor }}>Our Offerings</h2>
                    </div>
                     <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.isArray(salon.services) && salon.services.length > 0 ? (
                            salon.services.map((service, idx) => (
                               <div key={idx} className="border-b pb-4" style={{ borderColor: styles.secondaryColor }}>
                                   <h3 className="text-xl font-semibold mb-1" style={{ color: styles.primaryColor }}>{service.split('-')[0].trim()}</h3>
                                   <p className="text-gray-600 mb-2">Elevate your style with our expert service.</p>
                                   <span className="text-lg font-bold" style={{ color: styles.primaryColor }}>
                                      {service.includes('-') ? service.split('-')[1].trim() : 'Price N/A'}
                                   </span>
                               </div>
                            ))
                        ) : (
                             <div className="md:col-span-3 text-center text-gray-600">No services listed yet.</div>
                        )}
                     </div>
                </div>
            </section>

             {/* Contact Section */}
            <section id="contact" className="py-20" style={{ backgroundColor: '#fdfbf7' }}> {/* Light cream background */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12">
                    <div>
                        <h2 className="text-3xl font-serif mb-6" style={{ color: styles.primaryColor }}>Visit Us</h2>
                        <div className="space-y-6 text-gray-700">
                            <div className="flex items-center">
                                <MapPin className="h-6 w-6 mr-3" style={{ color: styles.primaryColor }}/>
                                <span>{`${salon.address || ''}${salon.address && salon.location ? ', ' : ''}${salon.location || ''}` || 'Address not specified'}</span>
                            </div>
                             <div className="flex items-center">
                                <Phone className="h-6 w-6 mr-3" style={{ color: styles.primaryColor }}/>
                                <span>{salon.phone_number || '(555) 123-4567'}</span>
                            </div>
                             <div className="flex items-center">
                                <Mail className="h-6 w-6 mr-3" style={{ color: styles.primaryColor }}/>
                                <span>{salon.email || 'info@salontemplate.com'}</span>
                            </div>
                             <div className="flex items-start">
                                <Clock className="h-6 w-6 mr-3 mt-1" style={{ color: styles.primaryColor }}/>
                                <div>
                                    <div className="whitespace-pre-line">{salon.opening_hours || SAMPLE_OPENING_HOURS_FALLBACK}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                     {/* Map placeholder */}
                    <div>
                         <div className="bg-gray-300 h-full min-h-[300px] flex items-center justify-center rounded shadow-lg">
                             <div className="text-center p-4">
                                <MapPin className="h-12 w-12 mx-auto text-gray-500 mb-2" />
                                <p className="text-gray-700">Map Area</p>
                                 <p className="text-sm text-gray-600 mt-2">{`${salon.address || ''}${salon.address && salon.location ? ', ' : ''}${salon.location || ''}` || 'Not specified'}</p>
                             </div>
                         </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-10 text-white text-center" style={{ backgroundColor: styles.primaryColor }}>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-lg font-serif mb-4">{salon.name || 'Classic Salon'}</p>
                     {features.show_social_icons && (
                        <div className="flex justify-center space-x-6 mb-6">
                             {/* ... social icon svgs ... */}
                        </div>
                     )}
                     <p className="text-sm text-white text-opacity-80">
                       © {new Date().getFullYear()} {salon.name || 'Salon Name'}. All rights reserved.
                     </p>
                </div>
            </footer>


             {/* Mobile Book Now Button - Can be placed here or in SampleSite */}
              {/* Keeping this in SampleSite allows it to be shown/hidden by the admin bar toggle */}

        </div>
    );
}

export default Template2;