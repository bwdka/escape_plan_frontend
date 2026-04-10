import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats');
      return data;
    },
  });
};

export const useAdminUsers = (params?: any) => {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: async () => {
      const { data } = await api.get('/admin/users', { params });
      return data;
    },
  });
};

export const useAdminVerifyUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_verified }: { id: number; is_verified: boolean }) => {
      const { data } = await api.patch(`/admin/users/${id}/verify`, { is_verified });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
};

export const useAdminGlampings = (params?: any) => {
  return useQuery({
    queryKey: ['admin-glampings', params],
    queryFn: async () => {
      const { data } = await api.get('/admin/glampings', { params });
      return data;
    },
  });
};

export const useAdminUpdateGlampingStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, rejection_reason }: { id: number; status: string; rejection_reason?: string }) => {
      const { data } = await api.patch(`/admin/glampings/${id}/status`, { status, rejection_reason });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-glampings'] });
    },
  });
};

export const useAdminBookings = (params?: any) => {
  return useQuery({
    queryKey: ['admin-bookings', params],
    queryFn: async () => {
      const { data } = await api.get('/admin/bookings', { params });
      return data;
    },
  });
};

export const useAdminFacilities = () => {
  return useQuery({
    queryKey: ['admin-facilities'],
    queryFn: async () => {
      const { data } = await api.get('/admin/facilities');
      return data;
    },
  });
};

export const useAdminCreateFacility = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; icon?: string | null }) => {
      const { data } = await api.post('/admin/facilities', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-facilities'] });
    },
  });
};

export const useAdminUpdateFacility = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: { name: string; icon?: string | null } }) => {
      const { data } = await api.put(`/admin/facilities/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-facilities'] });
    },
  });
};

export const useAdminDeleteFacility = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/admin/facilities/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-facilities'] });
    },
  });
};
