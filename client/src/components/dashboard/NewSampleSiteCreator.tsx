import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
//import { insertSalonSchema } from "@shared/schema";
import { z } from "zod";

// Extend the salon schema with form-specific validation
//const salonFormSchema = insertSalonSchema.extend({
//  services: z.string().optional().transform(val => 
//    val ? val.split(',').map(service => service.trim()) : []
//  ),
//});

type SalonFormValues = z.infer<typeof salonFormSchema>;

export function NewSampleSiteCreator() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SalonFormValues>({
    resolver: zodResolver(salonFormSchema),
    defaultValues: {
      name: "",
      location: "",
      address: "",
      phoneNumber: "",
      email: "",
      services: "",
      templateId: 1, // Default template
    },
  });

  const createSalonMutation = useMutation({
    mutationFn: (data: SalonFormValues) => 
      apiRequest("POST", "/api/salons", data).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Sample website has been generated successfully.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/salons"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to generate sample website: ${error}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: SalonFormValues) => {
    setIsSubmitting(true);
    createSalonMutation.mutate(data);
  };

  return (
    <Card className="mt-10">
      <CardHeader className="px-6 py-5 border-b border-gray-200">
        <CardTitle>Generate a New Sample Website</CardTitle>
        <CardDescription>
          Create a mock website using business information to generate leads.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 py-5">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <Label htmlFor="name">Salon Name</Label>
              <Input
                id="name"
                placeholder="Glamour Nails & Spa"
                {...form.register("name")}
                className="mt-1"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-3">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Miami, FL"
                {...form.register("location")}
                className="mt-1"
              />
              {form.formState.errors.location && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.location.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-6">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="123 Main Street, Suite 101, Miami, FL 33101"
                {...form.register("address")}
                className="mt-1"
              />
              {form.formState.errors.address && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-3">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                placeholder="(305) 555-1234"
                {...form.register("phoneNumber")}
                className="mt-1"
              />
              {form.formState.errors.phoneNumber && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.phoneNumber.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@glamournails.com"
                {...form.register("email")}
                className="mt-1"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-6">
              <Label htmlFor="template">Template</Label>
              <Select onValueChange={(value) => form.setValue("templateId", parseInt(value))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Elegant (Light & Minimal)</SelectItem>
                  <SelectItem value="2">Modern (Bold & Contemporary)</SelectItem>
                  <SelectItem value="3">Luxury (Premium & Sophisticated)</SelectItem>
                  <SelectItem value="4">Friendly (Warm & Inviting)</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.templateId && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.templateId.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-6">
              <Label htmlFor="services">Services (Optional)</Label>
              <Textarea
                id="services"
                placeholder="Manicure, Pedicure, Gel Nails, Nail Art, Waxing"
                {...form.register("services")}
                className="mt-1"
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter services separated by commas, or leave blank to auto-generate from business data.
              </p>
            </div>
          </div>

          <div className="pt-5 flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="ml-3 inline-flex items-center"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Generate Sample Site
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
