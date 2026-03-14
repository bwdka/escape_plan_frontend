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
        <Card className="rounded-[2.5rem]">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-2xl">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50">Preferences</p>
        <h2 className="font-display text-3xl sm:text-4xl text-primary tracking-tight">Settings</h2>
        <p className="text-sm text-primary/60">Profile identity and payment preferences.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="rounded-[3rem] border border-white/70 bg-white/75 p-10 space-y-8 shadow-[0_30px_60px_-45px_rgba(12,24,18,0.45)]">
          <div className="space-y-6">
            <h3 className="font-display text-xl text-primary tracking-tight">Identity</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/50 ml-1">Legal Name</Label>
                <Input {...register('name')} className="rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/50 ml-1">Email (Non-editable)</Label>
                <Input {...register('email')} disabled className="rounded-2xl bg-primary/5 border-transparent opacity-60" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/50 ml-1">Contact Phone</Label>
                <Input {...register('phone')} placeholder="08..." className="rounded-2xl" />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-primary/10 space-y-6">
            <h3 className="font-display text-xl text-primary tracking-tight">Financials</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/50 ml-1">Bank Institution</Label>
                <Input {...register('bank_name')} placeholder="e.g. BCA, Mandiri" className="rounded-2xl" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/50 ml-1">Account Number</Label>
                  <Input {...register('bank_account_number')} className="rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/50 ml-1">Beneficiary Name</Label>
                  <Input {...register('bank_account_holder')} className="rounded-2xl" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" size="lg" className="rounded-2xl px-10 h-14 bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-xl shadow-primary/20" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? 'Syncing...' : 'Update Profile'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
