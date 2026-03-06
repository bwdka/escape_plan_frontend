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
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-yellow-600 rotate-45" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Account Verification Pending</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
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

  return (
    <div className="space-y-10">
        <div className="flex justify-between items-center">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black text-primary tracking-tighter">My Properties</h2>
                <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">Manage your listing catalog</p>
            </div>
            <Button className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-xl shadow-primary/20" asChild>
                <Link href="/partner/listings/create">
                    <Plus className="h-4 w-4 mr-2" /> Add New Escape
                </Link>
            </Button>
        </div>

        {listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] glass rounded-[3rem] border-white/40 p-12 text-center">
                <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mb-6 text-primary/20">
                    <Tent size={40} />
                </div>
                <p className="text-primary/40 font-black uppercase tracking-widest mb-6">No listings yet</p>
                <Button variant="outline" className="rounded-full" asChild>
                    <Link href="/partner/listings/create">List Your First Property</Link>
                </Button>
            </div>
        ) : (
            <div className="grid gap-8">
                {listings.map((glamping: any) => (
                    <div key={glamping.id} className="group relative">
                        <div className="absolute inset-0 bg-primary/5 rounded-[3rem] -rotate-1 group-hover:rotate-0 transition-transform duration-500" />
                        <div className="relative glass rounded-[3rem] border-white/40 overflow-hidden group-hover:shadow-2xl transition-all duration-500">
                            <div className="flex flex-col md:flex-row">
                                <div className="relative w-full md:w-72 h-64 md:h-auto bg-gray-100 overflow-hidden">
                                    <Image 
                                        src={glamping.thumbnail || 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=400&q=80'} 
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
                                <div className="flex-1 p-10 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-black text-2xl text-primary tracking-tight mb-2">{glamping.name}</h3>
                                                <div className="flex items-center gap-2 text-primary/40 font-bold text-sm uppercase tracking-wider">
                                                    <MapPin size={14} />
                                                    {glamping.address}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
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

                                        <div className="mt-8 flex gap-8">
                                            <div className="bg-white/40 p-4 rounded-2xl border border-white/40 min-w-[100px]">
                                                <p className="text-[10px] font-black uppercase text-primary/30 tracking-[0.2em] mb-1">Units</p>
                                                <p className="text-xl font-black text-primary">{glamping.units?.length || 0}</p>
                                            </div>
                                            <div className="bg-white/40 p-4 rounded-2xl border border-white/40 min-w-[100px]">
                                                <p className="text-[10px] font-black uppercase text-primary/30 tracking-[0.2em] mb-1">Bookings</p>
                                                <p className="text-xl font-black text-primary">24</p>
                                            </div>
                                            <div className="bg-accent/10 p-4 rounded-2xl border border-accent/10 min-w-[100px]">
                                                <p className="text-[10px] font-black uppercase text-accent tracking-[0.2em] mb-1">Rating</p>
                                                <p className="text-xl font-black text-primary">★ {glamping.rating || '5.0'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 flex gap-4">
                                        <Button variant="default" className="rounded-xl h-12 px-8 font-black uppercase tracking-widest text-xs" asChild>
                                            <Link href={`/partner/listings/${glamping.id}`}>
                                                Manage Sanctuaries
                                            </Link>
                                        </Button>
                                        <Button variant="outline" className="rounded-xl h-12 px-8 font-black uppercase tracking-widest text-xs">
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
