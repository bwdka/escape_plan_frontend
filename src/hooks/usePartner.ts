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
