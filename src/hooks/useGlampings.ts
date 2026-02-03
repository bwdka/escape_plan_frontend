import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { GlampingResponse, GlampingFilterParams } from '@/types/glamping';

export const useGlampings = (params: GlampingFilterParams) => {
  return useQuery({
    queryKey: ['glampings', params],
    queryFn: async () => {
      // Clean up undefined params
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v != null && v !== '')
      );
      
      const { data } = await api.get<GlampingResponse>('/glampings', {
        params: cleanParams,
      });
      return data;
    },
  });
};
