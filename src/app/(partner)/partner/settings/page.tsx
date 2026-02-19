'use client';

import { useProfile, useUpdateProfile } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PartnerSettingsPage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
        bank_name: profile.bank_name || '',
        bank_account_number: profile.bank_account_number || '',
        bank_account_holder: profile.bank_account_holder || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: any) => {
    updateProfile.mutate(data, {
      onSuccess: () => toast.success("Profile updated successfully"),
      onError: () => toast.error("Failed to update profile")
    });
  };

  if (isLoading) {
    return (
        <div className="space-y-6 max-w-2xl">
            <Skeleton className="h-8 w-48" />
            <Card><CardContent className="p-6 space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></CardContent></Card>
        </div>
    );
  }

  return (
    <div className="space-y-10 max-w-2xl">
        <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-black text-primary tracking-tighter">Settings</h2>
            <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">Profile & Payment Preferences</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="glass p-10 rounded-[3rem] border-white/40 space-y-8 shadow-xl">
                <div className="space-y-6">
                    <h3 className="font-black text-xl text-primary tracking-tight">Identity</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Legal Name</Label>
                            <Input {...register('name')} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Email (Non-editable)</Label>
                            <Input {...register('email')} disabled className="bg-primary/5 border-transparent opacity-60" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Contact Phone</Label>
                            <Input {...register('phone')} placeholder="08..." />
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-primary/5 space-y-6">
                    <h3 className="font-black text-xl text-primary tracking-tight">Financials</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Bank Institution</Label>
                            <Input {...register('bank_name')} placeholder="e.g. BCA, Mandiri" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Account Number</Label>
                                <Input {...register('bank_account_number')} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Beneficiary Name</Label>
                                <Input {...register('bank_account_holder')} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <Button type="submit" size="lg" className="rounded-xl px-10 h-14 bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-xl shadow-primary/20" disabled={updateProfile.isPending}>
                        {updateProfile.isPending ? 'Syncing...' : 'Update Profile'}
                    </Button>
                </div>
            </div>
        </form>
    </div>
  );
}
