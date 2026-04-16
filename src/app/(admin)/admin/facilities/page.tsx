'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MinusCircle, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AMENITY_ICON_FALLBACK, AMENITY_ICON_KEYS, AMENITY_ICON_MAP } from '@/lib/amenities';
import { useAdminCreateFacility, useAdminDeleteFacility, useAdminFacilities, useAdminUpdateFacility } from '@/hooks/useAdmin';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type Draft = {
  name: string;
  icon: string;
  iconCustom?: string;
};

type IconPickerProps = {
  value: string;
  onChange: (value: string) => void;
  customValue?: string;
  onCustomChange?: (value: string) => void;
};

function IconPicker({ value, onChange, customValue, onCustomChange }: IconPickerProps) {
  const SelectedIcon = AMENITY_ICON_MAP[value] || (value === 'custom' ? Pencil : value === 'none' ? MinusCircle : AMENITY_ICON_FALLBACK);
  const label =
    value === 'none' ? 'None' : value === 'custom' ? (customValue || 'Custom') : value;
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-3">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-2.5 flex items-center gap-3 hover:border-accent/50 transition-colors"
          >
            <span className="h-9 w-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
              <SelectedIcon className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-primary/70 truncate">{label}</span>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Pick an Icon</DialogTitle>
            <DialogDescription>Select an icon for this facility.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
              <button
                type="button"
                onClick={() => {
                  onChange('none');
                  setOpen(false);
                }}
                className={`h-10 w-10 rounded-xl border ${value === 'none' ? 'border-accent bg-accent/10' : 'border-white/70 bg-white/70'} flex items-center justify-center`}
                title="None"
              >
                <MinusCircle className="h-4 w-4" />
              </button>
              {AMENITY_ICON_KEYS.map((key) => {
                const Icon = AMENITY_ICON_MAP[key] || AMENITY_ICON_FALLBACK;
                const isActive = value === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      onChange(key);
                      setOpen(false);
                    }}
                    className={`h-10 w-10 rounded-xl border ${isActive ? 'border-accent bg-accent/10' : 'border-white/70 bg-white/70'} flex items-center justify-center`}
                    title={key}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => onChange('custom')}
                className={`h-10 w-10 rounded-xl border ${value === 'custom' ? 'border-accent bg-accent/10' : 'border-white/70 bg-white/70'} flex items-center justify-center`}
                title="Custom"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
            {value === 'custom' && (
              <Input
                placeholder="Custom icon key"
                className="rounded-2xl bg-white/70 border-white/70"
                value={customValue || ''}
                onChange={(e) => onCustomChange?.(e.target.value)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminFacilitiesPage() {
  const { data: response, isLoading } = useAdminFacilities();
  const facilities = response?.data || [];
  const createFacility = useAdminCreateFacility();
  const updateFacility = useAdminUpdateFacility();
  const deleteFacility = useAdminDeleteFacility();

  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('none');
  const [newIconCustom, setNewIconCustom] = useState('');

  useEffect(() => {
    if (!facilities.length) return;
    setDrafts((current) => {
      const next = { ...current };
      facilities.forEach((facility: any) => {
        if (!next[facility.id]) {
          const rawIcon = facility.icon || '';
          const iconKey = rawIcon && AMENITY_ICON_KEYS.includes(rawIcon) ? rawIcon : (rawIcon ? 'custom' : 'none');
          next[facility.id] = {
            name: facility.name || '',
            icon: iconKey,
            ...(iconKey === 'custom' ? { iconCustom: rawIcon } : {}),
          };
        }
      });
      return next;
    });
  }, [facilities]);

  const iconHint = useMemo(() => AMENITY_ICON_KEYS.join(', '), []);

  const handleCreate = () => {
    if (!newName.trim()) {
      toast.error('Name is required');
      return;
    }
    const iconValue = newIcon === 'custom'
      ? newIconCustom.trim()
      : (newIcon === 'none' ? '' : newIcon.trim());
    createFacility.mutate(
      { name: newName.trim(), icon: iconValue || null },
      {
        onSuccess: () => {
          toast.success('Facility created');
          setNewName('');
          setNewIcon('none');
          setNewIconCustom('');
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to create facility');
        },
      }
    );
  };

  const handleSave = (id: number) => {
    const draft = drafts[id];
    if (!draft?.name?.trim()) {
      toast.error('Name is required');
      return;
    }
    const iconValue = draft.icon === 'custom'
      ? (draft as any).iconCustom?.trim()
      : (draft.icon === 'none' ? '' : draft.icon.trim());
    updateFacility.mutate(
      { id, payload: { name: draft.name.trim(), icon: iconValue || null } },
      {
        onSuccess: () => toast.success('Facility updated'),
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to update facility');
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteFacility.mutate(id, {
      onSuccess: () => toast.success('Facility deleted'),
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to delete facility');
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 reveal-up">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Master Data</p>
          <h1 className="font-display text-3xl text-slate-900 tracking-tight">Facilities</h1>
          <p className="text-sm text-slate-600">Set name and icon key for facilities shown on glamping detail.</p>
        </div>
      </div>

      <Card className="rounded-[2.5rem] border-white/70 bg-white/80 shadow-xl reveal-up reveal-delay-1">
        <CardHeader className="pb-0">
          <CardTitle className="font-display text-xl text-primary">Add Facility</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Name (e.g. Free WiFi)"
              className="rounded-2xl bg-white/70 border-white/70"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <IconPicker
              value={newIcon}
              onChange={setNewIcon}
              customValue={newIconCustom}
              onCustomChange={setNewIconCustom}
            />
            <Button
              onClick={handleCreate}
              disabled={createFacility.isPending}
              className="rounded-2xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              {createFacility.isPending ? 'Saving...' : 'Create'}
            </Button>
          </div>
          <p className="mt-3 text-xs text-slate-500">Available icon keys: {iconHint}</p>
        </CardContent>
      </Card>

      <Card className="rounded-[2.5rem] border-white/70 bg-white/80 shadow-xl reveal-up reveal-delay-2">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/70 border-b border-white/70">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Icon</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Name</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Icon Key</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/70">
                {isLoading ? (
                  [1, 2, 3, 4].map((i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-6" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-8 w-28" /></td>
                    </tr>
                  ))
                ) : (
                  facilities.map((facility: any) => {
                    const rawIcon = facility.icon || '';
                    const fallbackIcon = rawIcon && AMENITY_ICON_KEYS.includes(rawIcon) ? rawIcon : (rawIcon ? 'custom' : 'none');
                    const fallbackDraft = { name: facility.name, icon: fallbackIcon, ...(fallbackIcon === 'custom' ? { iconCustom: rawIcon } : {}) } as Draft & { iconCustom?: string };
                    const draft = (drafts[facility.id] as any) || fallbackDraft;
                    const iconValue = draft.icon === 'custom' ? (draft.iconCustom || '') : draft.icon;
                    const key = (iconValue || '').toLowerCase();
                    const Icon = AMENITY_ICON_MAP[key] || AMENITY_ICON_FALLBACK;
                    return (
                      <tr key={facility.id} className="hover:bg-white/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="h-9 w-9 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
                            <Icon className="h-4 w-4" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Input
                            value={draft.name}
                            onChange={(e) =>
                              setDrafts((current) => ({
                                ...current,
                                [facility.id]: { ...draft, name: e.target.value },
                              }))
                            }
                            className="rounded-2xl bg-white/70 border-white/70"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <IconPicker
                            value={draft.icon}
                            onChange={(value) =>
                              setDrafts((current) => ({
                                ...current,
                                [facility.id]: { ...draft, icon: value },
                              }))
                            }
                            customValue={draft.iconCustom}
                            onCustomChange={(value) =>
                              setDrafts((current) => ({
                                ...current,
                                [facility.id]: { ...draft, iconCustom: value },
                              }))
                            }
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              className="rounded-2xl"
                              onClick={() => handleSave(facility.id)}
                              disabled={updateFacility.isPending}
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save
                            </Button>
                            <Button
                              variant="ghost"
                              className="rounded-2xl text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(facility.id)}
                              disabled={deleteFacility.isPending}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
