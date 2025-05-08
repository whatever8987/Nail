import { useQuery } from "@tanstack/react-query";
import { TopNavigation } from "@/components/layout/TopNavigation";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  Star,
  Users,
  Sparkles,
  Globe,
  Palette,
  Zap,
  ChevronRight,
  Loader2
} from "lucide-react";
import { API } from "@/lib/api"; // Assuming this imports your configured API client with interceptors
import axios from "axios"; // Keep axios import for isAxiosError check

export default function LandingPage() {
  const { toast } = useToast();

  // Fetch user profile using our API client
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const response = await API.user.getProfile();
        return response.data;
      } catch (error) {
        // *** FIX START ***
        // Removed localStorage.removeItem calls from here.
        // The global Axios interceptor in api.ts now handles token cleanup and redirect on 401.
        // This catch block on the landing page simply needs to return null if the user
        // fetch fails (e.g., due to 401), indicating the user is not logged in.
        if (axios.isAxiosError(error) && error.response?.status === 401) {
           // Optionally log a warning, but do NOT clear tokens or redirect here.
           console.warn("Attempted to fetch user on landing page with invalid token (401). Global interceptor will handle logout.");
        } else {
           // Log other errors if necessary
           console.error("Failed to fetch user profile on landing page:", error);
        }
        return null; // Return null if fetching user failed
        // *** FIX END ***
      }
    },
    // Still only enabled if a token might exist, avoids unnecessary requests for unauthenticated users
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('access_token'),
    retry: false, // Still good to not retry failed auth requests indefinitely
    staleTime: 5 * 60 * 1000,
  });

  const isLoggedIn = !!user; // Determine login status based on whether user data was successfully fetched

  if (isLoadingUser) {
    // Only show loader if we are actively trying to fetch user data (i.e., token exists)
    // If enabled is false, isLoadingUser will be false immediately.
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* TopNavigation correctly uses isLoggedIn and user */}
      <TopNavigation user={user} isLoggedIn={isLoggedIn} />

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4 mr-2" /> The easiest way to grow your salon online
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">
                  Beautiful websites for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">nail salons</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Attract more clients with a professional website designed specifically for nail salons.
                  No upfront costs — just a simple monthly subscription.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-primary/30 transition-all bg-gradient-to-r from-primary to-purple-600 text-white">
                    Get started <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/demo/glamnails-miami">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary/20 hover:border-primary/40">
                    View demo
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="text-center">
                  <div className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">50+</div>
                  <div className="text-sm text-muted-foreground">Salons</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">5+</div>
                  <div className="text-sm text-muted-foreground">Templates</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">24/7</div>
                  <div className="text-sm text-muted-foreground">Support</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-primary/20">
                <img
                  className="w-full"
                  src="https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
                  alt="Nail salon showcase"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary/20 rounded-full blur-2xl"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/10 text-secondary mb-4">
              <Sparkles className="h-4 w-4 mr-2" /> Designed for nail salons
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Everything your salon <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">needs</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our websites are designed specifically for nail salons with all the features you need to grow your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="h-6 w-6 text-white" />,
                title: "Responsive Design",
                description: "Our websites look great on all devices - from mobile phones to large desktop screens."
              },
              {
                icon: <Palette className="h-6 w-6 text-white" />,
                title: "Service Showcase",
                description: "Beautifully display your services with prices to attract more clients."
              },
              {
                icon: <Users className="h-6 w-6 text-white" />,
                title: "Online Booking",
                description: "Allow clients to book appointments online and manage your schedule easily."
              },
              {
                icon: <Zap className="h-6 w-6 text-white" />,
                title: "Fast Performance",
                description: "Lightning-fast websites that load quickly and keep clients engaged."
              },
              {
                icon: <Star className="h-6 w-6 text-white" />,
                title: "SEO Optimized",
                description: "Get found by potential clients through search engines with our SEO-friendly designs."
              },
              {
                icon: <CheckCircle2 className="h-6 w-6 text-white" />,
                title: "Easy Management",
                description: "Simple tools to update your content without any technical knowledge needed."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-background relative">
        <div className="absolute inset-0 bg-grid-slate-200/70 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/10 text-secondary mb-4">
              <Sparkles className="h-4 w-4 mr-2" /> Start for free, upgrade anytime
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Simple, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">transparent</span> pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that works for your salon - all with no setup fees and a 14-day free trial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Basic",
                price: "$79",
                description: "Perfect for starting your online presence",
                features: [
                  "Custom subdomain",
                  "Mobile-friendly design",
                  "Basic content management",
                  "Email support"
                ],
                popular: false
              },
              {
                name: "Premium",
                price: "$149",
                description: "Everything needed for a professional salon",
                features: [
                  "All Basic features",
                  "Custom domain connection",
                  "Online booking integration",
                  "Priority support"
                ],
                popular: true
              },
              {
                name: "Luxury",
                price: "$239",
                description: "Complete solutions for high-end salons",
                features: [
                  "All Premium features",
                  "Custom design modifications",
                  "SEO optimization",
                  "Dedicated support manager"
                ],
                popular: false
              }
            ].map((plan, index) => (
              <div key={index} className={`bg-white rounded-xl border ${plan.popular ? 'border-primary/30 shadow-lg relative' : 'border-gray-200'} overflow-hidden`}>
                {plan.popular && (
                  <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-primary to-purple-600 text-center py-1 text-xs font-medium text-white">
                    Most Popular
                  </div>
                )}
                <div className={`p-8 ${plan.popular ? 'pt-12' : ''}`}>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-2">/month</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {/* Logic to redirect logged-in users to subscribe page */}
                  {/* This link structure seems correct for wouter and handling logged-in state */}
                  <Link to={isLoggedIn ? `/subscribe?planId=${index + 1}` : `/register?redirect=/subscribe?planId=${index + 1}`}>
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                    >
                      Choose {plan.name}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-purple-600">
        <div className="absolute right-0 bottom-0 opacity-10">
          <svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
            <path d="M151.5,-192.2C199.2,-152.3,242.1,-106.5,255.4,-52.5C268.8,1.6,252.6,63.7,220.7,111.1C188.8,158.5,141.3,191.2,88.1,214.5C34.9,237.8,-24,251.8,-81.3,241.8C-138.6,231.9,-194.4,198.2,-226.6,149C-258.7,99.7,-267.4,34.8,-248,-17.7C-228.7,-70.2,-181.3,-110.2,-135.8,-150.7C-90.2,-191.1,-45.1,-232,3.7,-236.7C52.5,-241.4,103.9,-232,151.5,-192.2Z" fill="white" transform="translate(300,300)" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to grow your salon business?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Start your 14-day free trial today. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register">
                <Button
                  size="lg"
                  className="px-8 rounded-full shadow-lg bg-white text-primary hover:bg-gray-50 hover:shadow-xl transition-all"
                >
                  Get started for free
                </Button>
              </Link>
              <Link to="/demo/glamnails-miami">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 rounded-full border-white text-primary hover:bg-white/10"
                >
                  View demo site
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-xl font-bold mb-4 text-white">Salon Site Builder</h3>
              <p className="text-slate-400 mb-4 max-w-md">
                The easiest way to create a professional website for your nail salon. No technical knowledge required.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 002.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider text-white uppercase mb-4">Features</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Design Tools</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">SEO Tools</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Mobile Friendly</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider text-white uppercase mb-4">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Terms & Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-sm text-slate-400 text-center">
            © {new Date().getFullYear()} Salon Site Builder. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}