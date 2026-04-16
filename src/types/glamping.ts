export interface Glamping {
  id: number;
  slug: string;
  name: string;
  location: string;
  thumbnail: string;
  price: number;
  rating: number;
  vibe: string;
  access_type?: string;
  pet_friendly?: boolean;
  has_wifi?: boolean;
  has_electricity?: boolean;
  bathroom_type?: 'private' | 'shared' | 'none';
  description?: string;
  images?: string[];
  amenities?: any[];
  partner_id?: number;
}

export interface GlampingResponse {
  data: Glamping[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
  links: Record<string, any>;
}

export interface GlampingFilterParams {
  location?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  min_price?: number;
  max_price?: number;
  vibe?: string; // comma separated
  access_type?: string;
  pet_friendly?: boolean;
  has_wifi?: boolean;
  has_electricity?: boolean;
  bathroom_type?: 'private' | 'shared' | 'none';
  page?: number;
}

export interface Facility {
    id: number;
    name: string;
    icon?: string;
}

export interface Unit {
    id: number;
    name: string;
    description?: string;
    capacity: number;
    price_per_night: number;
    price_weekend?: number;
    max_stock: number;
    available_stock: number;
    photos: string[];
}

export interface Addon {
    id: number;
    name: string;
    price: number;
    unit: string;
    icon?: string | null;
    description?: string | null;
}

export interface Amenity {
    icon: string;
    name: string;
}

export interface GalleryItem {
    url: string;
    caption: string;
}

export interface GlampingDetail extends Glamping {
    description: string;
    address: string;
    location_city: string;
    thumbnail_url: string;
    review_count: number;
    access_type: string;
    cancellation_policy?: string;
    reschedule_allowed?: boolean;
    min_nights?: number;
    prep_days?: number;
    pet_friendly?: boolean;
    has_wifi?: boolean;
    has_electricity?: boolean;
    bathroom_type?: 'private' | 'shared' | 'none';
    access_notes?: string | null;
    safety_notes?: string | null;
    packing_list?: string | null;
    house_rules?: string | null;
    latitude: number;
    longitude: number;
    policy: {
        check_in: string;
        check_out: string;
        is_pet_friendly: boolean;
    };
    owner?: {
        id: number;
        name: string;
        avatar?: string | null;
        phone?: string | null;
        products: Array<{
            id: number;
            slug: string;
            name: string;
            thumbnail?: string | null;
            price: number;
        }>;
    };
    amenities: Amenity[];
    gallery: GalleryItem[];
    weather_code?: string;
    units: Unit[];
    addons: Addon[];
}

export interface GlampingDetailResponse {
    data: GlampingDetail;
}
