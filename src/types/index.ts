export type Role = 'customer' | 'partner' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatar_url?: string;
}
