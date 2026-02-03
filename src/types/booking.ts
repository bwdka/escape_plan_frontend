export interface CalculatePriceRequest {
    unit_id: number;
    check_in: string;
    check_out: string;
    quantity: number;
    addons: { id: number; qty: number }[];
    promo_code?: string;
}

export interface PriceBreakdownItem {
    label: string;
    value: number;
}

export interface CalculatePriceResponse {
    data: {
        base_price: number;
        addons_price: number;
        discount_amount: number;
        service_fee: number;
        tax_amount: number;
        total_price: number;
        breakdown: PriceBreakdownItem[];
    };
}

export interface CreateBookingRequest {
    unit_id: number;
    check_in: string;
    check_out: string;
    total_guests: number;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    special_request?: string;
    addons: { id: number; qty: number }[];
    promo_code?: string;
}

export interface CreateBookingResponse {
    data: {
        booking_code: string;
        status: 'UNPAID' | 'PAID' | 'CANCELLED' | 'COMPLETED';
        expired_at: string;
        snap_token: string;
        payment_url: string;
    };
}

export interface BookingHistoryItem {
    id: number;
    booking_code: string;
    status: 'UNPAID' | 'PAID' | 'CANCELLED' | 'COMPLETED';
    check_in: string;
    check_out: string;
    glamping_name: string;
    glamping_thumbnail: string;
    total_price: number;
    unit_name: string;
}

export interface MyTripsResponse {
    data: BookingHistoryItem[];
}
