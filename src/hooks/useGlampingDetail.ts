import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { GlampingDetailResponse } from '@/types/glamping';

export const useGlampingDetail = (slug: string) => {
  return useQuery({
    queryKey: ['glamping', slug],
    queryFn: async () => {
      const { data } = await api.get<GlampingDetailResponse>(`/glampings/${slug}`);
      return data.data;
    },
    enabled: !!slug,
  });
};

export const useGlampingBlockedDates = (glampingId?: number) => {
  return useQuery({
    queryKey: ['glamping-blocked-dates', glampingId],
    queryFn: async () => {
      const { data } = await api.get<{ data: string[] }>(`/glampings/${glampingId}/blocked-dates`);
      return (data.data || []).map((d) => d.split(' ')[0]);
    },
    enabled: !!glampingId,
  });
};

export const useUnitBlockedDates = (unitId?: number) => {
  return useQuery({
    queryKey: ['unit-blocked-dates', unitId],
    queryFn: async () => {
      const { data } = await api.get<{ data: string[] }>(`/units/${unitId}/blocked-dates`);
      return (data.data || []).map((d) => d.split(' ')[0]);
    },
    enabled: !!unitId,
  });
};

export const useUnitDetail = (unitId?: number) => {
  return useQuery({
    queryKey: ['unit-detail', unitId],
    queryFn: async () => {
      const { data } = await api.get<{ data: any }>(`/units/${unitId}`);
      return data.data;
    },
    enabled: !!unitId,
  });
};
