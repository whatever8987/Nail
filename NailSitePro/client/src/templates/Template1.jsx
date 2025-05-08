// src/templates/HonestNailBarTemplate.jsx
import React, { useState, useEffect } from 'react';
// Assuming you have Shadcn Button and icons used in your main project
// If not, you might need to adjust these imports or use simple HTML elements
import { Button } from "@/components/ui/button"; // Example, replace if you use different buttons
import { Phone, Mail, MapPin, Clock, User, Calendar } from "lucide-react"; // Example icons



// Define client-side fallbacks if salon data is missing
const SAMPLE_OPENING_HOURS_FALLBACK = "Mon – Sat: 9:30AM to 7:30PM\nSun: 10AM to 6PM";
const DEFAULT_COVER_IMAGE_HONEST = 'images/T39-banner-1.jpg'; // Default image path within this template's assets
const DEFAULT_ABOUT_IMAGE_HONEST = 'images/HONEST-NAIL-BAR-98032_a12.jpg';
const DEFAULT_FOOTER_LOGO_HONEST = 'images/honest-nail-bar-kent-wa-98032-footer.png';
const DEFAULT_LOGO_HONEST = 'images/honest-nail-bar-kent-wa-98032-logo.png';
const DEFAULT_MAP_EMBED = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2701.409043406857!2d-122.23732738437715!3d47.38445137917063!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x80891663e980bae7!2sHonest%20Nails%20Bar%20-%20Kent%20Station!5e0!3m2!1sen!2s!4v1652361587727!5m2!1sen!2s"; // Default map embed


// Accept salon and template props
const Template1 = ({ salon, template }) => {
  // Keep internal state for template specific interactions (like menu toggle, slider)
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Access template features if available, fallback to empty object
  const features = template?.features || {};

  // --- Data Handling ---
  // Use data from salon prop if available, otherwise use hardcoded defaults
  // For arrays (services, gallery, testimonials), use salon data if it's an array and not empty
  const services = Array.isArray(salon.services) && salon.services.length > 0 ? salon.services : [ /* Provide some static defaults if needed */ ];
  const galleryImages = Array.isArray(salon.gallery_images) && salon.gallery_images.length > 0 ? salon.gallery_images : [ // Use dynamic gallery images or static template ones
    'images/HONEST-NAIL-BAR-98032_a1-4.jpg',
    'images/HONEST-NAIL-BAR-98032_a1-3.jpg',
    'images/HONEST-NAIL-BAR-98032_a1-1.jpg',
    'images/HONEST-NAIL-BAR-98032_a1-10.jpg',
    'images/HONEST-NAIL-BAR-98032_a1-7.jpg',
    'images/HONEST-NAIL-BAR-98032_a1-5.jpg'
  ];
   const testimonials = Array.isArray(salon.testimonials) && salon.testimonials.length > 0 ? salon.testimonials : [ // Use dynamic testimonials or static template ones
    { text: "I love this place! They are always accommodating...", author: "Kate Burt", role: "Happy Client" },
    { text: "I absolutely love this place.. Honest Nails had always been...", author: "Lyric Black", role: "Happy Client" },
    { text: "It was my first time coming here...", author: "Samantha Beineke", role: "Happy Client" }
  ];

  // Testimonial slider auto-rotation - depends on the number of testimonials
  useEffect(() => {
    // Adjust the max index based on the actual number of testimonials being displayed
    const maxIndex = testimonials.length > 0 ? testimonials.length - 1 : 0;

    if (maxIndex === 0) return; // Don't auto-rotate if only one testimonial

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev === maxIndex ? 0 : prev + 1));
    }, 7000); // Adjust timing if needed
    return () => clearInterval(interval);
  }, [testimonials.length]); // Re-run effect if the number of testimonials changes

  // --- Template-Specific Styles (using inline styles or mapping to CSS variables/classes) ---
  // You can pull colors/fonts from the `template` prop if your API exposes them
   const styles = {
        // Example: if template API returned these fields
       primaryColor: template?.primary_color || '#YOUR_DEFAULT_AMBER_COLOR',
       secondaryColor: template?.secondary_color || '#YOUR_DEFAULT_GRAY_COLOR',
       fontFamily: template?.font_family || 'sans-serif', // Or your specific template font
       // Add more style properties from the template prop
   };
   // Apply these styles via className or inline styles where appropriate in the JSX
   // For this Tailwind-heavy template, many styles are via classes, but colors might be inline





  return (
    // Apply global template styles if needed, or let CSS handle it
    <div className="font-sans text-gray-800 bg-white" style={{ fontFamily: styles.fontFamily /* add other global styles */ }}>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md"> {/* bg-white is hardcoded template color */}
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="w-1/4">
            <a href="/">
              <img
                src={salon.logo_url || DEFAULT_LOGO_HONEST} // Use salon logo or template default
                alt={`${salon.name || 'Salon'} Logo`} // Use salon name
                className="max-w-[200px]" // Tailiwind class
              />
            </a>
          </div>

          {/* Navigation */}
           {features.show_navigation !== false && ( // Feature toggle for navigation
             <nav className={`hidden md:flex w-1/2 justify-center ${isMenuOpen ? 'flex' : 'hidden'}`}> {/* Tailwind classes */}
               <ul className="flex space-x-8"> {/* Tailwind classes */}
                 {/* These links are typically static per template layout, but could be dynamic from salon/template features */}
                 <li><a href="/" className="font-medium uppercase text-sm hover:text-amber-600 transition-colors">Home</a></li> {/* Link/Text/Style specific to this template */}
                 <li><a href="/services" className="font-medium uppercase text-sm hover:text-amber-600 transition-colors">Services</a></li>
                 <li><a href="/gallery" className="font-medium uppercase text-sm hover:text-amber-600 transition-colors">Gallery</a></li>
                 <li><a href="/booking" className="font-medium uppercase text-sm hover:text-amber-600 transition-colors">Booking</a></li>
                 <li><a href="/contact-us" className="font-medium uppercase text-sm hover:text-amber-600 transition-colors">Contact Us</a></li>
               </ul>
             </nav>
           )}

          {/* Booking Button */}
          <div className="w-1/4 text-right hidden md:block">
            <a
              href={salon.booking_url || "/booking"} // Use salon booking URL or default
              className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase px-6 py-3 rounded transition-all hover:shadow-lg" // Tailwind classes
            >
              booking {/* Static button text per template */}
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex flex-col justify-center items-center" // Tailwind classes
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {/* Burger icon spans - controlled by isMenuOpen state */}
            <span className={`block w-6 h-0.5 bg-gray-800 transition-all ${isMenuOpen ? 'rotate-45 translate-y-1.5' : 'mb-1.5'}`}></span>
            <span className={`block w-6 h-0.5 bg-gray-800 transition-all ${isMenuOpen ? 'opacity-0' : 'mb-1.5'}`}></span>
            <span className={`block w-6 h-0.5 bg-gray-800 transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="md:hidden bg-white py-4 px-4"> {/* Tailwind classes */}
            <ul className="space-y-4"> {/* Tailwind classes */}
              {/* Mobile links - mirror desktop, use salon/template data if dynamic */}
              <li><a href="/" className="block font-medium uppercase text-sm hover:text-amber-600 transition-colors py-2">Home</a></li>
               <li><a href="/services" className="block font-medium uppercase text-sm hover:text-amber-600 transition-colors py-2">Services</a></li>
               <li><a href="/gallery" className="block font-medium uppercase text-sm hover:text-amber-600 transition-colors py-2">Gallery</a></li>
               <li><a href="/booking" className="block font-medium uppercase text-sm hover:text-amber-600 transition-colors py-2">Booking</a></li>
               <li><a href="/contact-us" className="block font-medium uppercase text-sm hover:text-amber-600 transition-colors py-2">Contact Us</a></li>
              <li>
                <a
                  href={salon.booking_url || "/booking"} // Use salon booking URL or default
                  className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase px-6 py-3 rounded transition-all hover:shadow-lg mt-2" // Tailwind classes
                >
                  booking
                </a>
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section
        className="relative h-[80vh] flex items-center justify-center text-center text-white bg-cover bg-center bg-fixed" // Tailwind classes
        style={{
           backgroundImage: `url('${salon.cover_image || template?.default_cover_image_url || DEFAULT_COVER_IMAGE_HONEST}')` // Use salon cover, template default, or component default
           // Optional: Add overlay color from template styles if needed, but bg-black/40 handles overlay
         }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div> {/* Tailwind class */}
        <div className="relative z-10 px-4"> {/* Tailwind class */}
          <p className="text-xl md:text-2xl mb-6">{salon.hero_subtitle || "Designs to make you come back to us"}</p> {/* Use salon data */}
          <h1 className="text-4xl md:text-6xl font-bold mb-8">{salon.name || "HONEST NAIL BAR"}</h1> {/* Use salon name */}
          <a
            href={salon.services_url || "/services"} // Use salon services URL or default
            className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase px-8 py-4 rounded transition-all hover:shadow-lg" // Tailwind classes
          >
            menu services {/* Static button text per template */}
          </a>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-gray-50"> {/* Tailwind class */}
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-8"> {/* Tailwind classes */}
          {/* Hours */}
          <div className="flex items-center bg-white p-6 rounded-lg shadow-sm w-full md:w-auto"> {/* Tailwind classes */}
            <span className="text-3xl mr-6 text-amber-500">⏰</span> {/* Tailwind classes, text-amber-500 is template color */}
            <div>
              {/* Use salon opening hours */}
               {salon.opening_hours ? (
                   salon.opening_hours.split('\n').map((line, idx) => <p key={idx}>{line}</p>)
               ) : (
                   // Fallback to static template hours
                   SAMPLE_OPENING_HOURS_FALLBACK.split('\n').map((line, idx) => <p key={idx}>{line}</p>)
               )}
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center bg-white p-6 rounded-lg shadow-sm w-full md:w-auto"> {/* Tailwind classes */}
            <span className="text-3xl mr-6 text-amber-500">📞</span> {/* Tailwind classes, text-amber-500 is template color */}
            <div>
              <a href={`tel:${salon.phone_number || '+12532208444'}`} className="hover:text-amber-600 transition-colors"> {/* Use salon phone */}
                {salon.phone_number || "(253) 220-8444"} {/* Use salon phone or fallback */}
              </a>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-center bg-white p-6 rounded-lg shadow-sm w-full md:w-auto"> {/* Tailwind classes */}
            <span className="text-3xl mr-6 text-amber-500">📍</span> {/* Tailwind classes, text-amber-500 is template color */}
            <div>
              <p>{`${salon.address || ''}${salon.address && salon.location ? ', ' : ''}${salon.location || ''}` || "417 RAMSAY WAY STE 101, KENT, WA 98032"}</p> {/* Use salon address/location */}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 container mx-auto px-4"> {/* Tailwind classes */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12"> {/* Tailwind classes */}
          <div className="mb-6 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2> {/* Static title per template */}
            <p className="max-w-2xl">
              {salon.services_tagline || "Have a relaxing time and be more beautiful after enjoying high-end services..."} {/* Use salon tagline */}
            </p>
          </div>
          <a
            href={salon.services_url || "/services"} // Use salon services URL or default
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase px-8 py-3 rounded transition-all hover:shadow-lg" // Tailwind classes
          >
            MORE SERVICES {/* Static button text per template */}
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"> {/* Tailwind classes */}
          {/* Loop through salon.services data */}
          {services.length > 0 ? (
             services.slice(0, 3).map((service, index) => ( // Show first 3 dynamic services, adjust as needed
               <div key={index} className="group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow"> {/* Tailwind classes */}
                 {/* Assuming service is a string like "Name - $Price" or an object {name, price, image_url} */}
                 <a href="/services/#service-id"> {/* Link might need to be dynamic based on service structure */}
                   <div className="relative overflow-hidden"> {/* Tailwind classes */}
                     <img
                       // Assuming service is an object with image_url, or fallback to a placeholder
                       src={service.image_url || `images/T39-services-${index + 1}.jpg`} // Use service image or a template placeholder
                       alt={`${service.name || 'Service'} image`} // Use service name or fallback
                       className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500" // Tailwind classes
                     />
                     <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-all"></div> {/* Tailwind classes */}
                   </div>
                   <div className="bg-white p-6 text-center"> {/* Tailwind classes */}
                     <h3 className="text-xl font-bold mb-2">{service.name || (typeof service === 'string' ? service.split('-')[0].trim() : 'Service')}</h3> {/* Use service name */}
                     <p className="text-amber-600 font-semibold">VIEW MENU</p> {/* Static text/link per template */}
                   </div>
                 </a>
               </div>
             ))
           ) : (
              // Fallback if no services are provided in salon data
              <>
                 {/* You could render placeholder cards here, or a simple message */}
                 <div className="group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow md:col-span-1 lg:col-span-1">... Placeholder 1 ...</div>
                 <div className="group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow md:col-span-1 lg:col-span-1">... Placeholder 2 ...</div>
                 <div className="group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow md:col-span-1 lg:col-span-1">... Placeholder 3 ...</div>
                 {/* Or just a message */}
                 {/* <div className="md:col-span-full text-center text-gray-500">No services listed yet.</div> */}
              </>
           )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 container mx-auto px-4"> {/* Tailwind classes */}
        <div className="flex flex-col lg:flex-row gap-12"> {/* Tailwind classes */}
          <div className="lg:w-1/2"> {/* Tailwind class */}
            <img
              src={salon.about_image || template?.default_about_image_url || DEFAULT_ABOUT_IMAGE_HONEST} // Use salon about image, template default, or component default
              alt={`${salon.name || 'Salon'} interior`} // Use salon name
              className="w-full rounded-lg shadow-lg" // Tailwind classes
            />
          </div>

          <div className="lg:w-1/2"> {/* Tailwind class */}
            <h2 className="text-3xl md:text-4xl font-bold mb-8">About Us</h2> {/* Static title per template */}
            {/* Use salon description. You might need to split by newlines if it's a multi-paragraph text field */}
            {salon.description ? (
                salon.description.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx} className="mb-4">{paragraph}</p>
                ))
            ) : (
                // Fallback to a default about text
                <>
                    <p className="mb-4">A premium nail bar based in <strong className="text-amber-700">{salon.location || 'your area'}</strong> aims to provide a comfortable and relaxing atmosphere to every client where their needs are met and expectations are surpassed.</p>
                    <p className="mb-4">We're committed to the highest standards of customer care and pride ourselves on always taking excellent care of your nails.</p>
                    <p className="mb-4">Let's visit <a href="/" className="text-amber-600 font-semibold">{salon.name || 'Our Salon'}</a> at <a href="#" className="text-amber-600 font-semibold">{`${salon.address || ''}${salon.address && salon.location ? ', ' : ''}${salon.location || ''}` || 'our location'}.</a> We want to make your nail salon experience as unique as you are. Visit us soon!</p>
                </>
            )}
            <p className="mb-6">* * *</p> {/* Static divider */}
            <h4 className="text-xl font-semibold">Welcome to {salon.name || 'HONEST NAIL BAR'}!</h4> {/* Use salon name */}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
       {/* Render this section only if there are testimonials OR if a template feature enables it */}
      {testimonials.length > 0 || features.show_testimonials !== false ? (
        <section className="py-20 bg-gray-50"> {/* Tailwind class */}
          <div className="container mx-auto px-4 text-center"> {/* Tailwind classes */}
            <h2 className="text-3xl md:text-4xl font-bold mb-6">WHAT CLIENTS ARE SAYING</h2> {/* Static title per template */}
            {features.show_testimonial_rating && ( // Feature toggle for rating image
                 <img src="images/star-rate.png" alt="5 star rating" className="mx-auto mb-12" /> 
            )}


            <div className="max-w-4xl mx-auto relative"> {/* Tailwind classes */}
              {/* Loop through testimonials data */}
              {testimonials.map((testimonial, index) => (
                <div
                  key={index} // Use index or testimonial ID if available
                  className={`p-8 bg-white rounded-lg shadow-md transition-opacity duration-500 ${activeSlide === index ? 'opacity-100' : 'opacity-0 absolute top-0 left-0 right-0'}`} // Tailwind classes & transition logic
                >
                  <p className="text-lg mb-6">"{testimonial.text}"</p> {/* Use testimonial text */}
                  <p className="text-xl font-bold mb-1">{testimonial.author}</p> {/* Use testimonial author */}
                  <p className="text-gray-500 italic">{testimonial.role}</p> {/* Use testimonial role */}
                </div>
              ))}

              {/* Slider Controls - Only show if more than one testimonial */}
               {testimonials.length > 1 && (
                 <div className="flex justify-center mt-8 space-x-2"> {/* Tailwind classes */}
                   {testimonials.map((_, index) => (
                     <button
                       key={index}
                       className={`w-3 h-3 rounded-full ${activeSlide === index ? 'bg-amber-500' : 'bg-gray-300'}`} // Tailwind classes & active state color
                       onClick={() => setActiveSlide(index)}
                       aria-label={`Go to testimonial ${index + 1}`} // Accessibility
                     ></button>
                   ))}
                 </div>
               )}
            </div>
          </div>
        </section>
      ) : null /* Don't render section if no testimonials and feature is off */}

      {/* Gallery Section */}
       {/* Render this section only if there are gallery images OR if a template feature enables it */}
      {galleryImages.length > 0 || features.show_gallery !== false ? (
        <section className="py-20 container mx-auto px-4"> {/* Tailwind classes */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-12"> {/* Tailwind classes */}
            <div className="mb-6 md:mb-0">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Gallery</h2> {/* Static title per template */}
              <p className="max-w-2xl">
                {salon.gallery_tagline || "After a stressful and exhausting working day..."} {/* Use salon tagline */}
              </p>
            </div>
            <a
              href={salon.gallery_url || "/gallery"} // Use salon gallery URL or default
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase px-8 py-3 rounded transition-all hover:shadow-lg" // Tailwind classes
            >
              MORE GALLERY {/* Static button text per template */}
            </a>
          </div>

          <div className="relative"> {/* Tailwind classes */}
            <div className="overflow-x-auto pb-6 scrollbar-hide"> {/* Tailwind classes (scrollbar-hide might need plugin) */}
              <div className="flex space-x-6"> {/* Tailwind classes */}
                {/* Loop through gallery images data */}
                {galleryImages.map((imageSrc, index) => ( // imageSrc is the URL or path
                  <div key={index} className="flex-shrink-0 w-72"> {/* Tailwind classes */}
                    <img
                      src={imageSrc} // Use image source (URL or path)
                      alt={`Gallery image ${index + 1}`} // Use index for alt text
                      className="w-full h-96 object-cover rounded-lg hover:scale-105 transition-transform duration-300 cursor-pointer" // Tailwind classes
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Buttons - Need JS implementation to connect to the overflow div scrolling */}
            {/* These buttons are static UI elements of the template, their functionality needs to be added */}
            {galleryImages.length > 3 && ( // Only show buttons if enough images to scroll
               <>
                <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 w-10 h-10 rounded-full shadow-md flex items-center justify-center">
                  ❮
                </button>
                <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 w-10 h-10 rounded-full shadow-md flex items-center justify-center">
                  ❯
                </button>
               </>
            )}
          </div>
        </section>
      ) : null /* Don't render section if no images and feature is off */}

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8"> {/* Tailwind classes */}
        <div className="container mx-auto px-4"> {/* Tailwind class */}
          <div className="text-center mb-12"> {/* Tailwind classes */}
            <a href="/">
              <img
                src={salon.footer_logo_url || DEFAULT_FOOTER_LOGO_HONEST} // Use salon footer logo or default
                alt={`${salon.name || 'Salon'} footer logo`} // Use salon name
                className="max-w-xs mx-auto" // Tailwind classes
              />
            </a>
          </div>

          <div className="flex flex-col md:flex-row gap-12 mb-12"> {/* Tailwind classes */}
            {/* About */}
            <div className="md:w-1/3"> {/* Tailwind class */}
              <h3 className="text-xl font-bold mb-6 text-amber-500">ABOUT US</h3> {/* Static title, template color */}
              <p className="mb-4">
                 {/* Use salon footer about text or a derived version */}
                 {salon.footer_about || `A premium nail bar based in ${salon.location || 'your area'}, ${salon.name || 'our salon'} aims to provide a comfortable and relaxing atmosphere...`}
              </p>
              <p>
                The Best <a href="/" className="text-amber-400 hover:text-amber-300">{salon.name || 'Nail Salon'}</a> in {salon.location || 'Your Area'} | <a href="/" className="text-amber-400 hover:text-amber-300">{salon.name || 'Nail Salon'} {salon.location || 'Area'}</a> Check it Out! {/* Use salon name/location */}
              </p>
            </div>

            {/* Contact */}
            <div className="md:w-1/3"> {/* Tailwind class */}
              <h3 className="text-xl font-bold mb-6 text-amber-500">CONTACT US</h3> {/* Static title, template color */}
               {/* Use salon contact info */}
              <p className="mb-2">{`${salon.address || ''}${salon.address && salon.location ? ', ' : ''}${salon.location || ''}` || 'Address not specified'}</p>
              <h4 className="text-lg font-bold mb-2 text-amber-400">{salon.phone_number || "(253) 220-8444"}</h4>
              <p className="mb-8">{salon.email || "info@salontemplate.com"}</p>

              <h3 className="text-xl font-bold mb-4 text-amber-500">BUSINESS HOURS</h3> {/* Static title, template color */}
              <p className="mb-4">
                {salon.opening_hours || SAMPLE_OPENING_HOURS_FALLBACK} {/* Use salon hours or fallback */}
              </p>

               {features.show_social_icons_footer && ( // Feature toggle
                  <div className="flex space-x-4"> {/* Tailwind classes */}
                    {/* Loop through salon.social_links or hardcode template defaults */}
                    <a href="https://www.facebook.com/102710725580609" target="_blank" rel="noopener noreferrer">
                      <img src="images/custom_icons-colors-01.png" alt="Facebook" className="w-10" /> {/* Static social icon image/link */}
                    </a>
                     {/* ... other social icons ... */}
                  </div>
               )}
            </div>

            {/* Map */}
             {features.show_map_footer && ( // Feature toggle
                <div className="md:w-1/3"> {/* Tailwind class */}
                   {salon.map_embed_url ? ( // Use salon map embed URL if provided
                       <iframe
                           src={salon.map_embed_url}
                           width="100%" height="250"
                           className="border-0 rounded-lg" // Tailwind classes
                           allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                           title={`${salon.name || 'Salon'} Location Map`}
                       ></iframe>
                   ) : (
                       // Fallback to default map if no URL provided
                        <iframe
                           src={DEFAULT_MAP_EMBED}
                           width="100%" height="250"
                           className="border-0 rounded-lg" // Tailwind classes
                           allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                           title="Default Location Map"
                        ></iframe>
                   )}
                </div>
             )}
          </div>

          {/* Copyright */}
          <div className="text-center pt-8 border-t border-gray-700"> {/* Tailwind classes */}
            <p>
              Copyright © {new Date().getFullYear()} <strong><a href="/" className="text-amber-400 hover:text-amber-300">{salon.name || 'HONEST NAIL BAR'}</a></strong>. All rights reserved. Designed by ZOTA. {/* Use salon name */}
            </p>
          </div>
        </div>
      </footer>

      {/* Booking Side Tab */}
       {features.show_side_booking_tab !== false && ( // Feature toggle
            <a
              href={salon.booking_url || "/booking"} // Use salon booking URL or default
              className="fixed right-0 top-1/2 transform -translate-y-1/2 rotate-90 origin-bottom-right bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase px-6 py-3 rounded-t-lg shadow-md transition-all hover:shadow-lg z-40" // Tailwind classes
            >
              BOOKING {/* Static button text per template */}
            </a>
       )}

    </div>
  );
};

// Export the component with the new name
export default Template1;