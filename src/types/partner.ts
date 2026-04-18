export interface PartnerDashboardStats {
    active_glampings: number;
    bookings_this_month: number;
    revenue_this_month: number;
    upcoming_checkins: number;
}

export interface DashboardStatsResponse {
    data: PartnerDashboardStats;
}

export interface CalendarBookingDetail {
    guest_name: string;
    source: string;
}

export interface CalendarUnitDetail {
    unit_name: string;
    stock_left: number;
    bookings: CalendarBookingDetail[];
}

export interface CalendarDay {
    date: string;
    status: 'fully_booked' | 'partial' | 'blocked' | 'available';
    details: CalendarUnitDetail[];
}

export interface CalendarResponse {
    data: CalendarDay[];
}

export interface BlockDateRequest {
    unit_id: number;
    start_date: string;
    end_date: string;
    reason: string;
}

export interface IcalSyncRequest {
    platform_name: string;
    ical_url: string;
}

export interface IcalSyncResponse {
    data: {
        import_status: string;
        export_url: string;
    };
}

export interface PartnerGuestBooking {
    booking_id: number;
    booking_code: string;
    guest_name: string;
    guest_email?: string;
    guest_phone?: string;
    glamping_name?: string;
    unit_name?: string;
    check_in?: string;
    check_out?: string;
    booking_status?: string;
    payment_status?: string;
    total_price: number;
    created_at?: string;
}

export interface PartnerGuestBookingsResponse {
    data: PartnerGuestBooking[];
}
