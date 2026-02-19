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
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-primary tracking-tighter">Verification Queue</h1>
                <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">Approve new partners and listings</p>
            </div>

            <Tabs defaultValue="partners" className="space-y-8">
                <TabsList className="bg-primary/5 p-1 rounded-2xl border border-primary/5">
                    <TabsTrigger value="partners" className="rounded-xl px-8 py-3 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Pending Partners</TabsTrigger>
                    <TabsTrigger value="glampings" className="rounded-xl px-8 py-3 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Glamping Approvals</TabsTrigger>
                </TabsList>

                <TabsContent value="partners">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pendingUsers?.data.length === 0 ? (
                            <div className="col-span-full glass p-20 rounded-[3rem] text-center">
                                <p className="text-primary/30 font-black uppercase tracking-widest">All clear in partner queue</p>
                            </div>
                        ) : (
                            pendingUsers?.data.map((user: any) => (
                                <div key={user.id} className="glass p-8 rounded-[2.5rem] border-white/40 flex items-center justify-between group hover:bg-white/60 transition-all duration-500">
                                    <div className="flex items-center gap-6">
                                        <div className="h-16 w-16 rounded-3xl bg-accent/10 flex items-center justify-center font-black text-xl text-accent">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-xl text-primary tracking-tight">{user.name}</p>
                                            <p className="text-sm font-bold text-primary/40">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Button 
                                            size="sm" 
                                            className="bg-primary text-primary-foreground rounded-xl"
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
                            <div className="col-span-full glass p-20 rounded-[3rem] text-center">
                                <p className="text-primary/30 font-black uppercase tracking-widest">No listings pending review</p>
                            </div>
                        ) : (
                            pendingGlampings?.data.map((glamping: any) => (
                                <div key={glamping.id} className="glass p-8 rounded-[2.5rem] border-white/40 flex items-center justify-between group hover:bg-white/60 transition-all duration-500">
                                    <div className="flex items-center gap-6">
                                        <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center">
                                            <Tent className="w-8 h-8 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-black text-xl text-primary tracking-tight line-clamp-1">{glamping.name}</p>
                                            <p className="text-sm font-bold text-accent">By {glamping.partner?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            className="border-primary/20 rounded-xl"
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
