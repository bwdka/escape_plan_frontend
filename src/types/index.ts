export type Role = 'customer' | 'partner' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  avatar_url?: string | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_holder?: string | null;
}
