'use client';

import { useForm, useFieldArray } from 'react-hook-form';
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
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AMENITY_ICON_FALLBACK, AMENITY_ICON_KEYS, AMENITY_ICON_MAP } from '@/lib/amenities';
import { MinusCircle } from 'lucide-react';

const glampingSchema = z.object({
  name: z.string().min(3, "Name is too short"),
  description: z.string().min(10, "Description is too short"),
  address: z.string().min(5, "Address is required"),
  access_type: z.enum(['city_car', 'suv_only', 'motor_only']),
  cancellation_policy: z.enum(['flexible', 'moderate', 'strict', 'non_refundable']),
  reschedule_allowed: z.boolean().optional(),
  min_nights: z.number().min(1).max(30).optional(),
  prep_days: z.number().min(0).max(7).optional(),
  pet_friendly: z.boolean().optional(),
  has_wifi: z.boolean().optional(),
  has_electricity: z.boolean().optional(),
  bathroom_type: z.enum(['private', 'shared', 'none']).optional(),
  access_notes: z.string().optional(),
  safety_notes: z.string().optional(),
  packing_list: z.string().optional(),
  house_rules: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  facilities: z.array(z.number()),
  images: z.array(z.string()).min(1, "At least one image is required"),
  thumbnail: z.string().optional(),
  addons: z.array(z.object({
    id: z.number().optional(),
    name: z.string().min(2, "Addon name is required"),
    price: z.number().min(0, "Price must be 0 or more"),
    unit: z.enum(['per_night', 'per_stay', 'per_person']),
    description: z.string().optional(),
    icon: z.string().optional(),
  })),
});

type GlampingFormValues = z.infer<typeof glampingSchema>;

interface GlampingFormProps {
    initialData?: any;
    id?: number;
}

type IconPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

function IconPicker({ value, onChange }: IconPickerProps) {
  const SelectedIcon = AMENITY_ICON_MAP[value] || AMENITY_ICON_FALLBACK;
  const label = value || 'Select icon';
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-2.5 flex items-center gap-3 hover:border-accent/50 transition-colors"
        >
          <span className="h-9 w-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
            <SelectedIcon className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold text-primary/70 truncate">{label}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Pick an Icon</DialogTitle>
          <DialogDescription>Select an icon for this add-on.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
          <button
            type="button"
            onClick={() => {
              onChange('');
              setOpen(false);
            }}
            className={`h-10 w-10 rounded-xl border ${!value ? 'border-accent bg-accent/10' : 'border-white/70 bg-white/70'} flex items-center justify-center`}
            title="None"
          >
            <MinusCircle className="h-4 w-4" />
          </button>
          {AMENITY_ICON_KEYS.map((key) => {
            const Icon = AMENITY_ICON_MAP[key] || AMENITY_ICON_FALLBACK;
            const isActive = value === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onChange(key);
                  setOpen(false);
                }}
                className={`h-10 w-10 rounded-xl border ${isActive ? 'border-accent bg-accent/10' : 'border-white/70 bg-white/70'} flex items-center justify-center`}
                title={key}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
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
      cancellation_policy: 'moderate',
      reschedule_allowed: true,
      min_nights: 1,
      prep_days: 0,
      pet_friendly: false,
      has_wifi: false,
      has_electricity: true,
      bathroom_type: 'shared',
      access_notes: '',
      safety_notes: '',
      packing_list: '',
      house_rules: '',
      facilities: [],
      images: [],
      addons: [],
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
  const addonsFieldArray = useFieldArray({ control: form.control, name: 'addons' });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
      <Card className="rounded-[2.5rem] border-white/70 bg-white/75 shadow-xl">
        <CardHeader>
          <CardTitle className="font-display text-xl text-primary">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Property Name</Label>
            <Input id="name" {...form.register('name')} placeholder="e.g. Pine Forest Glamping" className="rounded-2xl" />
            {form.formState.errors.name && <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register('description')} placeholder="Tell us about your property..." rows={5} className="rounded-2xl" />
            {form.formState.errors.description && <p className="text-red-500 text-xs">{form.formState.errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="access_type">Access Type</Label>
                <Select value={form.watch('access_type')} onValueChange={(v) => form.setValue('access_type', v as any)}>
                    <SelectTrigger className="rounded-2xl">
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
                <Input id="address" {...form.register('address')} placeholder="e.g. Lembang, Bandung" className="rounded-2xl" />
             </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2.5rem] border-white/70 bg-white/75 shadow-xl">
        <CardHeader>
          <CardTitle className="font-display text-xl text-primary">Policies & Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
              <Select value={form.watch('cancellation_policy')} onValueChange={(v) => form.setValue('cancellation_policy', v as any)}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="Select policy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flexible">Flexible</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="strict">Strict</SelectItem>
                  <SelectItem value="non_refundable">Non-refundable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathroom_type">Bathroom Type</Label>
              <Select value={form.watch('bathroom_type')} onValueChange={(v) => form.setValue('bathroom_type', v as any)}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="Select bathroom type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="shared">Shared</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Minimum Nights</Label>
              <Input type="number" {...form.register('min_nights', { valueAsNumber: true })} className="rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Label>Prep Days After Checkout</Label>
              <Input type="number" {...form.register('prep_days', { valueAsNumber: true })} className="rounded-2xl" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-semibold text-primary/70">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...form.register('reschedule_allowed')} />
              Reschedule Allowed
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...form.register('pet_friendly')} />
              Pet Friendly
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...form.register('has_wifi')} />
              WiFi Available
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...form.register('has_electricity')} />
              Electricity Available
            </label>
          </div>

          <div className="space-y-2">
            <Label>Access Notes</Label>
            <Textarea {...form.register('access_notes')} className="rounded-2xl" placeholder="Road condition, parking, pickup info..." />
          </div>
          <div className="space-y-2">
            <Label>Safety Notes</Label>
            <Textarea {...form.register('safety_notes')} className="rounded-2xl" placeholder="Safety boundaries, weather warning, etc." />
          </div>
          <div className="space-y-2">
            <Label>Packing List</Label>
            <Textarea {...form.register('packing_list')} className="rounded-2xl" placeholder="Jacket, flashlight, sandals..." />
          </div>
          <div className="space-y-2">
            <Label>House Rules</Label>
            <Textarea {...form.register('house_rules')} className="rounded-2xl" placeholder="Quiet hours, no littering, etc." />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2.5rem] border-white/70 bg-white/75 shadow-xl">
        <CardHeader>
          <CardTitle className="font-display text-xl text-primary">Photos</CardTitle>
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

      <Card className="rounded-[2.5rem] border-white/70 bg-white/75 shadow-xl">
        <CardHeader>
          <CardTitle className="font-display text-xl text-primary">Include Facilities</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-primary/60 mb-4">Included in base price. Guests get these for free.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {facilities?.map((facility) => (
              <div key={facility.id} className="flex items-center space-x-2 rounded-2xl border border-white/70 bg-white/70 px-3 py-2">
                <input 
                  type="checkbox"
                  id={`fac-${facility.id}`} 
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={form.watch('facilities')?.includes(facility.id)}
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

      <Card className="rounded-[2.5rem] border-white/70 bg-white/75 shadow-xl">
        <CardHeader>
          <CardTitle className="font-display text-xl text-primary">Add-on Facilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-primary/60">Optional paid extras. Guests can add these during booking.</p>
          {addonsFieldArray.fields.length === 0 && (
            <p className="text-sm text-primary/60">No add-ons yet. Add extra paid facilities like BBQ, ATV, or breakfast.</p>
          )}
          <div className="space-y-4">
            {addonsFieldArray.fields.map((field, index) => (
              <div key={field.id} className="rounded-2xl border border-white/70 bg-white/70 p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="space-y-2">
                    <Label>Addon Name</Label>
                    <Input
                      {...form.register(`addons.${index}.name` as const)}
                      className="rounded-2xl"
                      placeholder="e.g. BBQ Package"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input
                      type="number"
                      {...form.register(`addons.${index}.price` as const, { valueAsNumber: true })}
                      className="rounded-2xl"
                      placeholder="250000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Select
                      value={form.watch(`addons.${index}.unit` as const)}
                      onValueChange={(v) => form.setValue(`addons.${index}.unit` as const, v as any)}
                    >
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="per_stay">Per Stay</SelectItem>
                        <SelectItem value="per_night">Per Night</SelectItem>
                        <SelectItem value="per_person">Per Person</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <IconPicker
                      value={form.watch(`addons.${index}.icon` as const) || ''}
                      onChange={(v) => form.setValue(`addons.${index}.icon` as const, v)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    {...form.register(`addons.${index}.description` as const)}
                    className="rounded-2xl"
                    placeholder="Optional details for guests"
                    rows={2}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addonsFieldArray.remove(index)}
                    className="rounded-2xl"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => addonsFieldArray.append({ name: '', price: 0, unit: 'per_stay', description: '', icon: '' })}
            className="rounded-2xl"
          >
            Add Add-on
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" onClick={() => router.back()} className="rounded-2xl">Cancel</Button>
        <Button type="submit" disabled={isPending} className="rounded-2xl">
            {isPending ? 'Saving...' : (isEdit ? 'Update Listing' : 'Create Listing')}
        </Button>
      </div>
    </form>
  );
}
