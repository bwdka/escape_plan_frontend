'use client';

import { useAdminUsers, useAdminVerifyUser } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, UserCheck, UserX, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminUsersPage() {
    const [search, setSearch] = useState("");
    const { data: response, isLoading } = useAdminUsers({ search });
    const verifyUser = useAdminVerifyUser();

    const users = response?.data || [];

    const toggleVerify = (id: number, currentStatus: boolean) => {
        verifyUser.mutate({ id, is_verified: !currentStatus }, {
            onSuccess: () => toast.success("User status updated"),
        });
    };

    return (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 reveal-up">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Directory</p>
              <h1 className="font-display text-3xl text-slate-900 tracking-tight">User Management</h1>
              <p className="text-sm text-slate-600">Search, verify, and manage partner access.</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search users..." 
                className="pl-11 rounded-2xl bg-white/70 border-white/70"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <Card className="rounded-[2.5rem] border-white/70 bg-white/80 shadow-xl reveal-up reveal-delay-1">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/70 border-b border-white/70">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">User</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Role</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Joined</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/70">
                    {isLoading ? (
                      [1, 2, 3, 4, 5].map(i => (
                        <tr key={i}>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-8 w-24" /></td>
                        </tr>
                      ))
                    ) : (
                      users.map((user: any) => (
                        <tr key={user.id} className="hover:bg-white/70 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-2xl bg-slate-900/10 text-slate-900 flex items-center justify-center font-black text-xs shadow-sm">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{user.name}</p>
                                <p className="text-xs text-slate-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 uppercase text-[10px] font-black tracking-[0.2em] text-slate-400">
                            {user.role}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={user.is_verified ? "default" : "secondary"}>
                              {user.is_verified ? "Verified" : "Pending"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            {user.role === 'partner' && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className={`rounded-full border ${user.is_verified ? "border-red-200/70 text-red-600" : "border-emerald-200/70 text-emerald-600"} hover:-translate-y-0.5 transition-all`}
                                onClick={() => toggleVerify(user.id, user.is_verified)}
                              >
                                {user.is_verified ? <UserX className="w-4 h-4 mr-1" /> : <UserCheck className="w-4 h-4 mr-1" />}
                                {user.is_verified ? "Revoke" : "Verify"}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
    );
}
