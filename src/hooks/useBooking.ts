import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { AxiosError } from 'axios';
import { 
    CalculatePriceRequest, 
    CalculatePriceResponse, 
    CreateBookingRequest, 
    CreateBookingResponse, 
    MyTripsResponse,
    BookingDetailResponse
} from '@/types/booking';

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
    queryKey: ['calculate-price', payload.unit_id, payload.check_in, payload.check_out, JSON.stringify(payload.addons), payload.total_guests],
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
