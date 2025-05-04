// src/pages/LandingPage.tsx
import React from 'react'; // Import React
import { Link } from 'wouter'; // Keep Link for structure
import { Button } from "@/components/ui/button";
import { TopNavigation } from "@/components/layout/TopNavigation"; // Assuming standalone
// Import SubscriptionPlans if embedding it directly and it's standalone
import { SubscriptionPlans } from '@/components/dashboard/SubscriptionPlans'; // Adjust path if needed

import {
  CheckCircle2,
  Star,
  Users,
  Sparkles,
  Globe,
  Palette,
  Zap,
  ChevronRight
} from "lucide-react";

// Define dummy User type if needed by TopNavigation
interface DummyUser { username: string; email?: string; role: 'user' | 'admin'; }

// Sample dummy user data (optional)
const dummyUserData: DummyUser | null = null; // Simulate logged out state for landing page

export default function LandingPage() {
  // Use dummy data instead of useQuery
  const user = dummyUserData;
  const isLoggedIn = !!user;
  // const { toast } = useToast(); // Remove if not used

  // Simulate navigation for buttons
  const handleNavigate = (path: string) => {
      alert(`Simulating navigation to: ${path}`);
      // In real app: navigate(path); // (need to import useLocation from wouter)
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Pass dummy data/state to TopNavigation */}
      <TopNavigation user={user} isLoggedIn={isLoggedIn} />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 lg:pt-40 lg:pb-36 overflow-hidden bg-gradient-to-b from-background to-blue-50 dark:from-gray-950 dark:to-blue-900/20">
         <div className="absolute inset-0 opacity-10 bg-grid-pattern"></div>
         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
               <div className="flex flex-col space-y-6 text-center lg:text-left">
                  <div className="space-y-4">
                     <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary"> <Sparkles className="h-4 w-4 mr-2" /> Grow Your Salon Online </div>
                     <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground"> Beautiful Websites for <span className="gradient-text">Nail Salons</span> </h1>
                     <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0"> Attract more clients with a professional website designed specifically for nail salons. No upfront costs — just a simple monthly subscription. </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                      {/* Use buttons with simulated navigation */}
                     <Button size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-primary/30 transition-all gradient-bg" onClick={() => handleNavigate('/register')}> Get Started <ChevronRight className="ml-2 h-4 w-4" /> </Button>
                     <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => handleNavigate('/demo/glamnails-miami')}> View Demo </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-6">
                     <div className="text-center"><div className="font-bold text-2xl gradient-text">50+</div><div className="text-xs text-muted-foreground uppercase tracking-wider">Salons</div></div>
                     <div className="text-center"><div className="font-bold text-2xl gradient-text">9+</div><div className="text-xs text-muted-foreground uppercase tracking-wider">Templates</div></div>
                     <div className="text-center"><div className="font-bold text-2xl gradient-text">24/7</div><div className="text-xs text-muted-foreground uppercase tracking-wider">Support</div></div>
                  </div>
               </div>
               <div className="relative hidden lg:block">
                  <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-border/10 aspect-[4/3]"> <img className="w-full h-full object-cover" src="https://picsum.photos/seed/landingshowcase/1200/900" alt="Nail salon website example"/> </div>
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl"></div>
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
               </div>
            </div>
         </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/10 text-secondary mb-4"> <Sparkles className="h-4 w-4 mr-2" /> Designed for Nail Salons </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground"> Everything Your Salon <span className="gradient-text">Needs</span> </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto"> Our websites are built with features specifically for nail salons to help you attract clients and grow your business online. </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[ { icon: Globe, title: "Responsive Design", text: "Looks great on all devices - mobile, tablet, and desktop." }, { icon: Palette, title: "Service Showcase", text: "Beautifully display your services and prices." }, { icon: Users, title: "Online Booking", text: "Allow clients to book appointments easily online." }, { icon: Zap, title: "Fast Performance", text: "Lightning-fast websites that load quickly." }, { icon: Star, title: "SEO Optimized", text: "Get found by potential clients on search engines." }, { icon: CheckCircle2, title: "Easy Management", text: "Update content easily without technical skills." }, ].map((feature, index) => ( <div key={index} className="bg-card border border-border/20 rounded-lg p-6 text-center transition-all hover:shadow-xl hover:-translate-y-1 duration-300"> <div className="w-12 h-12 rounded-lg gradient-bg flex items-center justify-center mb-5 mx-auto shadow-lg"> <feature.icon className="h-6 w-6 text-white" /> </div> <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3> <p className="text-muted-foreground text-sm">{feature.text}</p> </div> ))}
          </div>
        </div>
      </section>

      {/* Pricing Section (Using Imported Component) */}
      <section className="py-16 md:py-24 bg-muted/40 relative">
         <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
            <div className="text-center mb-12 md:mb-16">
               <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/10 text-secondary mb-4"> <Sparkles className="h-4 w-4 mr-2" /> Start Free, Upgrade Anytime </div>
               <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground"> Simple, <span className="gradient-text">Transparent</span> Pricing </h2>
               <p className="text-lg text-muted-foreground max-w-3xl mx-auto"> Choose the plan that works for your salon - all with no setup fees and a 14-day free trial. </p>
            </div>
            {/* Embed the SubscriptionPlans component - assuming it's now standalone */}
            <SubscriptionPlans isLoading={false} onSelectPlan={(id) => handleNavigate(`/subscribe?planId=${id}`)} />
         </div>
      </section>

      {/* Call to Action */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-purple-600/90 to-secondary/90"></div>
         <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"> Ready to Grow Your Salon Business? </h2>
            <p className="text-xl text-white/80 mb-8"> Start your 14-day free trial today. No credit card required. </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <Button size="lg" className="px-8 rounded-full shadow-lg bg-white text-primary hover:bg-gray-100 hover:shadow-xl transition-all" onClick={() => handleNavigate('/register')}> Get Started Free </Button>
               <Button size="lg" variant="outline" className="px-8 rounded-full border-white/50 text-white hover:bg-white/10" onClick={() => handleNavigate('/demo/glamnails-miami')}> View Demo Site </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background/70">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
               <div className="flex items-center mb-4"> <svg className="h-7 w-7 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12c0 1.2-4 6-9 6s-9-4.8-9-6c0-1.2 4-6 9-6s9 4.8 9 6z" /><circle cx="12" cy="12" r="3" /></svg> <span className="ml-2 font-semibold text-lg text-background/90">SalonSite</span> </div>
              <p className="text-sm mb-4"> Easiest way to create a professional website. </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider text-background/90 uppercase mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li><button onClick={()=>handleNavigate('/templates')} className="hover:text-primary transition-colors text-sm">Templates</button></li>
                <li><button onClick={()=>handleNavigate('/pricing')} className="hover:text-primary transition-colors text-sm">Pricing</button></li>
                <li><button onClick={()=>handleNavigate('/blog')} className="hover:text-primary transition-colors text-sm">Blog</button></li>
                <li><button onClick={()=>handleNavigate('/contact')} className="hover:text-primary transition-colors text-sm">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider text-background/90 uppercase mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><button onClick={()=>alert('Navigate to Terms')} className="hover:text-primary transition-colors text-sm">Terms of Service</button></li>
                <li><button onClick={()=>alert('Navigate to Privacy')} className="hover:text-primary transition-colors text-sm">Privacy Policy</button></li>
              </ul>
            </div>
             <div>
              <h4 className="text-sm font-semibold tracking-wider text-background/90 uppercase mb-4">Connect</h4>
               <div className="flex space-x-4">
                 <a href="#" className="hover:text-primary transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg></a>
                 <a href="#" className="hover:text-primary transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg></a>
                 <a href="#" className="hover:text-primary transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path></svg></a>
               </div>
            </div>
          </div>
          <div className="border-t border-background/10 mt-8 pt-8 text-sm text-background/50 text-center">
            © {new Date().getFullYear()} Salon Site Builder. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Define dummy User type if needed by TopNavigation
interface User { username: string; email?: string; role: 'user' | 'admin'; }

// Define dummy SubscriptionPlan type if needed by embedded component
interface SubscriptionPlan { id: number; name: string; price: number; features: string[]; isPopular?: boolean; }