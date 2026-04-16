'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { 
    BlockDateRequest, 
    CalendarResponse, 
    DashboardStatsResponse, 
    IcalSyncRequest, 
    IcalSyncResponse 
} from '@/types/partner';

export const usePartnerDashboard = () => {
    return useQuery({
        queryKey: ['partner-dashboard'],
        queryFn: async () => {
            const { data } = await api.get<DashboardStatsResponse>('/partner/dashboard');
            return data.data;
        }
    });
};

export const usePartnerListings = () => {
    return useQuery({
        queryKey: ['partner-listings'],
        queryFn: async () => {
            const { data } = await api.get('/partner/glampings');
            return data; // Paginated response
        }
    });
};

export const usePartnerGlamping = (id: number) => {
    return useQuery({
        queryKey: ['partner-glamping', id],
        queryFn: async () => {
            const { data } = await api.get(`/partner/glampings/${id}`);
            return data.data;
        },
        enabled: !!id
    });
}

export const useCreateGlamping = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: any) => {
            const { data } = await api.post('/partner/glampings', payload);
            return data.data;
        },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['partner-listings'] });
            }
          });
        };
        
        export const useDeleteGlamping = () => {
            const queryClient = useQueryClient();
            return useMutation({
                mutationFn: async (id: number) => {
                    await api.delete(`/partner/glampings/${id}`);
                },
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['partner-listings'] });
                }
            });
        };
        
        export const useFacilities = () => {    return useQuery({
        queryKey: ['facilities'],
        queryFn: async () => {
            const { data } = await api.get<{data: any[]}>('/facilities');
            return data.data;
        }
    });
};

export const usePartnerUnits = (glampingId: number) => {
    return useQuery({
        queryKey: ['partner-units', glampingId],
        queryFn: async () => {
            const { data } = await api.get(`/partner/glampings/${glampingId}/units`);
            return data.data;
        },
        enabled: !!glampingId
    });
};

export const useCreateUnit = (glampingId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: any) => {
            const { data } = await api.post(`/partner/glampings/${glampingId}/units`, payload);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partner-units', glampingId] });
        }
    });
};

export const useUpdateUnit = (glampingId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: any }) => {
            const { data } = await api.put(`/partner/units/${id}`, payload);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partner-units', glampingId] });
        }
    });
};

export const useDeleteUnit = (glampingId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/partner/units/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partner-units', glampingId] });
        }
    });
};

export const usePartnerCalendar = (glampingId: number, month: number, year: number) => {
    return useQuery({
        queryKey: ['partner-calendar', glampingId, month, year],
        queryFn: async () => {
            const { data } = await api.get<CalendarResponse>('/partner/calendar', {
                params: { glamping_id: glampingId, month, year }
            });
            return data.data;
        },
        enabled: !!glampingId
    });
};

export const useBlockDate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: BlockDateRequest) => {
             await api.post('/partner/calendar/block', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partner-calendar'] });
        }
    });
};

export const useSyncIcal = (glampingId: number) => {
     return useMutation({
        mutationFn: async (payload: IcalSyncRequest) => {
             const { data } = await api.post<IcalSyncResponse>(`/partner/glampings/${glampingId}/ical`, payload);
             return data.data;
        }
    });
}
