// src/pages/ClientPortal.tsx
import React, { useState, useEffect } from 'react'; // Import React and useEffect
import { useForm, SubmitHandler, Controller } from 'react-hook-form'; // Import Controller
// import { useLocation } from 'wouter'; // Remove if not navigating
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, EyeIcon, PanelLeft, Image, FileText, Clock } from 'lucide-react';
import { TopNavigation } from '@/components/layout/TopNavigation'; // Assuming standalone or props based
import { TabNavigation } from '@/components/layout/TabNavigation'; // Assuming standalone or props based

// --- Dummy Data and Types ---
interface DummyUser { username: string; email?: string; role: 'user' | 'admin'; }
interface DummySalon {
  id: number;
  name: string;
  address: string;
  location: string;
  email?: string | null;
  phone_number?: string | null; // Match model field name
  description?: string | null;
  services?: string[] | null; // Assuming services are strings
  opening_hours?: string | null; // Match model field name
  template_id?: number | null; // Match model field name
  sample_url: string;
  claimed?: boolean;
  claimed_at?: string | Date | null; // Allow string/Date
}
interface DummyTemplate { id: number; name: string; description?: string; }

interface SalonFormData {
  name: string;
  address: string;
  location: string;
  email?: string | null;
  phone_number?: string | null; // Match model field name
  description?: string | null;
  services?: string[] | null;
  opening_hours?: string | null; // Match model field name
  template_id?: number | null; // Match model field name
}

// Sample dummy data
const dummyUserData: DummyUser = { username: "salonOwner", role: "user" };
const dummySalonData: DummySalon | null = { // Start with existing salon data example
    id: 101,
    name: "Prestige Nails",
    address: "456 Style Ave",
    location: "Beverly Hills",
    email: "contact@prestige.com",
    phone_number: "(310) 555-9876",
    description: "Upscale nail salon offering premium manicure and pedicure services. Relax in our luxurious environment.",
    services: ["Gel Manicure - $55", "Spa Pedicure - $70", "Nail Extensions - $80+", "Custom Nail Art"],
    opening_hours: "Tue-Sat: 10am - 7pm\nSun: 11am - 5pm\nMon: Closed",
    template_id: 3,
    sample_url: "prestige-nails-bh",
    claimed: true,
    claimed_at: new Date(Date.now() - 1000*60*60*24*30), // Claimed 30 days ago
};
// const dummySalonData: DummySalon | null = null; // Use this to simulate NO existing salon

const dummyTemplatesData: DummyTemplate[] = [
    { id: 1, name: "Elegant", description: "Light & Minimal" },
    { id: 2, name: "Modern", description: "Bold & Contemporary" },
    { id: 3, name: "Luxury", description: "Premium & Sophisticated" },
];

export default function ClientPortal() {
  // const [, navigate] = useLocation(); // Remove if not navigating
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(!dummySalonData); // Start in edit mode if no salon data
  const [isSaving, setIsSaving] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false); // Added state for claiming simulation

  // Use dummy data directly
  const user = dummyUserData;
  const [salon, setSalon] = useState<DummySalon | null>(dummySalonData); // Use state to allow claiming/updating
  const templates = dummyTemplatesData;
  const isLoadingUser = false; // Simulate loaded
  const isLoadingSalon = false;
  const isLoadingTemplates = false;

  const salonForm = useForm<SalonFormData>({
    // No resolver
    defaultValues: { // Initialize with dummy data or defaults
      name: salon?.name || "",
      address: salon?.address || "",
      location: salon?.location || "",
      email: salon?.email || "",
      phone_number: salon?.phone_number || "",
      description: salon?.description || "",
      services: salon?.services || [],
      opening_hours: salon?.opening_hours || "",
      template_id: salon?.template_id || null,
    },
  });

  // Reset form when salon data changes (e.g., after simulated claim) or editMode toggles
  useEffect(() => {
    if (salon) {
      salonForm.reset({
        name: salon.name,
        address: salon.address,
        location: salon.location,
        email: salon.email,
        phone_number: salon.phone_number,
        description: salon.description || "",
        services: salon.services || [],
        opening_hours: salon.opening_hours || "",
        template_id: salon.template_id,
      });
    } else {
         salonForm.reset({ // Reset to empty if no salon
            name: "", address: "", location: "", email: "", phone_number: "",
            description: "", services: [], opening_hours: "", template_id: null
         });
    }
  }, [salon, editMode, salonForm]);


  // Simulate Create/Update
  const onSubmit: SubmitHandler<SalonFormData> = async (data) => {
    setIsSaving(true);
    console.log("Simulating salon save with:", data);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate updating or creating the salon state
    const newOrUpdatedSalon: DummySalon = {
        ...(salon || { id: Date.now(), sample_url: slugify(data.name + '-' + data.location), claimed: true, claimed_at: new Date() }), // Create dummy ID/URL if new
        ...data,
        template_id: data.template_id ? Number(data.template_id) : null, // Ensure number
        phone_number: data.phone_number, // Use correct field name
        opening_hours: data.opening_hours // Use correct field name
    };
    setSalon(newOrUpdatedSalon);

    toast({
      title: salon ? "Website updated (Simulated)" : "Website created (Simulated)",
      description: salon ? "Your website has been updated." : "Your website has been created.",
    });
    setEditMode(false); // Exit edit mode on successful save
    setIsSaving(false);
  };

  // Simulate Claim
  const handleClaimSalon = async () => {
     if (salon && salon.id && !salon.claimed) {
       setIsClaiming(true);
       console.log(`Simulating claim for salon ID: ${salon.id}`);
       await new Promise(resolve => setTimeout(resolve, 1000));
       setSalon(prev => prev ? { ...prev, claimed: true, claimed_at: new Date() } : null);
       toast({
         title: "Website Claimed (Simulated)",
         description: "You have claimed this website.",
       });
       setIsClaiming(false);
     }
   };

  // --- Service List Management ---
  // These directly modify react-hook-form state
  const addService = () => {
    const currentServices = salonForm.getValues().services || [];
    salonForm.setValue("services", [...currentServices, "New Service - $0"], { shouldDirty: true });
  };

  const removeService = (index: number) => {
    const currentServices = salonForm.getValues().services || [];
    salonForm.setValue(
      "services",
      currentServices.filter((_, i) => i !== index),
      { shouldDirty: true }
    );
  };

  const handleUpdateService = (index: number, value: string) => {
    const currentServices = salonForm.getValues().services || [];
    const newServices = [...currentServices];
    newServices[index] = value;
    salonForm.setValue("services", newServices, { shouldDirty: true });
  };

  // Simulate Preview
  const handlePreviewWebsite = () => {
    if (salon) {
      // Construct URL for preview (won't actually load anything meaningful here)
      const previewUrl = `/app/demo/${salon.sample_url}`; // Use relative path
      alert(`Simulating preview: Would open ${previewUrl} in new tab.`);
      // window.open(previewUrl, '_blank'); // Uncomment to attempt opening
    } else {
      toast({
        title: "Preview Unavailable",
        description: "Create and save your website first.",
        variant: "destructive",
      });
    }
  };


  // Show loading skeletons if needed
  if (isLoadingUser || isLoadingSalon || isLoadingTemplates) { // Check all loading states
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

   // Basic check if user data is available
  if (!user) {
     return (
         <div className="p-8 text-center text-red-600">Error: User data not available for display.</div>
     );
  }

  // Tabs for navigation within the portal
  const portalTabs = [
    { name: "My Website", href: "/portal" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Subscription", href: "/subscribe" },
    { name: "Account", href: "/account" },
  ];

  // Function to create slug (simple version)
  const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopNavigation user={user} isLoggedIn={true} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> {/* Adjusted max-width */}
        <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Website Management</h1>
            <p className="mt-1 text-muted-foreground">
              {salon ? "Edit your website content and settings" : "Set up your new salon website"}
            </p>
          </div>
          <div className="flex flex-wrap space-x-3">
            <Button
              variant="outline"
              onClick={handlePreviewWebsite}
              disabled={!salon}
              size="sm"
            >
              <EyeIcon className="mr-2 h-4 w-4" />
              Preview Website
            </Button>
            {/* Toggle Edit/Save Button */}
            {salon && editMode ? (
                 <Button
                    onClick={salonForm.handleSubmit(onSubmit)} // Trigger form save
                    disabled={isSaving}
                    size="sm"
                >
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                 </Button>
            ) : salon && !editMode ? (
                 <Button onClick={() => setEditMode(true)} size="sm">
                   Edit Website
                 </Button>
            ) : null}
              {/* Cancel button only in edit mode */}
             {editMode && salon && (
                 <Button variant="ghost" onClick={() => { setEditMode(false); salonForm.reset(); }} size="sm"> {/* Reset form on cancel */}
                     Cancel
                 </Button>
             )}
          </div>
        </div>

        {/* Use standalone TabNavigation simulation */}
        <div className="border-b border-border mb-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {portalTabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => alert(`Navigate to ${tab.name}`)} // Simulate navigation
                className={`whitespace-nowrap px-1 pb-4 pt-1 border-b-2 font-medium text-sm transition-colors ${
                   '/portal' === tab.href // Simulate active state
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
                aria-current={'/portal' === tab.href ? "page" : undefined}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>


        <div className="mt-6">
          {/* --- Display Mode (Read Only) --- */}
          {salon && !editMode ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{salon.name}</CardTitle>
                  <CardDescription>{salon.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2 text-foreground">Contact Info</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p><strong>Email:</strong> {salon.email || "n/a"}</p>
                        <p><strong>Phone:</strong> {salon.phone_number || "n/a"}</p>
                        <p><strong>Address:</strong> {salon.address || "n/a"}</p>
                      </div>
                    </div>
                    <div>
                       <h3 className="text-lg font-medium mb-2 text-foreground">Website Details</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p><strong>URL:</strong> .../demo/{salon.sample_url}</p>
                        <p><strong>Template:</strong> {templates?.find(t => t.id === salon.template_id)?.name || "Custom/None"}</p>
                        <p><strong>Claimed:</strong> {salon.claimed ? `Yes (${new Date(salon.claimed_at ?? '').toLocaleDateString()})` : 'No'}</p>
                      </div>
                    </div>
                  </div>
                  {salon.description && ( <div className="mt-6 pt-4 border-t"><h3 className="text-lg font-medium mb-2 text-foreground">About</h3><p className="text-sm text-muted-foreground">{salon.description}</p></div> )}
                  {salon.services && salon.services.length > 0 && ( <div className="mt-6 pt-4 border-t"><h3 className="text-lg font-medium mb-2 text-foreground">Services</h3><ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">{salon.services.map((s, i) => <li key={i}>{s}</li>)}</ul></div> )}
                  {salon.opening_hours && ( <div className="mt-6 pt-4 border-t"><h3 className="text-lg font-medium mb-2 text-foreground">Opening Hours</h3><p className="text-sm text-muted-foreground whitespace-pre-line">{salon.opening_hours}</p></div> )}
                </CardContent>
                {!salon.claimed && ( // Show claim button only if not claimed
                    <CardFooter>
                        <Button onClick={handleClaimSalon} disabled={isClaiming}>
                            {isClaiming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Claim This Website
                        </Button>
                    </CardFooter>
                )}
              </Card>
            </div>
          ) : (
            /* --- Edit/Create Mode (The Form) --- */
            <Form {...salonForm}>
              <form onSubmit={salonForm.handleSubmit(onSubmit)} className="space-y-8">
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="mb-6 grid w-full grid-cols-4"> {/* Grid for equal tabs */}
                    <TabsTrigger value="general"><PanelLeft className="mr-1.5 h-4 w-4 sm:mr-2" />General</TabsTrigger>
                    <TabsTrigger value="content"><FileText className="mr-1.5 h-4 w-4 sm:mr-2" />Content</TabsTrigger>
                    <TabsTrigger value="services"><Image className="mr-1.5 h-4 w-4 sm:mr-2" />Services</TabsTrigger>
                    <TabsTrigger value="hours"><Clock className="mr-1.5 h-4 w-4 sm:mr-2" />Hours</TabsTrigger>
                  </TabsList>

                  {/* General Tab */}
                  <TabsContent value="general" className="mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle>Business Information</CardTitle>
                        <CardDescription>Basic info for your website.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField control={salonForm.control} name="name" rules={{ required: "Name is required." }} render={({ field }) => (<FormItem><FormLabel>Salon Name*</FormLabel><FormControl><Input placeholder="e.g. Glamour Nails" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField control={salonForm.control} name="address" rules={{ required: "Address is required." }} render={({ field }) => (<FormItem><FormLabel>Address*</FormLabel><FormControl><Input placeholder="123 Main St" {...field} /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={salonForm.control} name="location" rules={{ required: "Location is required." }} render={({ field }) => (<FormItem><FormLabel>City*</FormLabel><FormControl><Input placeholder="Miami" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                           <FormField control={salonForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="contact@yoursalon.com" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                           <FormField control={salonForm.control} name="phone_number" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="(123) 456-7890" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                         <FormField control={salonForm.control} name="template_id" render={({ field }) => (
                             <FormItem>
                               <FormLabel>Website Template</FormLabel>
                               <Controller
                                   control={salonForm.control}
                                   name="template_id"
                                   render={({ field: controllerField }) => ( // Use Controller for Select
                                       <Select
                                           onValueChange={(value) => controllerField.onChange(value ? parseInt(value) : null)}
                                           value={controllerField.value?.toString() ?? ""}
                                           defaultValue={controllerField.value?.toString() ?? ""}
                                       >
                                           <FormControl>
                                               <SelectTrigger>
                                                   <SelectValue placeholder="Select a template..." />
                                               </SelectTrigger>
                                           </FormControl>
                                           <SelectContent>
                                               <SelectItem value="">(No Template / Custom)</SelectItem>
                                               {templates?.map((template) => (
                                                   <SelectItem key={template.id} value={template.id.toString()}>
                                                       {template.name}
                                                   </SelectItem>
                                               ))}
                                           </SelectContent>
                                       </Select>
                                   )}
                               />
                               <FormDescription>Choose a base design.</FormDescription>
                               <FormMessage />
                             </FormItem>
                         )}/>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Content Tab */}
                  <TabsContent value="content" className="mt-0">
                    <Card>
                      <CardHeader><CardTitle>Website Content</CardTitle><CardDescription>Describe your salon.</CardDescription></CardHeader>
                      <CardContent><FormField control={salonForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>About Your Salon</FormLabel><FormControl><Textarea placeholder="Describe your salon..." rows={6} {...field} value={field.value ?? ""} /></FormControl><FormDescription>Appears on your homepage.</FormDescription><FormMessage /></FormItem>)} /></CardContent>
                    </Card>
                  </TabsContent>

                  {/* Services Tab */}
                  <TabsContent value="services" className="mt-0">
                    <Card>
                      <CardHeader><CardTitle>Salon Services</CardTitle><CardDescription>List services and prices.</CardDescription></CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {(salonForm.getValues().services || []).map((service, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input value={service} onChange={(e) => handleUpdateService(index, e.target.value)} placeholder="Service Name - $Price" className="flex-grow"/>
                              <Button variant="ghost" size="icon" type="button" onClick={() => removeService(index)} className="text-destructive hover:bg-destructive/10 h-9 w-9"><span className="sr-only">Remove</span>×</Button>
                            </div>
                          ))}
                          <Button type="button" variant="outline" onClick={addService} size="sm">Add Service Item</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Hours Tab */}
                  <TabsContent value="hours" className="mt-0">
                    <Card>
                      <CardHeader><CardTitle>Business Hours</CardTitle><CardDescription>Enter opening hours.</CardDescription></CardHeader>
                      <CardContent><FormField control={salonForm.control} name="opening_hours" render={({ field }) => (<FormItem><FormLabel>Opening Hours</FormLabel><FormControl><Textarea placeholder={"Monday: 9am - 7pm\nTuesday: 9am - 7pm\n..."} rows={7} {...field} value={field.value ?? ""} /></FormControl><FormDescription>Enter each day on a new line.</FormDescription><FormMessage /></FormItem>)} /></CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {salon ? "Update Website" : "Create Website"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </main>
    </div>
  );
}

// Define dummy types needed by the component if not imported
interface User { username: string; email?: string; role: 'user' | 'admin'; }
interface Salon { id: number; name: string; address?: string | null; location: string; email?: string | null; phoneNumber?: string | null; description?: string | null; services?: string[] | null; openingHours?: string | null; templateId?: number | null; sampleUrl: string; claimed?: boolean; claimedAt?: string | Date | null; contactStatus?: string }
interface Template { id: number; name: string; description?: string }