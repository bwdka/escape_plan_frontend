export type Role = 'customer' | 'partner' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatar_url?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_holder?: string;
}
