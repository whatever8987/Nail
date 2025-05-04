// src/components/dashboard/NewSampleSiteCreator.tsx
import React, { useState } from 'react'; // Ensure React is imported
import { useForm, SubmitHandler, Controller } from 'react-hook-form'; // Import Controller
import { useToast } from '@/hooks/use-toast';

// Import UI components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Loader2 } from 'lucide-react'; // Import Loader2

// --- Define the shape of the form data for display ---
interface SalonFormData {
  name: string;
  location: string;
  address?: string;
  phone_number?: string;
  email?: string;
  template: number; // Use number for template ID
  services?: string; // Store as comma-separated string in form state
  description?: string;
  opening_hours?: string;
}

// --- Define the shape of potential validation errors (for display simulation) ---
type DummyBackendErrors = {
  [key in keyof SalonFormData | 'non_field_errors' | string]?: string[];
};


export function NewSampleSiteCreator() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State to hold simulated backend validation errors
  const [backendErrors, setBackendErrors] = useState<DummyBackendErrors | null>(null);

  const form = useForm<SalonFormData>({
    defaultValues: {
      name: "",
      location: "",
      address: "",
      phone_number: "",
      email: "",
      template: 1, // Default template ID (PK)
      services: "", // Store as string in form
      description: "",
      opening_hours: "",
    },
  });

  // --- Simulate Submission ---
  const onSubmit: SubmitHandler<SalonFormData> = async (data) => {
    setIsSubmitting(true);
    setBackendErrors(null); // Clear previous errors

    console.log("Simulating submission with data:", data);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // --- Simulate Success/Error ---
    const success = Math.random() > 0.2; // 80% chance of success

    if (success) {
      toast({
        title: "Success! (Simulated)",
        description: `Sample website "${data.name || 'Test Salon'}" generated successfully.`,
      });
      form.reset(); // Reset form fields
    } else {
      // Simulate backend validation errors
      const simulatedErrors: DummyBackendErrors = {
          name: ["Salon name already exists (simulated)."],
          email: ["Enter a valid email address (simulated)."],
          non_field_errors: ["A general error occurred during simulation."]
      };
      setBackendErrors(simulatedErrors);
      toast({
        title: "Error (Simulated)",
        description: "Failed to generate sample website. Please correct errors.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false); // Re-enable button
  };

  // --- Helper to display simulated errors ---
  const displayError = (fieldName: keyof SalonFormData | string) => {
     const errors = backendErrors?.[fieldName as keyof DummyBackendErrors];
     if (errors && errors.length > 0) {
        return <p className="text-sm text-destructive mt-1">{errors[0]}</p>; // Use destructive color
     }
     return null;
  };

  // --- Sample Templates for Select ---
  // In a real app, fetch these, but use dummy data here
  const dummyTemplates = [
    { id: 1, name: "Elegant (Light & Minimal)"},
    { id: 2, name: "Modern (Bold & Contemporary)"},
    { id: 3, name: "Luxury (Premium & Sophisticated)"},
    { id: 4, name: "Friendly (Warm & Inviting)"},
  ];

  return (
    <Card className="mt-10 shadow-md">
      <CardHeader className="px-6 py-5 border-b border-border">
        <CardTitle>Generate a New Sample Website</CardTitle>
        <CardDescription>
          Create a mock website using business information to generate leads.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 py-5">
        {/* Display non-field errors prominently */}
        {displayError('non_field_errors')}
        {displayError('detail')}

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* --- Salon Name --- */}
            <div className="sm:col-span-3">
              <Label htmlFor="name">Salon Name</Label>
              <Input
                id="name"
                placeholder="Glamour Nails & Spa"
                {...form.register("name", { required: "Salon name is required." })}
                className={`mt-1 ${form.formState.errors.name || backendErrors?.name ? 'border-destructive' : ''}`}
                aria-invalid={!!form.formState.errors.name || !!backendErrors?.name}
              />
              {/* Display frontend validation error */}
              {form.formState.errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
              {/* Display simulated backend error */}
              {displayError('name')}
            </div>

            {/* --- Location --- */}
            <div className="sm:col-span-3">
              <Label htmlFor="location">Location (City, State)</Label>
              <Input
                id="location"
                placeholder="Miami, FL"
                {...form.register("location", { required: "Location is required." })}
                className={`mt-1 ${form.formState.errors.location || backendErrors?.location ? 'border-destructive' : ''}`}
                 aria-invalid={!!form.formState.errors.location || !!backendErrors?.location}
              />
              {form.formState.errors.location && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.location.message}
                </p>
              )}
               {displayError('location')}
            </div>

            {/* --- Address (Optional) --- */}
            <div className="sm:col-span-6">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="123 Main Street, Suite 101"
                {...form.register("address")}
                className={`mt-1 ${backendErrors?.address ? 'border-destructive' : ''}`}
                aria-invalid={!!backendErrors?.address}
              />
               {displayError('address')}
            </div>

            {/* --- Phone Number (Optional) --- */}
            <div className="sm:col-span-3">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                placeholder="(305) 555-1234"
                {...form.register("phone_number")}
                className={`mt-1 ${backendErrors?.phone_number ? 'border-destructive' : ''}`}
                 aria-invalid={!!backendErrors?.phone_number}
              />
               {displayError('phone_number')}
            </div>

            {/* --- Email (Optional) --- */}
            <div className="sm:col-span-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@glamournails.com"
                {...form.register("email")}
                className={`mt-1 ${backendErrors?.email ? 'border-destructive' : ''}`}
                aria-invalid={!!backendErrors?.email}
              />
               {displayError('email')}
            </div>

            {/* --- Template Selection --- */}
            <div className="sm:col-span-3">
              <Label htmlFor="template">Template</Label>
              <Controller
                 control={form.control}
                 name="template"
                 rules={{ required: "Please select a template."}}
                 render={({ field }) => (
                    <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                        defaultValue={field.value?.toString()}
                    >
                        <SelectTrigger className={`mt-1 ${form.formState.errors.template || backendErrors?.template ? 'border-destructive' : ''}`}>
                        <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                          {dummyTemplates.map((template) => (
                             <SelectItem key={template.id} value={template.id.toString()}>
                                {template.name}
                             </SelectItem>
                          ))}
                        </SelectContent>
                    </Select>
                 )}
              />
               {form.formState.errors.template && (
                  <p className="text-sm text-destructive mt-1">
                     {form.formState.errors.template.message}
                  </p>
               )}
               {displayError('template')}
            </div>

            {/* --- Services (Optional) --- */}
            <div className="sm:col-span-6">
              <Label htmlFor="services">Services (Comma-separated)</Label>
              <Textarea
                id="services"
                placeholder="Manicure, Pedicure, Gel Nails, Nail Art"
                {...form.register("services")} // Registering directly as string
                className={`mt-1 ${backendErrors?.services ? 'border-destructive' : ''}`}
                aria-invalid={!!backendErrors?.services}
              />
              <p className="mt-2 text-sm text-muted-foreground"> {/* Adjusted text color */}
                Enter services separated by commas.
              </p>
               {displayError('services')}
            </div>

             {/* --- Description (Optional) --- */}
             <div className="sm:col-span-6">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the salon..."
                  {...form.register("description")}
                  className={`mt-1 ${backendErrors?.description ? 'border-destructive' : ''}`}
                  aria-invalid={!!backendErrors?.description}
                />
                {displayError('description')}
              </div>

              {/* --- Opening Hours (Optional) --- */}
              <div className="sm:col-span-6">
                <Label htmlFor="opening_hours">Opening Hours</Label>
                <Textarea
                  id="opening_hours"
                  placeholder={`Mon-Fri: 9am-7pm\nSat: 10am-5pm`} // Use \n for newline
                  rows={3}
                  {...form.register("opening_hours")}
                  className={`mt-1 ${backendErrors?.opening_hours ? 'border-destructive' : ''}`}
                  aria-invalid={!!backendErrors?.opening_hours}
                />
                {displayError('opening_hours')}
              </div>
          </div>

          {/* --- Submit Button --- */}
          <div className="pt-5 flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting} // Use local submitting state
              className="ml-3 inline-flex items-center"
            >
             {isSubmitting ? (
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
             ) : (
                 <PlusCircle className="mr-2 h-4 w-4" />
             )}
              {isSubmitting ? 'Generating...' : 'Generate Sample Site'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}