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
        latitude: glamping.latitude?.toString(),
        longitude: glamping.longitude?.toString(),
        facilities: glamping.facilities?.map((f: any) => f.id) || [],
        images: glamping.glamping_images?.map((img: any) => img.path) || [],
        thumbnail: glamping.thumbnail,
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/partner/listings">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-2xl font-bold">Edit Glamping</h2>
                    <p className="text-sm text-gray-500">Update your property information</p>
                </div>
            </div>

            <GlampingForm initialData={initialData} id={id} />
        </div>
    );
}
