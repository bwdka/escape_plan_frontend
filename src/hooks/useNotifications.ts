import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get<{ data: any[] }>('/notifications');
      return data.data;
    },
    refetchInterval: 5000
  });
};

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post(`/notifications/${id}/read`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] })
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/notifications/read-all');
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] })
  });
};

export const useClearNotifications = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/notifications/clear');
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] })
  });
};
