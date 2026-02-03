import { User } from './index';

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: 'customer' | 'partner';
    phone: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    meta: {
        code: number;
        status: string;
        message: string;
    };
    data: {
        user: User;
        token: string;
    };
}
