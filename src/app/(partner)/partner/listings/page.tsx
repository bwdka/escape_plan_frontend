'use client';

import { usePartnerListings, useDeleteGlamping } from "@/hooks/usePartner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit2, Trash2, Eye, Tent, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function MyListingsPage() {
  const { data: response, isLoading, error } = usePartnerListings();
  const { mutate: deleteGlamping } = useDeleteGlamping();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this listing? This will also delete all units and associated data.")) {
        deleteGlamping(id, {
            onSuccess: () => toast.success("Listing deleted successfully"),
            onError: (err: any) => toast.error(err.response?.data?.message || "Failed to delete listing")
        });
    }
  };

  // Handle unverified partner error
  if (error && (error as any).response?.status === 403) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] rounded-[2.5rem] border border-dashed border-primary/20 bg-white/70 p-12 text-center shadow-xl">
        <div className="h-16 w-16 bg-accent/20 rounded-2xl flex items-center justify-center mb-4">
          <Plus className="h-8 w-8 text-accent rotate-45" />
        </div>
        <h3 className="text-xl font-black text-primary mb-2">Account Verification Pending</h3>
        <p className="text-primary/60 max-w-sm mx-auto">
          Your partner account is currently under review by our team. You&apos;ll be able to manage your listings once your account is verified.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-[2.5rem]" />)}
        </div>
    );
  }

  const listings = (response as any)?.data || [];
  const storageBase = (process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8000/storage/').replace(/\/+$/, '/') ;
  const resolveImage = (src?: string) => {
    if (!src) return 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=400&q=80';
    if (src.startsWith('http')) return src;
    let normalized = src.replace(/^\/+/, '');
    if (storageBase.includes('/storage/') && normalized.startsWith('storage/')) {
      normalized = normalized.replace(/^storage\//, '');
    }
    return `${storageBase}${normalized}`;
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50">Portfolio</p>
          <h2 className="font-display text-3xl sm:text-4xl text-primary tracking-tight">My Properties</h2>
          <p className="text-sm text-primary/60 max-w-xl">Manage your listing catalog, publish updates, and track performance.</p>
        </div>
        <Button className="h-12 px-8 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-xl shadow-primary/30" asChild>
          <Link href="/partner/listings/create">
            <Plus className="h-4 w-4" /> Add New Escape
          </Link>
        </Button>
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[420px] rounded-[3rem] border border-white/70 bg-white/70 p-12 text-center shadow-[0_30px_60px_-45px_rgba(12,24,18,0.45)]">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 text-primary/40">
            <Tent size={40} />
          </div>
          <p className="text-primary/60 font-black uppercase tracking-[0.3em] mb-6">No listings yet</p>
          <Button variant="outline" className="rounded-full" asChild>
            <Link href="/partner/listings/create">List Your First Property</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-8">
          {listings.map((glamping: any) => (
            <div key={glamping.id} className="group relative">
              <div className="absolute inset-0 bg-primary/5 rounded-[3rem] -rotate-1 group-hover:rotate-0 transition-transform duration-500" />
              <div className="relative rounded-[3rem] border border-white/70 bg-white/75 overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-500">
                <div className="flex flex-col xl:flex-row">
                  <div className="relative w-full xl:w-[340px] h-64 xl:h-auto bg-gray-100 overflow-hidden">
                    <Image 
                      src={resolveImage(
                        glamping.thumbnail ||
                        glamping.thumbnail_url ||
                        glamping.glamping_images?.find((img: any) => img.is_thumbnail)?.path ||
                        glamping.glamping_images?.[0]?.path ||
                        glamping.images?.[0]
                      )} 
                      alt={glamping.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 text-primary font-black uppercase tracking-widest text-[10px] rounded-full border-none shadow-sm">
                        {glamping.status || 'Pending'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex-1 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div>
                          <h3 className="font-display text-2xl text-primary tracking-tight mb-2">{glamping.name}</h3>
                          <div className="flex items-center gap-2 text-primary/50 font-bold text-sm uppercase tracking-wider">
                            <MapPin size={14} />
                            {glamping.address}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="luxury" size="icon" className="rounded-xl h-10 w-10" asChild>
                            <Link href={`/glamping/${glamping.slug}`} target="_blank">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="luxury" size="icon" className="rounded-xl h-10 w-10" asChild>
                            <Link href={`/partner/listings/${glamping.id}/edit`}>
                              <Edit2 className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="luxury" size="icon" className="rounded-xl h-10 w-10 text-red-600 hover:text-red-700" onClick={() => handleDelete(glamping.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-8 flex flex-wrap gap-4 sm:gap-6">
                        <div className="bg-white/60 p-4 rounded-2xl border border-white/70 min-w-[110px]">
                          <p className="text-[10px] font-black uppercase text-primary/30 tracking-[0.2em] mb-1">Units</p>
                          <p className="text-xl font-black text-primary">{glamping.units?.length || 0}</p>
                        </div>
                        <div className="bg-white/60 p-4 rounded-2xl border border-white/70 min-w-[110px]">
                          <p className="text-[10px] font-black uppercase text-primary/30 tracking-[0.2em] mb-1">Bookings</p>
                          <p className="text-xl font-black text-primary">24</p>
                        </div>
                        <div className="bg-accent/15 p-4 rounded-2xl border border-accent/20 min-w-[110px]">
                          <p className="text-[10px] font-black uppercase text-accent tracking-[0.2em] mb-1">Rating</p>
                          <p className="text-xl font-black text-primary">★ {glamping.rating || '5.0'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Button variant="default" className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-xs" asChild>
                        <Link href={`/partner/listings/${glamping.id}`}>
                          Manage Sanctuaries
                        </Link>
                      </Button>
                      <Button variant="outline" className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-xs">
                        View Reports
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
