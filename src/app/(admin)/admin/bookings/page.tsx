'use client';

import { useAdminBookings } from "@/hooks/useAdmin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, User, MapPin } from "lucide-react";

export default function AdminBookingsPage() {
    const { data: response, isLoading } = useAdminBookings();
    const bookings = response?.data || [];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Transaction Monitor</h1>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Booking Info</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Customer</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Dates</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Amount</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    [1, 2, 3].map(i => (
                                        <tr key={i}>
                                            <td className="px-6 py-4"><Skeleton className="h-10 w-48" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                                        </tr>
                                    ))
                                ) : (
                                    bookings.map((booking: any) => (
                                        <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-bold text-slate-900">ESC-{booking.id}</p>
                                                    <p className="text-xs text-slate-500">{booking.unit?.glamping?.name || 'Glamping Site'}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-3 h-3 text-slate-400" />
                                                    <span className="text-sm font-medium">{booking.user?.name || 'Guest'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3 h-3" />
                                                    {booking.check_in}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                                Rp {Number(booking.total_price).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={booking.payment_status === 'paid' ? "default" : "outline"}>
                                                    {booking.payment_status}
                                                </Badge>
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
