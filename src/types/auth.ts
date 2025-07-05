export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  phone?: string;
  captchaToken?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  phone?: string;
  isAdmin: boolean;
  isVerified: boolean;
  language: string;
  accountScore: number;
  daysPlayed: number;
  totalXenocoins: number;
  createdAt: Date;
  lastLogin: Date;
  avatar?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  notifications: boolean;
  soundEffects: boolean;
  musicVolume: number;
  language: string;
  theme: 'light' | 'dark' | 'auto';
  privacy: {
    showOnline: boolean;
    allowDuels: boolean;
    allowTrades: boolean;
  };
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  message?: string;
  errors?: ValidationError[];
}