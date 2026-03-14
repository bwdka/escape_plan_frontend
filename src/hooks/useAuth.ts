import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { User } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';

export const useProfile = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get<{user: User}>('/profile');
      return data.user;
    },
    enabled,
  });
};

export const useUpdateProfile = () => {
  const setUser = useAuthStore((state) => state.setUser);
  return useMutation({
    mutationFn: async (payload: Partial<User>) => {
      const { data } = await api.put<{user: User}>('/profile', payload);
      return data.user;
    },
    onSuccess: (user) => {
      setUser(user);
    },
  });
};
