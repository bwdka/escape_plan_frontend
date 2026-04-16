'use client';

import { useState, useEffect } from 'react';
import { usePartnerCalendar, useBlockDate, usePartnerListings, usePartnerUnits } from '@/hooks/usePartner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    
    useEffect(() => {
        if (!selectedGlampingId && glampings.length > 0) {
            setSelectedGlampingId(glampings[0].id.toString());
        }
    }, [glampings, selectedGlampingId]);

    const { data: units } = usePartnerUnits(Number(selectedGlampingId));
    const [selectedUnitId, setSelectedUnitId] = useState<string>("");
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [editPriceData, setEditPriceData] = useState<{unitId: number, date: string} | null>(null);
    
    const { data: calendarData, isLoading, refetch } = usePartnerCalendar(
        Number(selectedGlampingId), 
        currentDate.getMonth() + 1, 
        currentDate.getFullYear()
    );
    const { mutate: blockDate, isPending: isBlocking } = useBlockDate();

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50">Availability</p>
              <h2 className="font-display text-3xl text-primary tracking-tight">Calendar Control</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select value={selectedGlampingId} onValueChange={setSelectedGlampingId}>
                <SelectTrigger className="w-[220px] rounded-2xl border-white/60 bg-white/70">
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

          <Card className="rounded-[2.5rem] border-white/70 bg-white/75 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between py-5">
              <div className="font-display text-xl text-primary">
                {format(currentDate, 'MMMM yyyy')}
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
                  <div className="min-w-[700px] grid grid-cols-7 gap-px bg-white/40 border border-white/60 rounded-2xl overflow-hidden">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="bg-white/70 p-2 text-center text-[10px] font-black uppercase tracking-[0.3em] text-primary/50">
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
                        <div key={dayStr} className="min-h-[110px] bg-white/80 p-2 flex flex-col gap-1 hover:bg-white transition-colors">
                          <div className={`text-sm font-semibold ${!isSameMonth(day, currentDate) ? 'text-primary/25' : 'text-primary'}`}>
                            {format(day, 'd')}
                          </div>
                          
                          {dayData ? (
                            <div className="space-y-1">
                              {dayData.status === 'fully_booked' && <Badge variant="destructive" className="text-[10px] w-full justify-center">Full</Badge>}
                              {(dayData.status === 'blocked' || hasBlocked) && <Badge variant="secondary" className="text-[10px] w-full justify-center">Blocked</Badge>}
                              {dayData.details?.map((unit: any, uIdx: number) => {
                                const unitInfo = units?.find((u: any) => u.title === unit.unit_name);
                                return (
                                    <button 
                                        key={uIdx} 
                                        onClick={() => setEditPriceData({unitId: unitInfo?.id, date: dayStr})}
                                        className="w-full text-left text-[10px] bg-blue-50 text-blue-700 p-1.5 rounded truncate hover:bg-blue-100 flex flex-col"
                                    >
                                      <span className="font-bold">{unit.unit_name}</span>
                                      <span className="opacity-80">Rp {Number(unit.price || 0).toLocaleString('id-ID')}</span>
                                      <span className="opacity-60">{unit.stock_left} left</span>
                                    </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center">
                              <span className="text-[10px] text-primary/30">-</span>
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
              />
          )}
        </div>
    );
}
