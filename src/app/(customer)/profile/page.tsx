'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useProfile, useUpdateProfile } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, User, Phone, Landmark, ShieldCheck } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  phone: z.string().optional().nullable(),
  bank_name: z.string().optional().nullable(),
  bank_account_number: z.string().optional().nullable(),
  bank_account_holder: z.string().optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { data: user, isLoading } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      phone: '',
      bank_name: '',
      bank_account_number: '',
      bank_account_holder: '',
    }
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || '',
        phone: user.phone || '',
        bank_name: user.bank_name || '',
        bank_account_number: user.bank_account_number || '',
        bank_account_holder: user.bank_account_holder || '',
      });
    }
  }, [user, form]);

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile(data, {
      onSuccess: () => {
        toast.success("Profile updated successfully!");
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to update profile");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary/20" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 md:py-16 max-w-4xl">
      <div className="flex flex-col gap-2 mb-12">
        <h1 className="text-4xl font-black text-primary tracking-tighter">Identity & Finance</h1>
        <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">Manage your escape credentials</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
        {/* Profile Card */}
        <div className="lg:col-span-1">
            <div className="glass p-6 md:p-8 rounded-[2.5rem] border-white/40 text-center space-y-6 lg:sticky lg:top-32">
                <div className="w-24 h-24 bg-primary rounded-3xl mx-auto flex items-center justify-center text-white text-4xl font-black shadow-2xl">
                    {user?.name?.charAt(0)}
                </div>
                <div>
                    <h3 className="font-black text-xl text-primary">{user?.name}</h3>
                    <p className="text-xs font-bold text-primary/40 uppercase tracking-widest">{user?.role}</p>
                </div>
                <div className="pt-6 border-t border-primary/5 flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-xs font-bold text-primary/60">
                        <ShieldCheck size={14} className="text-accent" />
                        Verified Account
                    </div>
                </div>
            </div>
        </div>

        {/* Settings Form */}
        <div className="lg:col-span-2 space-y-10">
            <div className="glass p-6 md:p-8 lg:p-10 rounded-[2.5rem] md:rounded-[3rem] border-white/40 shadow-xl">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                <User size={16} />
                            </div>
                            <h4 className="font-black text-primary uppercase tracking-widest text-xs">Basic Information</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Display Name</Label>
                                <Input {...form.register('name')} placeholder="Full Name" className="h-12 rounded-2xl" />
                                {form.formState.errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{form.formState.errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Phone Number</Label>
                                <Input {...form.register('phone')} placeholder="08..." className="h-12 rounded-2xl" />
                            </div>
                        </div>
                    </div>

                    {/* Financial Info (Payouts) */}
                    <div className="space-y-6">
                         <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                                <Landmark size={16} />
                            </div>
                            <h4 className="font-black text-primary uppercase tracking-widest text-xs">Financial Details (Payouts/Refunds)</h4>
                        </div>
                        
                        <div className="space-y-6 p-8 bg-primary/5 rounded-[2rem] border border-primary/5">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Bank Name</Label>
                                <Input {...form.register('bank_name')} placeholder="e.g. BCA, Mandiri" className="h-12 rounded-2xl bg-white/50" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Account Number</Label>
                                    <Input {...form.register('bank_account_number')} placeholder="Digits only" className="h-12 rounded-2xl bg-white/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Account Holder Name</Label>
                                    <Input {...form.register('bank_account_holder')} placeholder="Exactly as in book" className="h-12 rounded-2xl bg-white/50" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6">
                        <Button 
                            type="submit" 
                            disabled={isUpdating}
                            className="h-14 px-8 sm:px-10 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-all w-full sm:w-auto"
                        >
                            {isUpdating ? <Loader2 className="animate-spin mr-2" /> : null}
                            Update Identity
                        </Button>
                    </div>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
}
