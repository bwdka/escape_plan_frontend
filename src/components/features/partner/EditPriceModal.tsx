'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const useUpdateDatePrice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: {
        unit_id: number;
        price: number;
        scope: 'single' | 'range' | 'all';
        date?: string;
        start_date?: string;
        end_date?: string;
      }
    ) => {
      const { data } = await api.post('/partner/pricing/update', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-calendar'] });
    },
  });
};

export function EditPriceModal({ 
  isOpen, 
  onClose, 
  unitId, 
  date, 
  currentPrice 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  unitId: number; 
  date: string;
  currentPrice?: number;
}) {
  const [price, setPrice] = useState(currentPrice?.toString() || '');
  const [scope, setScope] = useState<'single' | 'range' | 'all'>('single');
  const [startDate, setStartDate] = useState(date);
  const [endDate, setEndDate] = useState(date);
  const { mutate: updatePrice, isPending } = useUpdateDatePrice();

  const handleUpdate = () => {
    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      toast.error('Masukkan harga yang valid');
      return;
    }

    if (scope === 'range' && (!startDate || !endDate)) {
      toast.error('Pilih tanggal mulai dan selesai');
      return;
    }

    updatePrice({
      unit_id: unitId,
      price: numericPrice,
      scope,
      date: scope === 'single' ? date : undefined,
      start_date: scope === 'range' ? startDate : undefined,
      end_date: scope === 'range' ? endDate : undefined,
    }, {
      onSuccess: () => {
        toast.success("Price updated");
        onClose();
      },
      onError: (err: unknown) => {
        const error = err as AxiosError<{ message?: string }>;
        toast.error(error.response?.data?.message || 'Failed');
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle>Update Price</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'single', label: 'Tanggal ini' },
              { key: 'range', label: 'Rentang tanggal' },
              { key: 'all', label: 'Semua tanggal' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setScope(item.key as typeof scope)}
                className={`rounded-2xl border px-3 py-2 text-xs font-black uppercase tracking-widest transition-all ${
                  scope === item.key
                    ? 'border-primary bg-primary text-white'
                    : 'border-primary/10 bg-white text-primary/50 hover:border-primary/20'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label>New Price (IDR)</Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter amount"
            />
          </div>

          {scope === 'single' && (
            <div className="rounded-2xl bg-primary/5 p-4 text-sm font-bold text-primary">
              Applies to <span className="font-black">{date}</span>
            </div>
          )}

          {scope === 'range' && (
            <div className="space-y-3">
              <div className="rounded-2xl bg-primary/5 p-3 text-xs font-bold text-primary/70">
                Tanggal akhir tidak dihitung. Contoh: 21 - 22 hanya berlaku untuk tanggal 21.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {scope === 'all' && (
            <div className="rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-900">
              This will update the unit base price for all dates.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleUpdate} disabled={isPending} className="rounded-2xl">
            {isPending ? 'Saving...' : 'Save Price'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
