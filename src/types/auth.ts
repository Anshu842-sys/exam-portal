import { UserRole } from './database';

export interface AuthUser {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: UserRole;
  student_id?: string;
  faculty_id?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isDemoMode: boolean;
  supabaseConnected: boolean;
  checkConnection: () => Promise<boolean>;
}
