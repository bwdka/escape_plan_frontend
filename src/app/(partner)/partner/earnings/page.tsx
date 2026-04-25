'use client';

import { useMemo, useState } from 'react';
import { useI18n } from '@/i18n/I18nProvider';
import { usePartnerWallet, useRequestWithdrawal } from '@/hooks/usePartner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function PartnerEarningsPage() {
  const { t } = useI18n();
  const { data, isLoading } = usePartnerWallet();
  const requestWithdrawal = useRequestWithdrawal();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const wallet = data?.data;
  const transactions = data?.transactions?.data || [];

  const formatted = useMemo(() => {
    const balance = Number(wallet?.balance || 0);
    const pending = Number(wallet?.pending_withdrawals || 0);
    const available = Number(wallet?.available_balance || 0);
    return { balance, pending, available };
  }, [wallet]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50">Financials</p>
        <h2 className="font-display text-3xl sm:text-4xl text-primary tracking-tight">
          {t({ id: 'Pendapatan', en: 'Earnings' })}
        </h2>
        <p className="text-sm text-primary/60">
          {t({ id: 'Pantau saldo, transaksi, dan ajukan penarikan.', en: 'Track balance, transactions, and request withdrawals.' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-[2rem] border-white/70 bg-white/80 shadow-xl">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary/60">Balance</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-black text-primary">Rp {formatted.balance.toLocaleString('id-ID')}</div>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-white/70 bg-white/80 shadow-xl">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary/60">Pending</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-black text-primary">Rp {formatted.pending.toLocaleString('id-ID')}</div>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-white/70 bg-white/80 shadow-xl">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary/60">Available</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex items-center justify-between gap-3">
            <div className="text-2xl font-black text-primary">Rp {formatted.available.toLocaleString('id-ID')}</div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-2xl font-black uppercase tracking-widest text-[10px]">
                  {t({ id: 'Tarik Dana', en: 'Withdraw' })}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="font-black tracking-tight">{t({ id: 'Ajukan Penarikan', en: 'Request Withdrawal' })}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="rounded-2xl border border-primary/10 bg-white/70 p-4 text-xs font-bold text-primary/70">
                    <div>{t({ id: 'Tujuan:', en: 'Destination:' })} {wallet?.bank?.bank_name || '-'} • {wallet?.bank?.bank_account_number || '-'}</div>
                    <div>{t({ id: 'Atas nama:', en: 'Beneficiary:' })} {wallet?.bank?.bank_account_holder || '-'}</div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ id: 'Jumlah (Rp)', en: 'Amount (IDR)' })}</Label>
                    <Input value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-2xl" placeholder="100000" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ id: 'Catatan (opsional)', en: 'Note (optional)' })}</Label>
                    <Input value={note} onChange={(e) => setNote(e.target.value)} className="rounded-2xl" placeholder="e.g. Weekly payout" />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" className="rounded-2xl" onClick={() => setOpen(false)}>
                      {t({ id: 'Batal', en: 'Cancel' })}
                    </Button>
                    <Button
                      className="rounded-2xl font-black uppercase tracking-widest text-[10px]"
                      disabled={requestWithdrawal.isPending}
                      onClick={async () => {
                        const parsed = Number(amount);
                        if (!Number.isFinite(parsed) || parsed <= 0) {
                          toast.error(t({ id: 'Jumlah tidak valid', en: 'Invalid amount' }));
                          return;
                        }
                        try {
                          await requestWithdrawal.mutateAsync({ amount: parsed, note: note.trim() || undefined });
                          toast.success(t({ id: 'Penarikan diajukan', en: 'Withdrawal requested' }));
                          setAmount('');
                          setNote('');
                          setOpen(false);
                        } catch (err: any) {
                          toast.error(err?.response?.data?.message || t({ id: 'Gagal mengajukan', en: 'Request failed' }));
                        }
                      }}
                    >
                      {t({ id: 'Ajukan', en: 'Submit' })}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[2rem] border-white/70 bg-white/80 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-primary/5">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-primary/60">
            {t({ id: 'Riwayat Transaksi', en: 'Transactions' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-sm font-bold text-primary/50">{t({ id: 'Memuat…', en: 'Loading…' })}</div>
          ) : transactions.length === 0 ? (
            <div className="p-6 text-sm font-bold text-primary/50">{t({ id: 'Belum ada transaksi.', en: 'No transactions yet.' })}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-primary/5">
                  <tr className="text-left">
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-primary/50">Type</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-primary/50">Amount</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-primary/50">Status</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-primary/50">Booking</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx: any) => (
                    <tr key={tx.id} className="border-t border-primary/5">
                      <td className="px-5 py-3 font-black text-primary">{tx.type}</td>
                      <td className="px-5 py-3 font-black text-primary">Rp {Number(tx.amount || 0).toLocaleString('id-ID')}</td>
                      <td className="px-5 py-3">
                        <Badge variant="outline" className="rounded-full text-[10px] font-black">{tx.status}</Badge>
                      </td>
                      <td className="px-5 py-3 text-xs font-bold text-primary/60">{tx.booking_id ? `ESC-${tx.booking_id}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

