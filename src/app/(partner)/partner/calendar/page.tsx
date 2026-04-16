'use client';

import { useState } from 'react';
import { usePartnerCalendar, useBlockDate, usePartnerListings, usePartnerUnits } from '@/hooks/usePartner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { EditPriceModal } from '@/components/features/partner/EditPriceModal';

export default function PartnerCalendarPage() {
    const { data: listingsResponse } = usePartnerListings();
    const glampings = (listingsResponse as any)?.data || [];

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedGlampingId, setSelectedGlampingId] = useState<string>("");
    const effectiveGlampingId = selectedGlampingId || glampings[0]?.id?.toString() || "";

    const { data: units } = usePartnerUnits(Number(effectiveGlampingId));
    const [selectedUnitId, setSelectedUnitId] = useState<string>("");
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [editPriceData, setEditPriceData] = useState<{unitId: number, date: string} | null>(null);
    
    const { data: calendarData, isLoading, refetch } = usePartnerCalendar(
        Number(effectiveGlampingId), 
        currentDate.getMonth() + 1, 
        currentDate.getFullYear()
    );
    const { mutate: blockDate, isPending: isBlocking } = useBlockDate();

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const activeGlamping = glampings.find((g: any) => g.id.toString() === effectiveGlampingId);

    const handleBlockDate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        if (!selectedUnitId) {
            toast.error("Please select a unit");
            return;
        }

        blockDate({
            unit_id: Number(selectedUnitId),
            start_date: formData.get('start_date') as string,
            end_date: formData.get('end_date') as string,
            reason: formData.get('reason') as string,
        }, {
            onSuccess: () => {
                toast.success("Date blocked successfully");
                setIsBlockModalOpen(false);
                refetch();
            },
            onError: (err: any) => toast.error(err.response?.data?.message || "Failed to block date")
        });
    };

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    return (
        <div className="space-y-6">
          <div className="rounded-[2.5rem] border border-white/70 bg-white/75 shadow-xl p-5 md:p-6">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/45">Availability</p>
                <h2 className="font-display text-3xl md:text-4xl text-primary tracking-tight">Calendar Control</h2>
                <p className="text-sm font-medium text-primary/50 max-w-2xl">
                  Klik tanggal untuk edit harga, pilih range atau all dates di modal, dan pakai block dates hanya saat perlu.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Select value={selectedGlampingId || effectiveGlampingId} onValueChange={setSelectedGlampingId}>
                  <SelectTrigger className="w-[240px] rounded-2xl border-white/60 bg-white/80">
                    <SelectValue placeholder="Select Property" />
                  </SelectTrigger>
                  <SelectContent>
                    {glampings.map((g: any) => (
                      <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Dialog open={isBlockModalOpen} onOpenChange={setIsBlockModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2 rounded-2xl" disabled={!selectedGlampingId}>
                      <Lock className="w-4 h-4" /> Block Dates
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-3xl">
                    <DialogHeader>
                      <DialogTitle>Block Dates</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleBlockDate} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Select Unit</Label>
                        <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
                          <SelectTrigger className="rounded-2xl">
                            <SelectValue placeholder="Which unit?" />
                          </SelectTrigger>
                          <SelectContent>
                            {units?.map((u: any) => (
                              <SelectItem key={u.id} value={u.id.toString()}>{u.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input name="start_date" type="date" required />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input name="end_date" type="date" required />
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-primary/55">
                        Tanggal akhir tidak ikut diblok. Contoh: 21 - 22 hanya memblok tanggal 21.
                      </p>
                      <div className="space-y-2">
                        <Label>Reason</Label>
                        <Textarea name="reason" placeholder="Maintenance, Family Event..." required />
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={isBlocking}>
                          {isBlocking ? 'Blocking...' : 'Confirm Block'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-primary/5 p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.35em] text-primary/40">Selected property</div>
                <div className="mt-1 text-lg font-black text-primary">{activeGlamping?.name || 'No property selected'}</div>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-700/60">Quick tip</div>
                <div className="mt-1 text-sm font-bold text-emerald-900">Klik harga di tanggal mana pun untuk edit single, range, atau all dates.</div>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.35em] text-amber-700/60">Legend</div>
                <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest text-amber-900">
                  <span className="rounded-full bg-white/80 px-3 py-1">Full</span>
                  <span className="rounded-full bg-white/80 px-3 py-1">Blocked</span>
                  <span className="rounded-full bg-white/80 px-3 py-1">Price override</span>
                </div>
              </div>
            </div>
          </div>

          <Card className="rounded-[2.5rem] border-white/70 bg-white/82 shadow-xl backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between py-5 border-b border-primary/5">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Month</div>
                <div className="font-display text-xl md:text-2xl text-primary">{format(currentDate, 'MMMM yyyy')}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={prevMonth} className="rounded-full border border-primary/10 bg-white/70">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={nextMonth} className="rounded-full border border-primary/10 bg-white/70">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[760px] grid grid-cols-7 gap-px bg-primary/5 border border-white/60 rounded-[1.75rem] overflow-hidden">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="bg-white/85 p-3 text-center text-[10px] font-black uppercase tracking-[0.3em] text-primary/50">
                        {day}
                      </div>
                    ))}
                    
                    {daysInMonth.map((day) => {
                      const dayStr = format(day, 'yyyy-MM-dd');
                      const dayData = calendarData?.find(d => {
                        if (!d?.date) return false;
                        try {
                          return isSameDay(parseISO(d.date), day);
                        } catch {
                          return d.date === dayStr;
                        }
                      });
                      const hasBlocked = !!dayData?.details?.some((unit: any) =>
                        (unit.bookings || []).some((b: any) => b?.guest_name === 'Blocked' || b?.source === 'Owner')
                      );
                      
                      return (
                        <div key={dayStr} className="min-h-[128px] bg-white/85 p-2.5 flex flex-col gap-2 hover:bg-white transition-colors">
                          <div className="flex items-center justify-between">
                            <div className={`text-sm font-black ${!isSameMonth(day, currentDate) ? 'text-primary/25' : 'text-primary'}`}>
                            {format(day, 'd')}
                            </div>
                            {dayData && (
                              <Badge variant="outline" className="rounded-full text-[9px] font-black uppercase tracking-widest">
                                {dayData.status}
                              </Badge>
                            )}
                          </div>
                          
                          {dayData ? (
                            <div className="space-y-1.5">
                              {dayData.status === 'fully_booked' && <Badge variant="destructive" className="text-[10px] w-full justify-center rounded-full">Full</Badge>}
                              {(dayData.status === 'blocked' || hasBlocked) && <Badge variant="secondary" className="text-[10px] w-full justify-center rounded-full">Blocked</Badge>}
                              {dayData.details?.map((unit: any, uIdx: number) => {
                                const unitInfo = units?.find((u: any) => u.title === unit.unit_name);
                                return (
                                    <button 
                                        key={uIdx} 
                                        onClick={() => unitInfo?.id && setEditPriceData({unitId: unitInfo.id, date: dayStr})}
                                        className="w-full text-left text-[10px] bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 p-2 rounded-2xl hover:shadow-sm hover:from-blue-100 hover:to-indigo-100 flex flex-col gap-0.5 border border-blue-100/70"
                                    >
                                      <span className="font-black truncate">{unit.unit_name}</span>
                                      <span className="text-[11px] font-black text-blue-700">Rp {Number(unit.price || 0).toLocaleString('id-ID')}</span>
                                      <span className="opacity-60">{unit.stock_left} left</span>
                                    </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center rounded-2xl border border-dashed border-primary/10 bg-white/50">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/25">No data</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {editPriceData && (
              <EditPriceModal 
                isOpen={!!editPriceData} 
                onClose={() => {setEditPriceData(null); refetch()}}
                unitId={editPriceData.unitId}
                date={editPriceData.date}
                currentPrice={calendarData?.find((d: any) => d.date === editPriceData.date)?.details?.find((u: any) => u.unit_name === units?.find((unit: any) => unit.id === editPriceData.unitId)?.title)?.price}
              />
          )}
        </div>
    );
}
