'use client';

import { GlampingForm } from "@/components/features/partner/GlampingForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateGlampingPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full border border-primary/10 bg-white/70">
          <Link href="/partner/listings">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50">New Listing</p>
          <h2 className="font-display text-3xl text-primary tracking-tight">Add New Glamping</h2>
          <p className="text-sm text-primary/60">List your property on Escape Plan</p>
        </div>
      </div>

      <GlampingForm />
    </div>
  );
}
