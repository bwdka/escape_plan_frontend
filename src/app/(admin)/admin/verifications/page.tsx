'use client';

import { useAdminUsers, useAdminVerifyUser, useAdminGlampings, useAdminUpdateGlampingStatus } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Check, X, Shield, Tent } from "lucide-react";

export default function VerificationsPage() {
    const { data: pendingUsers } = useAdminUsers({ role: 'partner', is_verified: false });
    const { data: pendingGlampings } = useAdminGlampings({ status: 'pending' });

    const verifyUser = useAdminVerifyUser();
    const updateGlampingStatus = useAdminUpdateGlampingStatus();

    const handleUserVerify = (id: number, verify: boolean) => {
        verifyUser.mutate({ id, is_verified: verify }, {
            onSuccess: () => toast.success(verify ? "Partner verified" : "Partner rejected"),
        });
    };

    const handleGlampingVerify = (id: number, status: string) => {
        updateGlampingStatus.mutate({ id, status }, {
            onSuccess: () => toast.success(`Glamping ${status}`),
        });
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col gap-2 reveal-up">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Compliance</p>
                <h1 className="font-display text-3xl text-slate-900 tracking-tight">Verification Queue</h1>
                <p className="text-sm text-slate-600">Approve new partners and listings with confidence.</p>
            </div>

            <Tabs defaultValue="partners" className="space-y-8">
                <TabsList className="bg-white/70 p-1 rounded-2xl border border-white/70 flex flex-wrap">
                    <TabsTrigger value="partners" className="rounded-xl px-8 py-3 font-black text-[10px] uppercase tracking-[0.25em] data-[state=active]:bg-slate-900 data-[state=active]:text-white">Pending Partners</TabsTrigger>
                    <TabsTrigger value="glampings" className="rounded-xl px-8 py-3 font-black text-[10px] uppercase tracking-[0.25em] data-[state=active]:bg-slate-900 data-[state=active]:text-white">Glamping Approvals</TabsTrigger>
                </TabsList>

                <TabsContent value="partners">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pendingUsers?.data.length === 0 ? (
                            <div className="col-span-full rounded-[3rem] border border-white/70 bg-white/70 p-20 text-center shadow-xl reveal-up reveal-delay-1">
                                <p className="text-slate-500 font-black uppercase tracking-[0.3em]">All clear in partner queue</p>
                            </div>
                        ) : (
                            pendingUsers?.data.map((user: any) => (
                                <div key={user.id} className="rounded-[2.5rem] border border-white/70 bg-white/80 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 reveal-up reveal-delay-1">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 rounded-3xl bg-slate-900/10 flex items-center justify-center font-black text-xl text-slate-900">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-xl text-slate-900 tracking-tight">{user.name}</p>
                                            <p className="text-sm font-bold text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex w-full sm:w-auto flex-row sm:flex-col gap-2 sm:items-end">
                                        <Button 
                                            size="sm" 
                                            className="bg-slate-900 text-white rounded-xl"
                                            onClick={() => handleUserVerify(user.id, true)}
                                        >
                                            <Check className="w-4 h-4 mr-2" /> Approve
                                        </Button>
                                        <Button size="sm" variant="ghost" className="text-red-600 font-bold rounded-xl">
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="glampings">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pendingGlampings?.data.length === 0 ? (
                            <div className="col-span-full rounded-[3rem] border border-white/70 bg-white/70 p-20 text-center shadow-xl reveal-up reveal-delay-1">
                                <p className="text-slate-500 font-black uppercase tracking-[0.3em]">No listings pending review</p>
                            </div>
                        ) : (
                            pendingGlampings?.data.map((glamping: any) => (
                                <div key={glamping.id} className="rounded-[2.5rem] border border-white/70 bg-white/80 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 reveal-up reveal-delay-1">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 rounded-3xl bg-slate-900/10 flex items-center justify-center">
                                            <Tent className="w-8 h-8 text-slate-900" />
                                        </div>
                                        <div>
                                            <p className="font-black text-xl text-slate-900 tracking-tight line-clamp-1">{glamping.name}</p>
                                            <p className="text-sm font-bold text-accent">By {glamping.partner?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex w-full sm:w-auto flex-row sm:flex-col gap-2 sm:items-end">
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            className="border-slate-900/20 rounded-xl"
                                            onClick={() => handleGlampingVerify(glamping.id, 'active')}
                                        >
                                            Approve
                                        </Button>
                                        <Button size="sm" variant="ghost" className="text-red-600 font-bold rounded-xl">
                                            Review
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
