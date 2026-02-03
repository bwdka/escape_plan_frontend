'use client';

import { useState } from 'react';
import { usePartnerCalendar, useBlockDate } from '@/hooks/usePartner';
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

export default function PartnerCalendarPage() {
    // State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedGlampingId, setSelectedGlampingId] = useState<string>("101"); // Mock: In real app, fetch list first
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    
    // Hooks
    const { data: calendarData, isLoading } = usePartnerCalendar(
        Number(selectedGlampingId), 
        currentDate.getMonth() + 1, 
        currentDate.getFullYear()
    );
    const { mutate: blockDate, isPending: isBlocking } = useBlockDate();

    // Calendar Grid Logic
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Block Date Form Logic
    const handleBlockDate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        blockDate({
            unit_id: 5, // Mock: User should select unit
            start_date: formData.get('start_date') as string,
            end_date: formData.get('end_date') as string,
            reason: formData.get('reason') as string,
        }, {
            onSuccess: () => {
                toast.success("Date blocked successfully");
                setIsBlockModalOpen(false);
            },
            onError: () => toast.error("Failed to block date")
        });
    };

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold">Availability Calendar</h2>
                <div className="flex items-center gap-2">
                    <Select value={selectedGlampingId} onValueChange={setSelectedGlampingId}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select Property" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="101">Escape Bogor Riverside</SelectItem>
                            <SelectItem value="102">Mountain Dome Puncak</SelectItem>
                        </SelectContent>
                    </Select>
                    
                    <Dialog open={isBlockModalOpen} onOpenChange={setIsBlockModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Lock className="w-4 h-4" /> Block Dates
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Block Dates</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleBlockDate} className="space-y-4">
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

            <Card>
                <CardHeader className="flex flex-row items-center justify-between py-4">
                    <div className="font-semibold text-lg">
                        {format(currentDate, 'MMMM yyyy')}
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="w-4 h-4" /></Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
                    ) : (
                        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                             {/* Days Header */}
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div key={day} className="bg-gray-50 p-2 text-center text-xs font-medium text-gray-500">
                                    {day}
                                </div>
                            ))}
                            
                            {/* Calendar Days */}
                            {daysInMonth.map((day, idx) => {
                                // Find data for this day from API response
                                const dayStr = format(day, 'yyyy-MM-dd');
                                const dayData = calendarData?.find(d => d.date === dayStr);
                                
                                return (
                                    <div key={dayStr} className="min-h-[100px] bg-white p-2 flex flex-col gap-1 hover:bg-gray-50 transition-colors">
                                        <div className={`text-sm font-medium ${!isSameMonth(day, currentDate) ? 'text-gray-300' : 'text-gray-900'}`}>
                                            {format(day, 'd')}
                                        </div>
                                        
                                        {dayData ? (
                                            <div className="space-y-1">
                                                {dayData.status === 'fully_booked' && <Badge variant="destructive" className="text-[10px] w-full justify-center">Full</Badge>}
                                                {dayData.status === 'blocked' && <Badge variant="secondary" className="text-[10px] w-full justify-center">Blocked</Badge>}
                                                {dayData.details?.map((unit, uIdx) => (
                                                    <div key={uIdx} className="text-[10px] bg-blue-50 text-blue-700 p-1 rounded truncate">
                                                        {unit.unit_name}: {unit.stock_left} left
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            // Fallback/Empty state if no data returned for this day
                                            <div className="h-full flex items-center justify-center">
                                                <span className="text-[10px] text-gray-300">-</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
