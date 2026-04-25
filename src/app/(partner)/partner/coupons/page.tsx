'use client';

import { useI18n } from '@/i18n/I18nProvider';
import { Button } from '@/components/ui/button';
import { Ticket, Plus, Trash2, Edit, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useMemo, useState } from 'react';
import { useCreatePartnerCoupon, useDeletePartnerCoupon, usePartnerCoupons, usePartnerListings, useUpdatePartnerCoupon } from '@/hooks/usePartner';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function CouponsPage() {
  const { t } = useI18n();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const [form, setForm] = useState({
    code: '',
    type: 'percentage',
    value: 10,
    min_purchase: 0,
    max_discount: '',
    usage_limit: '',
    start_date: '',
    end_date: '',
    is_active: true,
    glamping_id: '',
  });

  const params = useMemo(() => ({
    q: q || undefined,
    per_page: 50,
  }), [q]);

  const { data: listingsResponse } = usePartnerListings();
  const listings = (listingsResponse as any)?.data || [];

  const { data, isLoading } = usePartnerCoupons(params);
  const coupons = (data?.data || []) as any[];

  const createCoupon = useCreatePartnerCoupon();
  const updateCoupon = useUpdatePartnerCoupon();
  const deleteCoupon = useDeletePartnerCoupon();

  const resetForm = () => {
    setForm({
      code: '',
      type: 'percentage',
      value: 10,
      min_purchase: 0,
      max_discount: '',
      usage_limit: '',
      start_date: '',
      end_date: '',
      is_active: true,
      glamping_id: '',
    });
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (coupon: any) => {
    setEditing(coupon);
    setForm({
      code: coupon.code || '',
      type: coupon.type || 'percentage',
      value: Number(coupon.value || 0),
      min_purchase: Number(coupon.min_purchase || 0),
      max_discount: coupon.max_discount != null ? String(coupon.max_discount) : '',
      usage_limit: coupon.usage_limit != null ? String(coupon.usage_limit) : '',
      start_date: coupon.start_date || '',
      end_date: coupon.end_date || '',
      is_active: Boolean(coupon.is_active),
      glamping_id: coupon.glamping?.id ? String(coupon.glamping.id) : '',
    });
    setOpen(true);
  };

  const submit = async () => {
    const payload: any = {
      code: form.code,
      type: form.type,
      value: Number(form.value),
      min_purchase: Number(form.min_purchase || 0),
      is_active: Boolean(form.is_active),
      glamping_id: form.glamping_id ? Number(form.glamping_id) : null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      max_discount: form.max_discount ? Number(form.max_discount) : null,
    };

    try {
      if (editing?.id) {
        await updateCoupon.mutateAsync({ id: editing.id, payload });
        toast.success(t({ id: 'Promo diperbarui', en: 'Coupon updated' }));
      } else {
        await createCoupon.mutateAsync(payload);
        toast.success(t({ id: 'Promo dibuat', en: 'Coupon created' }));
      }
      setOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t({ id: 'Gagal menyimpan', en: 'Failed to save' }));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            {t({ id: 'Voucher & Promo', en: 'Coupons & Vouchers' })}
          </h1>
          <p className="text-sm text-primary/50 font-bold uppercase tracking-widest mt-1">
            {t({ id: 'Kelola promo khusus untuk listing Anda', en: 'Manage custom promos for your listings' })}
          </p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="rounded-xl font-black uppercase tracking-widest">
              <Plus className="mr-2 h-4 w-4" /> {t({ id: 'Buat Baru', en: 'Create New' })}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-black tracking-tight">
                {editing ? t({ id: 'Edit Promo', en: 'Edit Coupon' }) : t({ id: 'Buat Promo', en: 'Create Coupon' })}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} className="rounded-2xl" placeholder="DISKON10" />
              </div>
              <div className="space-y-2">
                <Label>Scope (Optional)</Label>
                <select
                  value={form.glamping_id}
                  onChange={(e) => setForm((p) => ({ ...p, glamping_id: e.target.value }))}
                  className="h-11 rounded-2xl border border-primary/15 bg-white px-3 text-sm font-bold text-primary"
                >
                  <option value="">{t({ id: 'Semua listing', en: 'All listings' })}</option>
                  {listings.map((g: any) => (
                    <option key={g.id} value={String(g.id)}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                  className="h-11 rounded-2xl border border-primary/15 bg-white px-3 text-sm font-bold text-primary"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input type="number" value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: Number(e.target.value) }))} className="rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label>Min Purchase</Label>
                <Input type="number" value={form.min_purchase} onChange={(e) => setForm((p) => ({ ...p, min_purchase: Number(e.target.value) }))} className="rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label>Max Discount (Optional)</Label>
                <Input value={form.max_discount} onChange={(e) => setForm((p) => ({ ...p, max_discount: e.target.value }))} className="rounded-2xl" placeholder="50000" />
              </div>
              <div className="space-y-2">
                <Label>Usage Limit (Optional)</Label>
                <Input value={form.usage_limit} onChange={(e) => setForm((p) => ({ ...p, usage_limit: e.target.value }))} className="rounded-2xl" placeholder="100" />
              </div>
              <div className="space-y-2">
                <Label>Active</Label>
                <select
                  value={form.is_active ? 'true' : 'false'}
                  onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.value === 'true' }))}
                  className="h-11 rounded-2xl border border-primary/15 bg-white px-3 text-sm font-bold text-primary"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Start Date (Optional)</Label>
                <Input type="date" value={form.start_date} onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))} className="rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Label>End Date (Optional)</Label>
                <Input type="date" value={form.end_date} onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))} className="rounded-2xl" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" className="rounded-2xl" onClick={() => { setOpen(false); resetForm(); }}>
                {t({ id: 'Batal', en: 'Cancel' })}
              </Button>
              <Button className="rounded-2xl font-black uppercase tracking-widest text-[10px]" disabled={createCoupon.isPending || updateCoupon.isPending} onClick={submit}>
                {t({ id: 'Simpan', en: 'Save' })}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-3xl border border-white/40 bg-white/70 p-4 flex items-center gap-3">
        <Search className="h-4 w-4 text-primary/40" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t({ id: 'Cari kode promo…', en: 'Search coupon code…' })} className="rounded-2xl bg-white/80" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && (
          <div className="col-span-full text-sm font-bold text-primary/50">{t({ id: 'Memuat…', en: 'Loading…' })}</div>
        )}
        {!isLoading && coupons.length === 0 && (
          <div className="col-span-full text-sm font-bold text-primary/50">{t({ id: 'Belum ada promo.', en: 'No coupons yet.' })}</div>
        )}
        {coupons.map((coupon) => (
          <div key={coupon.id} className="glass p-6 rounded-3xl border border-white/40 shadow-xl space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-accent/10 rounded-2xl text-accent">
                <Ticket className="w-6 h-6" />
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${coupon.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {coupon.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <p className="text-xs text-primary/40 font-black uppercase tracking-widest">
                {coupon.type === 'fixed' ? 'Fixed' : 'Percentage'}{coupon.glamping?.name ? ` • ${coupon.glamping.name}` : ''}
              </p>
              <h3 className="text-xl font-black text-primary tracking-tight">{coupon.code}</h3>
              <p className="text-lg font-black text-accent">
                {coupon.type === 'fixed'
                  ? `Rp ${Number(coupon.value || 0).toLocaleString('id-ID')}`
                  : `${Number(coupon.value || 0)}%`}
              </p>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-primary/5">
                <p className="text-xs font-bold text-primary/60">{coupon.used_count || 0} {t({ id: 'dipakai', en: 'times used' })}</p>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => openEdit(coupon)}><Edit className="w-4 h-4" /></Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl text-red-500 hover:text-red-600"
                      disabled={deleteCoupon.isPending}
                      onClick={async () => {
                        if (!confirm(`Delete coupon ${coupon.code}?`)) return;
                        try {
                          await deleteCoupon.mutateAsync(coupon.id);
                          toast.success(t({ id: 'Promo dihapus', en: 'Coupon deleted' }));
                        } catch (err: any) {
                          toast.error(err?.response?.data?.message || t({ id: 'Gagal menghapus', en: 'Failed to delete' }));
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
