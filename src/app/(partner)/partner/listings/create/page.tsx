'use client';

import { GlampingForm } from "@/components/features/partner/GlampingForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateGlampingPage() {
  return (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/partner/listings">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
            </Button>
            <div>
                <h2 className="text-2xl font-bold">Add New Glamping</h2>
                <p className="text-sm text-gray-500">List your property on Escape Plan</p>
            </div>
        </div>

        <GlampingForm />
    </div>
  );
}
