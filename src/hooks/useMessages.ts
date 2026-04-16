'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export const useMessageThreads = () => {
  return useQuery({
    queryKey: ['message-threads'],
    queryFn: async () => {
      const { data } = await api.get<{ data: any[] }>('/messages/threads');
      return data.data;
    },
    refetchInterval: 5000
  });
};

export const useThreadMessages = (threadId?: number) => {
  return useQuery({
    queryKey: ['message-thread', threadId],
    queryFn: async () => {
      const { data } = await api.get<{ data: any[] }>(`/messages/threads/${threadId}`);
      return data.data;
    },
    enabled: !!threadId,
    refetchInterval: 3000
  });
};

export const useStartThread = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: number) => {
      const { data } = await api.post<{ data: { thread_id: number } }>('/messages/start', { booking_id: bookingId });
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['message-threads'] })
  });
};

export const useSendMessage = (threadId?: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: string) => {
      const { data } = await api.post(`/messages/threads/${threadId}`, { body });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['message-thread', threadId] });
      qc.invalidateQueries({ queryKey: ['message-threads'] });
    }
  });
};
