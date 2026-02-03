import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { 
    CalculatePriceRequest, 
    CalculatePriceResponse, 
    CreateBookingRequest, 
    CreateBookingResponse, 
    MyTripsResponse 
} from '@/types/booking';

export const useCalculatePrice = () => {
  return useMutation({
    mutationFn: async (payload: CalculatePriceRequest) => {
      const { data } = await api.post<CalculatePriceResponse>('/bookings/calculate', payload);
      return data.data;
    },
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
