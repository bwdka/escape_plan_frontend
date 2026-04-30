import { GlampingDetail } from './glamping';

export interface WishlistItem {
    id: number;
    glamping_id: number;
    glamping: {
        id: number;
        name: string;
        slug: string;
        location_city: string;
        rating: number;
        thumbnail_url?: string;
    };
}

export interface WishlistResponse {
    data: WishlistItem[];
}
