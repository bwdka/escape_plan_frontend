'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { WishlistResponse } from '@/types/wishlist';
import { toast } from 'sonner';
import { useI18n } from '@/i18n/I18nProvider';

export const useWishlist = () => {
    const { t } = useI18n();
    const queryClient = useQueryClient();

    const { data: wishlist, isLoading } = useQuery({
        queryKey: ['wishlist'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            if (!token) return { data: [] } as WishlistResponse;
            const { data } = await api.get<WishlistResponse>('/wishlist');
            return data;
        },
    });

    const addToWishlist = useMutation({
        mutationFn: async (glampingId: number) => {
            const { data } = await api.post('/wishlist', { glamping_id: glampingId });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
            toast.success(t({ id: 'Berhasil ditambahkan ke wishlist', en: 'Added to wishlist' }));
        },
        onError: () => {
            toast.error(t({ id: 'Gagal menambahkan ke wishlist', en: 'Failed to add to wishlist' }));
        }
    });

    const removeFromWishlist = useMutation({
        mutationFn: async (glampingId: number) => {
            const { data } = await api.delete(`/wishlist/${glampingId}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
            toast.success(t({ id: 'Dihapus dari wishlist', en: 'Removed from wishlist' }));
        },
        onError: () => {
            toast.error(t({ id: 'Gagal menghapus dari wishlist', en: 'Failed to remove from wishlist' }));
        }
    });

    return {
        wishlist: wishlist?.data || [],
        isLoading,
        addToWishlist,
        removeFromWishlist,
    };
};
