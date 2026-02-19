'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateGlamping, useFacilities } from '@/hooks/usePartner';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import { MediaUpload } from './MediaUpload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const glampingSchema = z.object({
  name: z.string().min(3, "Name is too short"),
  description: z.string().min(10, "Description is too short"),
  address: z.string().min(5, "Address is required"),
  access_type: z.enum(['city_car', 'suv_only', 'motor_only']),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  facilities: z.array(z.number()),
  images: z.array(z.string()).min(1, "At least one image is required"),
  thumbnail: z.string().optional(),
});

type GlampingFormValues = z.infer<typeof glampingSchema>;

interface GlampingFormProps {
    initialData?: any;
    id?: number;
}

export function GlampingForm({ initialData, id }: GlampingFormProps) {
  const router = useRouter();
  const { data: facilities } = useFacilities();
  const { mutate: createGlamping, isPending: isCreating } = useCreateGlamping();
  const { mutate: updateGlamping, isPending: isUpdating } = useMutation({
    mutationFn: async (payload: any) => {
        const { data } = await api.put(`/partner/glampings/${id}`, payload);
        return data.data;
    },
    onSuccess: () => {
        toast.success("Glamping updated successfully!");
        router.push('/partner/listings');
    }
  });

  const isEdit = !!id;

  const form = useForm<GlampingFormValues>({
    resolver: zodResolver(glampingSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      address: '',
      access_type: 'city_car',
      facilities: [],
      images: [],
    }
  });

  const onSubmit = (data: GlampingFormValues) => {
    if (isEdit) {
        updateGlamping(data);
    } else {
        createGlamping(data, {
          onSuccess: () => {
            toast.success("Glamping created successfully and pending approval!");
            router.push('/partner/listings');
          },
          onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to create glamping");
          }
        });
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Property Name</Label>
            <Input id="name" {...form.register('name')} placeholder="e.g. Pine Forest Glamping" />
            {form.formState.errors.name && <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register('description')} placeholder="Tell us about your property..." rows={5} />
            {form.formState.errors.description && <p className="text-red-500 text-xs">{form.formState.errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="access_type">Access Type</Label>
                <Select onValueChange={(v) => form.setValue('access_type', v as any)} defaultValue="city_car">
                    <SelectTrigger>
                        <SelectValue placeholder="Select access type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="city_car">City Car / Sedan</SelectItem>
                        <SelectItem value="suv_only">SUV / 4x4 Only</SelectItem>
                        <SelectItem value="motor_only">Motorcycle Only</SelectItem>
                    </SelectContent>
                </Select>
             </div>
             <div className="space-y-2">
                <Label htmlFor="address">Address / Area</Label>
                <Input id="address" {...form.register('address')} placeholder="e.g. Lembang, Bandung" />
             </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <MediaUpload 
            value={form.watch('images')} 
            onChange={(paths) => {
                form.setValue('images', paths);
                if (!form.getValues('thumbnail') && paths.length > 0) {
                    form.setValue('thumbnail', paths[0]);
                }
            }} 
          />
          {form.formState.errors.images && <p className="text-red-500 text-xs mt-2">{form.formState.errors.images.message}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Facilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {facilities?.map((facility) => (
              <div key={facility.id} className="flex items-center space-x-2">
                <input 
                  type="checkbox"
                  id={`fac-${facility.id}`} 
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  onChange={(e) => {
                    const checked = e.target.checked;
                    const current = form.getValues('facilities');
                    if (checked) {
                      form.setValue('facilities', [...current, facility.id]);
                    } else {
                      form.setValue('facilities', current.filter(id => id !== facility.id));
                    }
                  }}
                />
                <Label htmlFor={`fac-${facility.id}`} className="text-sm cursor-pointer">{facility.name}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : (isEdit ? 'Update Listing' : 'Create Listing')}
        </Button>
      </div>
    </form>
  );
}
