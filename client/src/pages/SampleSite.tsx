// src/pages/SampleSite.tsx
import React, { useState, useEffect } from 'react'; // Import React
// import { useParams, Link, useLocation } from 'wouter'; // Remove routing for standalone
import { Button } from "@/components/ui/button";
import { Loader2, Phone, Mail, MapPin, Clock, ArrowLeft, User, Calendar } from "lucide-react";
// import { useToast } from "@/hooks/use-toast"; // Remove if not used for interactions

// Define dummy types
interface DummySalon {
  id: number | string;
  name: string;
  location: string;
  address?: string | null;
  phone_number?: string | null; // Match model
  email?: string | null;
  description?: string | null;
  services?: string[] | null;
  opening_hours?: string | null; // Match model
  sample_url: string; // Keep for context if needed
  template_id?: number | null; // Match model
}
interface DummyTemplate {
    id: number;
    name: string;
}

interface SampleSiteProps {
    salon?: DummySalon | null;
    template?: DummyTemplate | null;
    isLoading?: boolean;
    // sampleUrl?: string; // Passed via prop instead of useParams
}

// Sample dummy data
const dummySalonData: DummySalon = {
    id: 'sample1', name: "Glamour Demo Nails", location: "Demo City, DC",
    address: "123 Demo Ave", phone_number: "(555) 555-DEMO", email: "glamour@demo.com",
    description: "Experience the best nail care in Demo City. We offer relaxing manicures, pedicures, and stunning nail art.",
    services: ["Demo Manicure - $35", "Demo Pedicure - $50", "Gel Polish - $20", "Nail Art - $15+"],
    opening_hours: "Tue-Fri: 10 AM - 6 PM\nSat: 9 AM - 5 PM\nSun/Mon: Closed",
    sample_url: "glamour-demo-dc", template_id: 2
};
const dummyTemplateData: DummyTemplate | null = { id: 2, name: 'Modern' };
// const dummySalonData: DummySalon | null = null; // Test not found state
// const dummyTemplateData: DummyTemplate | null = null; // Test no template state

export default function SampleSite({
    salon = dummySalonData,
    template = dummyTemplateData,
    isLoading = false,
    // sampleUrl // Can get from salon prop
}: SampleSiteProps) {

  // const { toast } = useToast(); // Remove if not used
  // const [, navigate] = useLocation(); // Remove routing
  const [showAdminBar, setShowAdminBar] = useState(true); // Keep local UI state

  // Helper function to get basic styles (can be expanded)
  const getTemplateStyles = () => {
    const defaultStyles = { primaryColor: '#DC2626', secondaryColor: '#F87171', fontFamily: "'Inter', sans-serif", backgroundColor: '#ffffff', textColor: '#1f2937', cardBg: '#ffffff', cardText: '#374151' };
    if (!template) return defaultStyles;
    // Basic style variations based on dummy template name
    if (template.name === 'Elegant') return { ...defaultStyles, primaryColor: '#4F46E5', secondaryColor: '#818CF8', fontFamily: "'Merriweather', serif", backgroundColor: '#F9FAFB', textColor: '#111827', cardBg: '#ffffff', cardText: '#374151' };
    if (template.name === 'Modern') return { ...defaultStyles, primaryColor: '#10B981', secondaryColor: '#6EE7B7', fontFamily: "'Poppins', sans-serif", backgroundColor: '#ffffff', textColor: '#1F2937', cardBg: '#F9FAFB', cardText: '#374151' };
    if (template.name === 'Luxury') return { ...defaultStyles, primaryColor: '#D97706', secondaryColor: '#FDBA74', fontFamily: "'Playfair Display', serif", backgroundColor: '#FFFBEB', textColor: '#374151', cardBg: '#ffffff', cardText: '#1F2937'};
    return defaultStyles;
  };

  const styles = getTemplateStyles();

  // --- Render Logic ---
  if (isLoading) {
    return ( <div className="flex items-center justify-center min-h-screen"> <Loader2 className="h-10 w-10 animate-spin text-primary" /> </div> );
  }

  if (!salon) {
    return ( <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center"> <h1 className="text-3xl font-bold text-destructive">Salon Data Not Available</h1> <p className="mt-2 text-muted-foreground">Could not load salon information for this preview.</p> <Button onClick={() => alert('Go back')} className="mt-4">Go Back</Button> </div> );
  }

  // Helper to format multiline text
  const renderMultilineText = (text: string | null | undefined) => {
      if (!text) return null;
      return text.split('\n').map((line, index) => (
          <React.Fragment key={index}>
              {line}
              <br />
          </React.Fragment>
      ));
  }

  return (
    <div style={{ fontFamily: styles.fontFamily, backgroundColor: styles.backgroundColor, color: styles.textColor, minHeight: '100vh' }}>
      {/* Admin Bar (Simulated) */}
      {showAdminBar && (
        <div className="bg-gray-800 text-white p-2 sticky top-0 z-50 text-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="link" className="text-white p-0 h-auto hover:no-underline" onClick={() => alert('Go back to Dashboard')}> <ArrowLeft className="h-4 w-4 mr-1" /> Back </Button>
              <span> Preview: <strong>{salon.name}</strong> </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="xs" className="bg-gray-700 border-gray-600 hover:bg-gray-600" onClick={() => alert(`Edit Salon ID: ${salon.id}`)}> Edit Site </Button>
              <Button variant="outline" size="xs" className="bg-gray-700 border-gray-600 hover:bg-gray-600" onClick={() => setShowAdminBar(false)}> Hide Bar </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="py-4 shadow-sm" style={{ backgroundColor: styles.primaryColor }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-white truncate mr-4">{salon.name}</h1>
            {/* Simple Nav for Demo */}
            <nav className="hidden md:flex space-x-6">
              <a href="#about" className="text-white/90 hover:text-white text-sm font-medium">About</a>
              <a href="#services" className="text-white/90 hover:text-white text-sm font-medium">Services</a>
              {/* <a href="#gallery" className="text-white/90 hover:text-white text-sm font-medium">Gallery</a> */}
              <a href="#contact" className="text-white/90 hover:text-white text-sm font-medium">Contact</a>
            </nav>
            <div>
              <Button size="sm" className="bg-white hover:bg-gray-100" style={{ color: styles.primaryColor }} onClick={() => alert('Book Now Clicked')}>
                <Phone className="h-4 w-4 mr-1.5" />
                {salon.phone_number || "Book Now"}
              </Button>
            </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-cover bg-center h-[50vh] sm:h-[60vh]" style={{ backgroundImage: `url('https://picsum.photos/seed/${salon.sample_url}/1600/900')`, backgroundColor: styles.secondaryColor }}>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-center text-white px-4">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">{salon.name}</h2>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 max-w-xl mx-auto opacity-90"> {salon.description || `Professional nail care services in ${salon.location}.`} </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Button size="lg" style={{ backgroundColor: styles.primaryColor }} className="text-white shadow-md" onClick={() => alert('Book Appointment Clicked')}> <Calendar className="h-5 w-5 mr-2" /> Book Appointment </Button>
              {salon.phone_number && <Button variant="outline" size="lg" className="text-white border-white/80 hover:bg-white hover:text-black" onClick={() => alert(`Call ${salon.phone_number}`)}> <Phone className="h-5 w-5 mr-2" /> Call Us </Button>}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 md:py-16" style={{ backgroundColor: styles.cardBg, color: styles.cardText }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-3" style={{ color: styles.primaryColor }}>About Us</h2>
          <div className="w-20 h-1 mx-auto mb-6" style={{ backgroundColor: styles.primaryColor }}></div>
          <p className="leading-relaxed text-lg"> {salon.description || `Welcome to ${salon.name}! We are dedicated to providing top-notch nail services in ${salon.location}.`} </p>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-12 md:py-16 bg-background">
         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-12">
             <h2 className="text-3xl font-bold mb-3" style={{ color: styles.primaryColor }}>Our Services</h2>
             <div className="w-20 h-1 mx-auto mb-6" style={{ backgroundColor: styles.primaryColor }}></div>
           </div>
           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(salon.services && salon.services.length > 0 ? salon.services : ['Sample Service 1 - $30', 'Sample Service 2 - $45', 'Sample Service 3 - $60']).map((service, idx) => (
                 <div key={idx} className="p-6 rounded-lg shadow-md border border-border/50" style={{ backgroundColor: styles.cardBg, color: styles.cardText}}>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: styles.primaryColor }}>{service.split('-')[0].trim()}</h3>
                    <p className="text-sm mb-3">Description placeholder for the service.</p>
                    <p className="font-semibold">{service.includes('-') ? service.split('-')[1].trim() : '$...'}</p>
                 </div>
              ))}
           </div>
         </div>
      </section>

       {/* Contact Section */}
      <section id="contact" className="py-12 md:py-16" style={{ backgroundColor: styles.cardBg, color: styles.cardText }}>
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-3" style={{ color: styles.primaryColor }}>Contact Us</h2>
             <div className="w-20 h-1 mx-auto mb-10" style={{ backgroundColor: styles.primaryColor }}></div>
            <div className="grid sm:grid-cols-3 gap-8 text-left text-sm">
               <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: styles.primaryColor }} />
                  <div><span className="font-semibold block">Address</span>{salon.address || 'N/A'}, {salon.location}</div>
               </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: styles.primaryColor }} />
                   <div><span className="font-semibold block">Phone</span>{salon.phone_number || 'N/A'}</div>
               </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: styles.primaryColor }} />
                   <div><span className="font-semibold block">Email</span>{salon.email || 'N/A'}</div>
               </div>
            </div>
             <div className="mt-8">
                 <h3 className="font-semibold mb-2">Opening Hours</h3>
                 <div className="whitespace-pre-line text-sm">{renderMultilineText(salon.opening_hours) || 'Hours not available'}</div>
             </div>
             <div className="mt-8">
                 <Button style={{ backgroundColor: styles.primaryColor }} className="text-white">Book Online</Button>
             </div>
         </div>
      </section>


      {/* Footer */}
      <footer className="py-8 text-sm" style={{ backgroundColor: styles.primaryColor, color: 'white' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white/80">
          © {new Date().getFullYear()} {salon.name}. All rights reserved. Site by SalonSite Builder.
        </div>
      </footer>

      {/* Button to toggle admin bar */}
      {!showAdminBar && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button size="sm" variant="secondary" className="shadow-lg" onClick={() => setShowAdminBar(true)}> Show Admin Bar </Button>
        </div>
      )}
    </div>
  );
}

// Define dummy types if needed elsewhere
interface User { username: string; email?: string; role: 'user' | 'admin'; }
interface Template { id: number; name: string; }
interface Salon { id: number | string; name: string; location: string; address?: string | null; phone_number?: string | null; email?: string | null; description?: string | null; services?: string[] | null; opening_hours?: string | null; sample_url: string; template_id?: number | null; }