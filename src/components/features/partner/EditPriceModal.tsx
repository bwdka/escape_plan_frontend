'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const useUpdateDatePrice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ unit_id, date, price }: { unit_id: number; date: string; price: number }) => {
      const { data } = await api.post('/partner/pricing/update', { unit_id, date, price });
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
  const { mutate: updatePrice, isPending } = useUpdateDatePrice();

  const handleUpdate = () => {
    updatePrice({ unit_id: unitId, date, price: Number(price) }, {
      onSuccess: () => {
        toast.success("Price updated");
        onClose();
      },
      onError: (err: any) => toast.error(err.response?.data?.message || "Failed")
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Price for {date}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Label>New Price (IDR)</Label>
          <Input 
            type="number" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
            placeholder="Enter amount"
          />
        </div>
        <DialogFooter>
          <Button onClick={handleUpdate} disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Price'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
