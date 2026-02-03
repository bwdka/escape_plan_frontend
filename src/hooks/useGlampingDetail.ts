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
