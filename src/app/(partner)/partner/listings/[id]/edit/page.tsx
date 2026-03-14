'use client';

import { use, useEffect } from 'react';
import { usePartnerGlamping } from '@/hooks/usePartner';
import { GlampingForm } from '@/components/features/partner/GlampingForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditGlampingPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const id = Number(resolvedParams.id);
    const { data: glamping, isLoading } = usePartnerGlamping(id);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-[600px] w-full" />
            </div>
        );
    }

    if (!glamping) return <div>Glamping not found</div>;

    // Transform data for form
    const initialData = {
        name: glamping.name,
        description: glamping.description,
        address: glamping.address,
        access_type: glamping.access_type,
        cancellation_policy: glamping.cancellation_policy,
        reschedule_allowed: glamping.reschedule_allowed,
        min_nights: glamping.min_nights,
        prep_days: glamping.prep_days,
        pet_friendly: glamping.pet_friendly,
        has_wifi: glamping.has_wifi,
        has_electricity: glamping.has_electricity,
        bathroom_type: glamping.bathroom_type,
        access_notes: glamping.access_notes,
        safety_notes: glamping.safety_notes,
        packing_list: glamping.packing_list,
        house_rules: glamping.house_rules,
        latitude: glamping.latitude?.toString(),
        longitude: glamping.longitude?.toString(),
        facilities: glamping.facilities?.map((f: any) => f.id) || [],
        images: glamping.glamping_images?.map((img: any) => img.path) || [],
        thumbnail: glamping.thumbnail,
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full border border-primary/10 bg-white/70">
                    <Link href="/partner/listings">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50">Edit Listing</p>
                    <h2 className="font-display text-3xl text-primary tracking-tight">Edit Glamping</h2>
                    <p className="text-sm text-primary/60">Update your property information</p>
                </div>
            </div>

            <GlampingForm initialData={initialData} id={id} />
        </div>
    );
}
