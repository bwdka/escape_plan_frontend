'use client';

import { use, useState, useEffect } from 'react';
import { usePartnerUnits, useCreateUnit, useUpdateUnit, useDeleteUnit } from '@/hooks/usePartner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, ArrowLeft, Edit2, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { MediaUpload } from '@/components/features/partner/MediaUpload';
import { useForm } from 'react-hook-form';

export default function ManageUnitsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const glampingId = Number(resolvedParams.id);
  
  const { data: units, isLoading } = usePartnerUnits(glampingId);
  const { mutate: createUnit, isPending: isCreating } = useCreateUnit(glampingId);
  const { mutate: updateUnit, isPending: isUpdating } = useUpdateUnit(glampingId);
  const { mutate: deleteUnit } = useDeleteUnit(glampingId);
  
  const [editingUnitId, setEditingUnitId] = useState<number | null>(null);
  const [images, setImages] = useState<string[]>([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const handleEdit = (unit: any) => {
    setEditingUnitId(unit.id);
    reset({
        title: unit.title,
        capacity: unit.capacity,
        total_stock: unit.total_stock,
        price_weekday: unit.price_weekday,
        price_weekend: unit.price_weekend,
        description: unit.description,
    });
    setImages(unit.unit_images?.map((img: any) => img.path) || []);
  };

  const cancelEdit = () => {
    setEditingUnitId(null);
    reset({
        title: '',
        capacity: 2,
        total_stock: 1,
        price_weekday: '',
        price_weekend: '',
        description: '',
    });
    setImages([]);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this unit?")) {
        deleteUnit(id, {
            onSuccess: () => toast.success("Unit deleted successfully"),
        });
    }
  };

  const onSubmit = (data: any) => {
    if (editingUnitId) {
        updateUnit({ id: editingUnitId, payload: { ...data, images } }, {
            onSuccess: () => {
                toast.success("Unit updated successfully!");
                cancelEdit();
            },
            onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update unit")
        });
    } else {
        createUnit({ ...data, images }, {
            onSuccess: () => {
                toast.success("Unit added successfully!");
                reset();
                setImages([]);
            },
            onError: (err: any) => toast.error(err.response?.data?.message || "Failed to add unit")
        });
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/partner/listings">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
            </Button>
            <div>
                <h2 className="text-2xl font-bold">Manage Units</h2>
                <p className="text-sm text-gray-500">Add or edit units for this property</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2].map(i => <Card key={i} className="h-32 animate-pulse bg-gray-50" />)}
                    </div>
                ) : units?.length === 0 ? (
                    <Card className="p-12 text-center border-dashed">
                        <p className="text-gray-500">No units found. Add your first unit to start receiving bookings!</p>
                    </Card>
                ) : (
                    units?.map((unit: any) => (
                        <Card key={unit.id} className={editingUnitId === unit.id ? 'ring-2 ring-primary' : ''}>
                            <CardContent className="p-4 flex gap-4">
                                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                    <Image 
                                        src={unit.unit_images?.[0]?.path ? (unit.unit_images[0].path.startsWith('http') ? unit.unit_images[0].path : `http://localhost:8000/storage/${unit.unit_images[0].path}`) : 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=200&q=80'} 
                                        alt={unit.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold">{unit.title}</h3>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(unit)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(unit.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                        <span>Capacity: {unit.capacity}</span>
                                        <span>Stock: {unit.total_stock}</span>
                                        <span className="font-bold text-primary">Rp {Number(unit.price_weekday).toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <div className="space-y-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-lg">
                            {editingUnitId ? 'Edit Unit' : 'Add New Unit'}
                        </CardTitle>
                        {editingUnitId && (
                            <Button variant="ghost" size="icon" onClick={cancelEdit}>
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Unit Title</Label>
                                <Input {...register('title', { required: true })} placeholder="e.g. Deluxe Tent" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Capacity</Label>
                                    <Input type="number" {...register('capacity', { valueAsNumber: true })} defaultValue={2} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Stock</Label>
                                    <Input type="number" {...register('total_stock', { valueAsNumber: true })} defaultValue={1} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Weekday Price</Label>
                                    <Input type="number" {...register('price_weekday', { valueAsNumber: true })} placeholder="Rp" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Weekend Price</Label>
                                    <Input type="number" {...register('price_weekend', { valueAsNumber: true })} placeholder="Rp" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea {...register('description')} placeholder="Unit details..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Photos</Label>
                                <MediaUpload value={images} onChange={setImages} folder="units" />
                            </div>
                            <Button className="w-full" type="submit" disabled={isPending}>
                                {isPending ? 'Saving...' : (editingUnitId ? 'Update Unit' : 'Add Unit')}
                            </Button>
                            {editingUnitId && (
                                <Button className="w-full" variant="outline" type="button" onClick={cancelEdit}>
                                    Cancel Editing
                                </Button>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
