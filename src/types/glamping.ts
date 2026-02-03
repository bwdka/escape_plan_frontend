export interface Glamping {
  id: number;
  slug: string;
  name: string;
  location: string;
  thumbnail: string;
  price: number;
  rating: number;
  vibe: string;
  description?: string;
  images?: string[];
  amenities?: string[];
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
  page?: number;
}

export interface Unit {
    id: number;
    name: string;
    capacity: number;
    price_per_night: number;
    max_stock: number;
    available_stock: number;
    photos: string[];
}

export interface Addon {
    id: number;
    name: string;
    price: number;
    unit: string;
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
    latitude: number;
    longitude: number;
    policy: {
        check_in: string;
        check_out: string;
        is_pet_friendly: boolean;
    };
    amenities: Amenity[];
    gallery: GalleryItem[];
    weather_code: string;
    units: Unit[];
    addons: Addon[];
}

export interface GlampingDetailResponse {
    data: GlampingDetail;
}