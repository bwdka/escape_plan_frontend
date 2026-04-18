'use client';

import { useMemo, useState } from 'react';
import { useAdminApproveWithdrawal, useAdminRejectWithdrawal, useAdminWithdrawals } from '@/hooks/useAdmin';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

type WithdrawalRow = {
  id: number;
  partner_name?: string;
  bank_details?: string;
  amount?: number;
  status?: string;
  requested_at?: string;
};

export default function AdminWithdrawalsPage() {
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);

  const params = useMemo(() => ({ status, page }), [status, page]);
  const { data: response, isLoading } = useAdminWithdrawals(params);
  const approve = useAdminApproveWithdrawal();
  const reject = useAdminRejectWithdrawal();

  const rows = (response?.data || []) as WithdrawalRow[];

  const onApprove = (id: number) => {
    const note = window.prompt('Note (optional):', '') || undefined;
    const proof_image_path = window.prompt('Proof image path (optional):', '') || undefined;
    approve.mutate({ id, note, proof_image_path }, {
      onSuccess: () => toast.success('Withdrawal approved'),
      onError: (err: unknown) => {
        const error = err as AxiosError<{ message?: string }>;
        toast.error(error.response?.data?.message || 'Failed to approve');
      },
    });
  };

  const onReject = (id: number) => {
    const note = window.prompt('Reject reason (optional):', '') || undefined;
    reject.mutate({ id, note }, {
      onSuccess: () => toast.success('Withdrawal rejected'),
      onError: (err: unknown) => {
        const error = err as AxiosError<{ message?: string }>;
        toast.error(error.response?.data?.message || 'Failed to reject');
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Finance Ops</p>
          <h1 className="font-display text-3xl text-slate-900 tracking-tight">Withdrawals</h1>
          <p className="text-sm text-slate-600">Review and process partner withdrawal requests.</p>
        </div>

        <div className="flex gap-2">
          {['pending', 'completed', 'failed'].map((s) => (
            <Button
              key={s}
              type="button"
              size="sm"
              variant={status === s ? 'default' : 'outline'}
              className="rounded-xl text-[10px] font-black uppercase"
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      <Card className="rounded-[2.5rem] border-white/70 bg-white/80 shadow-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/70 border-b border-white/70">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Partner</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Bank</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Requested</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/70">
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-8 w-24" /></td>
                    </tr>
                  ))
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-semibold">
                      No withdrawal requests.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="hover:bg-white/70 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">{row.partner_name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{row.bank_details || '-'}</td>
                      <td className="px-6 py-4 font-black text-slate-900">Rp {Number(row.amount || 0).toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{row.requested_at || '-'}</td>
                      <td className="px-6 py-4">
                        <Badge variant={row.status === 'completed' ? 'default' : row.status === 'failed' ? 'destructive' : 'outline'}>
                          {row.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="rounded-xl"
                            disabled={approve.isPending || row.status !== 'pending'}
                            onClick={() => onApprove(row.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="rounded-xl"
                            disabled={reject.isPending || row.status !== 'pending'}
                            onClick={() => onReject(row.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-white/70 flex items-center justify-between">
            <div className="text-xs font-bold text-slate-500">Total: {response?.total || 0}</div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl"
                disabled={(response?.current_page || 1) <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <span className="text-xs font-bold text-slate-500">
                Page {response?.current_page || 1} / {response?.last_page || 1}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl"
                disabled={(response?.current_page || 1) >= (response?.last_page || 1)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
