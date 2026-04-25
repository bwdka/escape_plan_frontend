'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { AxiosError } from 'axios';
import { 
    CalculatePriceRequest, 
    CalculatePriceResponse, 
    CreateBookingRequest, 
    CreateBookingResponse, 
    MyTripsResponse,
    BookingDetailResponse,
    CreateReviewRequest
} from '@/types/booking';

export type PaymentMethod = {
  id: string;
  payment_type: string;
  bank?: string;
  label: string;
};

export const useCalculatePrice = () => {
  return useMutation({
    mutationFn: async (payload: CalculatePriceRequest) => {
      const { data } = await api.post<CalculatePriceResponse>('/bookings/calculate', payload);
      return data.data;
    },
  });
};

export const useCalculatePriceQuery = (payload: CalculatePriceRequest & { enabled: boolean }) => {
  return useQuery({
    queryKey: [
      'calculate-price',
      payload.unit_id,
      payload.check_in,
      payload.check_out,
      JSON.stringify(payload.addons),
      payload.total_guests,
      payload.payment_method_id,
      payload.promo_code,
    ],
    queryFn: async () => {
      const { data } = await api.post<CalculatePriceResponse>('/bookings/calculate', payload);
      return data.data;
    },
    enabled: payload.enabled && !!payload.unit_id && !!payload.check_in && !!payload.check_out,
    staleTime: 1000 * 60, // Cache for 1 minute
    retry: (failureCount, error: AxiosError) => {
        // Don't retry if it's a validation error (422)
        if (error.response?.status === 422) return false;
        return failureCount < 2; // Retry max 2 times for other errors
    }
  });
};

export const useCreateBooking = () => {
  return useMutation({
    mutationFn: async (payload: CreateBookingRequest) => {
      const { data } = await api.post<CreateBookingResponse>('/bookings', payload);
      return data.data;
    },
  });
};

export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const { data } = await api.get<{ data: PaymentMethod[] }>('/payment-methods');
      return data.data;
    },
  });
};

export const useMyTrips = () => {
  return useQuery({
    queryKey: ['my-trips'],
    queryFn: async () => {
      const { data } = await api.get<MyTripsResponse>('/bookings/my-trips');
      return data.data;
    },
  });
};

export const useBookingDetail = (id: string) => {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const { data } = await api.get<BookingDetailResponse>(`/bookings/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, ...payload }: CreateReviewRequest & { bookingId: number }) => {
      const { data } = await api.post(`/bookings/${bookingId}/review`, payload);
      return data;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['booking', String(variables.bookingId)] });
    },
  });
};
