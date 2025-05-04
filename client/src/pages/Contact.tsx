// src/pages/Contact.tsx
import React, { useState, useEffect } from 'react'; // Import React
import { useForm, SubmitHandler } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { TopNavigation } from '@/components/layout/TopNavigation'; // Assuming standalone or props based

// Define dummy User type if needed by TopNavigation or form defaults
interface DummyUser { username: string; email?: string; phoneNumber?: string; role: 'user' | 'admin'; }

// Define form values type
interface ContactFormValues {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

// Sample dummy user data (optional, for pre-filling form)
// const dummyUserData: DummyUser | null = { username: "contactUser", email: "contact@example.com", phoneNumber: "555-111-2222", role: "user" };
const dummyUserData: DummyUser | null = null; // Simulate logged out

export default function Contact() {
  // Use dummy data instead of useQuery
  const user = dummyUserData;
  const isLoggedIn = !!user;

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Added submitting state

  const { toast } = useToast();

  // Set default values based on dummy user (if available)
  const defaultValues: Partial<ContactFormValues> = {
    name: user?.username || "",
    email: user?.email || "",
    phone: user?.phoneNumber || "",
    message: "",
  };

  const form = useForm<ContactFormValues>({
    // No Zod resolver needed for standalone UI display
    defaultValues,
    // Reset default values if user state were to change (though it won't here)
    // values: defaultValues // RHF v7 doesn't need 'values' like this typically
  });

   // Effect to reset form if user data changes (e.g., if simulating login/logout)
   useEffect(() => {
     form.reset({
        name: user?.username || "",
        email: user?.email || "",
        phone: user?.phoneNumber || "",
        message: "",
     });
   }, [user, form]);


  // Simulate form submission
  const onSubmit: SubmitHandler<ContactFormValues> = async (data) => {
    setIsSubmitting(true);
    setError(false);
    console.log("Simulating contact form submission:", data);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate Success/Error
    const success = Math.random() > 0.15; // 85% chance success

    if (success) {
      setSubmitted(true);
      toast({
        title: "Message Sent! (Simulated)",
        description: "We'll get back to you soon.",
      });
      // Reset form to defaults (which might include logged-in user info)
      form.reset(defaultValues);
    } else {
      setError(true);
      toast({
        variant: "destructive",
        title: "Error (Simulated)",
        description: "Could not send message. Please try again later.",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Pass dummy data/state to TopNavigation */}
      <TopNavigation user={user} isLoggedIn={isLoggedIn} />

      <main className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-4">
              <MessageSquare className="h-4 w-4 mr-2" />
              Get in Touch
            </div>
            <h1 className="text-4xl font-bold mb-4 text-foreground">Contact Us</h1>
            <p className="text-muted-foreground">
              Have questions? We're here to help. Reach out via the form or details below.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
            {/* Contact Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-foreground mb-1">Contact Information</h2>
              {[
                 { icon: MapPin, title: "Our Address", lines: ["123 Web Builder St", "San Francisco, CA 94107"], color: "gradient-bg" },
                 { icon: Phone, title: "Phone Number", lines: ["+1 (555) 123-4567", "Mon-Fri, 9am-6pm PST"], color: "bg-blue-500" },
                 { icon: Mail, title: "Email Address", lines: ["support@salonsite.com", "Response within 24 hours"], color: "bg-emerald-500" },
                 { icon: Clock, title: "Business Hours", lines: ["Mon-Fri: 9am - 6pm", "Sat: 10am - 4pm", "Sun: Closed"], color: "bg-purple-500" }
              ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${item.color} flex items-center justify-center shadow-md`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-foreground">{item.title}</h3>
                      {item.lines.map((line, lineIdx) => (
                          <p key={lineIdx} className={`mt-1 ${lineIdx > 0 ? 'text-sm' : ''} text-muted-foreground`}>{line}</p>
                      ))}
                    </div>
                  </div>
              ))}
            </div>

            {/* Contact Form */}
            {/* Using standard Card for consistency */}
            <Card className="shadow-md">
             <CardHeader>
                <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                <CardDescription>Fill out the form below.</CardDescription>
             </CardHeader>
             <CardContent>
              {submitted && !error ? (
                // Success State
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-800 mb-2">Message Sent!</h3>
                  <p className="text-green-700 mb-4">
                    Thank you! We'll be in touch shortly.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSubmitted(false)} // Allow sending another
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                // Form State
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <FormField control={form.control} name="name" rules={{required: "Name is required."}} render={({ field }) => (<FormItem><FormLabel>Your Name</FormLabel><FormControl><Input placeholder="Enter your name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="email" rules={{required: "Email is required.", pattern:{value: /^\S+@\S+$/i, message:"Invalid email"}}} render={({ field }) => (<FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone (Optional)</FormLabel><FormControl><Input placeholder="(555) 123-4567" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="message" rules={{required: "Message is required.", minLength: {value: 10, message:"Min 10 characters."}}} render={({ field }) => (<FormItem><FormLabel>Your Message</FormLabel><FormControl><Textarea placeholder="How can we help?" className="min-h-[120px]" {...field}/></FormControl><FormMessage /></FormItem>)} />
                    {error && (
                      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-center text-sm">
                        <AlertTriangle className="h-5 w-5 text-destructive mt-0 mr-2 flex-shrink-0" />
                        <p className="text-destructive"> Error submitting message. Please try again.</p>
                      </div>
                    )}
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </Form>
              )}
              </CardContent>
            </Card>
          </div>

          {/* Map Section - Kept as is */}
          <div className="mt-16 md:mt-20">
            <div className="border border-border overflow-hidden rounded-xl shadow-md">
              <iframe
                title="Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0910700391095!2d-122.4013276246402!3d37.78722311942532!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085807ded297e89%3A0xcfd1a93235d3346f!2s123%20Main%20St%2C%20San%20Francisco%2C%20CA%2094105!5e0!3m2!1sen!2sus!4v1588782007019!5m2!1sen!2sus"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Define dummy User type if needed by TopNavigation
interface User { username: string; email?: string; phoneNumber?: string; role: 'user' | 'admin'; }