import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { User } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';

export const useProfile = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get<{data: {user: User}}>('/profile');
      return response.data.data.user;
    },
    enabled,
  });
};

export const useUpdateProfile = () => {
  const setUser = useAuthStore((state) => state.setUser);
  return useMutation({
    mutationFn: async (payload: Partial<User>) => {
      const response = await api.put<{data: {user: User}}>('/profile', payload);
      return response.data.data.user;
    },
    onSuccess: (user) => {
      setUser(user);
    },
  });
};
