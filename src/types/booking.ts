export interface CalculatePriceRequest {
    unit_id: number;
    check_in: string;
    check_out: string;
    quantity: number;
    total_guests: number;
    addons: { id: number; quantity: number }[];
    promo_code?: string;
    payment_method_id?: string;
}

export interface PriceBreakdownItem {
    label: string;
    value: number;
    item_id?: number;
    item_type?: string;
    name?: string;
    qty?: number;
    price?: number;
}

export interface CalculatePriceResponse {
    data: {
        base_price: number;
        attractive_price: number;
        addons_price: number;
        extra_guest_price?: number;
        discount_amount?: number;
        service_fee: number;
        tax_amount: number;
        total_price: number;
        breakdown: PriceBreakdownItem[];
        capacity?: number;
        extra_guests?: number;
    };
}

export interface CreateBookingRequest {
    unit_id: number;
    check_in: string;
    check_out: string;
    total_guests: number;
    payment_method_id: string;
    card_token?: string;
    guest_name: string;
    guest_phone: string;
    guest_email: string;
    special_request?: string;
    addons: { id: number; quantity: number }[];
    promo_code?: string;
    quantity: number;
}

export interface CreateBookingResponse {
    message: string;
    data: {
        booking_id: number;
        booking_code: string;
        status: string;
        payment: {
            payment_method_id: string;
            payment_type: string;
            bank?: string | null;
            response: Record<string, any>;
        };
        total_price: number;
    };
}

export interface BookingItem {
    id: number;
    booking_id: number;
    item_type: string;
    item_id: number;
    name: string;
    quantity: number;
    price: number;
    total_price: number;
}

export interface BookingDetail {
    id: number;
    booking_code: string;
    check_in: string;
    check_out: string;
    total_price: number;
    status: string;
    payment_type?: string | null;
    payment_payload?: Record<string, any> | null;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    glamping_name: string;
    unit_name: string;
    items: BookingItem[];
    glamping_thumbnail: string;
    created_at: string;
}

export interface BookingHistoryItem {
    id: number;
    booking_code: string;
    status: string;
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

export interface BookingDetailResponse {
    data: BookingDetail;
}
