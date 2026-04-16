'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export const usePartnerAnalytics = () => {
  return useQuery({
    queryKey: ['partner-analytics'],
    queryFn: async () => {
      const { data } = await api.get<{ data: any }>('/partner/analytics');
      return data.data;
    }
  });
};

export const useAdminAnalytics = () => {
  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const { data } = await api.get<{ data: any }>('/admin/analytics');
      return data.data;
    }
  });
};
