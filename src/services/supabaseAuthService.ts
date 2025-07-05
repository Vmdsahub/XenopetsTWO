import { supabase, handleSupabaseError } from "../lib/supabase";
import {
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from "../types/auth";

// Check if we're in mock mode
const isMockMode =
  import.meta.env.VITE_SUPABASE_URL?.includes("temp-mock") ||
  !import.meta.env.VITE_SUPABASE_URL;

// Mock users for demo
const mockUsers: Record<string, { user: AuthUser; password: string }> = {
  "demo@example.com": {
    password: "demo123",
    user: {
      id: "demo-user-123",
      email: "demo@example.com",
      username: "Demo Player",
      phone: "+1234567890",
      isAdmin: false,
      isVerified: true,
      language: "en-US",
      accountScore: 2500,
      daysPlayed: 15,
      totalXenocoins: 8450,
      createdAt: new Date("2024-01-01"),
      lastLogin: new Date(),
      preferences: {
        notifications: true,
        soundEffects: true,
        musicVolume: 0.7,
        language: "en-US",
        theme: "light" as const,
        privacy: {
          showOnline: true,
          allowDuels: true,
          allowTrades: true,
        },
      },
    },
  },
  "admin@example.com": {
    password: "admin123",
    user: {
      id: "admin-user-456",
      email: "admin@example.com",
      username: "Admin User",
      phone: "+0987654321",
      isAdmin: true,
      isVerified: true,
      language: "en-US",
      accountScore: 10000,
      daysPlayed: 50,
      totalXenocoins: 25000,
      createdAt: new Date("2023-12-01"),
      lastLogin: new Date(),
      preferences: {
        notifications: true,
        soundEffects: true,
        musicVolume: 0.8,
        language: "en-US",
        theme: "light" as const,
        privacy: {
          showOnline: true,
          allowDuels: true,
          allowTrades: true,
        },
      },
    },
  },
};

// Store current mock user in localStorage
const getCurrentMockUser = (): AuthUser | null => {
  if (!isMockMode) return null;
  const stored = localStorage.getItem("xenopets-mock-user");
  return stored ? JSON.parse(stored) : null;
};

const setCurrentMockUser = (user: AuthUser | null) => {
  if (!isMockMode) return;
  if (user) {
    localStorage.setItem("xenopets-mock-user", JSON.stringify(user));
  } else {
    localStorage.removeItem("xenopets-mock-user");
  }
};

export class SupabaseAuthService {
  private static instance: SupabaseAuthService;

  public static getInstance(): SupabaseAuthService {
    if (!SupabaseAuthService.instance) {
      SupabaseAuthService.instance = new SupabaseAuthService();
    }
    return SupabaseAuthService.instance;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    // Mock mode implementation
    if (isMockMode) {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

      // Validate passwords match
      if (credentials.password !== credentials.confirmPassword) {
        return {
          success: false,
          message: "Passwords do not match",
          errors: [
            { field: "confirmPassword", message: "Passwords do not match" },
          ],
        };
      }

      // Check if user already exists
      if (mockUsers[credentials.email]) {
        return {
          success: false,
          message: "User already exists",
          errors: [
            { field: "email", message: "User with this email already exists" },
          ],
        };
      }

      // Create new mock user
      const newUser: AuthUser = {
        id: `user-${Date.now()}`,
        email: credentials.email,
        username: credentials.username,
        phone: credentials.phone,
        isAdmin: credentials.username.toLowerCase() === "vitoca",
        isVerified: true,
        language: this.detectLanguage(),
        accountScore: 0,
        daysPlayed: 0,
        totalXenocoins: 0,
        createdAt: new Date(),
        lastLogin: new Date(),
        preferences: this.getDefaultPreferences(),
      };

      // Store in mock database
      mockUsers[credentials.email] = {
        password: credentials.password,
        user: newUser,
      };

      // Set as current user
      setCurrentMockUser(newUser);

      return {
        success: true,
        user: newUser,
        token: "mock-token",
        message: "Registration successful",
      };
    }

    try {
      // Validate passwords match
      if (credentials.password !== credentials.confirmPassword) {
        return {
          success: false,
          message: "Passwords do not match",
          errors: [
            { field: "confirmPassword", message: "Passwords do not match" },
          ],
        };
      }

      // Register with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            username: credentials.username,
            phone: credentials.phone,
            language: this.detectLanguage(),
          },
        },
      });

      if (error) {
        return {
          success: false,
          message: handleSupabaseError(error),
          errors: [{ field: "general", message: handleSupabaseError(error) }],
        };
      }

      if (!data.user) {
        return {
          success: false,
          message: "Registration failed",
          errors: [
            { field: "general", message: "Failed to create user account" },
          ],
        };
      }

      // Get the created profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
      }

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email!,
        username: profile?.username || credentials.username,
        phone: profile?.phone || credentials.phone,
        isAdmin: profile?.is_admin || false,
        isVerified: data.user.email_confirmed_at !== null,
        language: profile?.language || this.detectLanguage(),
        accountScore: profile?.account_score || 0,
        daysPlayed: profile?.days_played || 0,
        totalXenocoins: profile?.total_xenocoins || 0,
        createdAt: new Date(data.user.created_at),
        lastLogin: new Date(),
        preferences: profile?.preferences || this.getDefaultPreferences(),
      };

      return {
        success: true,
        user: authUser,
        token: data.session?.access_token,
        message: "Registration successful",
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: "Registration failed. Please try again.",
        errors: [{ field: "general", message: "An unexpected error occurred" }],
      };
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Mock mode implementation
    if (isMockMode) {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

      const mockUser = mockUsers[credentials.email];

      if (!mockUser || mockUser.password !== credentials.password) {
        return {
          success: false,
          message: "Email ou senha inválidos. Por favor, tente novamente.",
          errors: [{ field: "general", message: "Invalid credentials" }],
        };
      }

      // Update last login
      mockUser.user.lastLogin = new Date();
      setCurrentMockUser(mockUser.user);

      return {
        success: true,
        user: mockUser.user,
        token: "mock-token",
        message: "Login successful",
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        // Handle specific login credential errors with user-friendly messages
        let errorMessage = handleSupabaseError(error);

        if (
          error.message === "Invalid login credentials" ||
          error.message.includes("invalid_credentials") ||
          error.message.includes("Invalid login credentials")
        ) {
          errorMessage =
            "Email ou senha inválidos. Por favor, tente novamente.";
        }

        return {
          success: false,
          message: errorMessage,
          errors: [{ field: "general", message: errorMessage }],
        };
      }

      if (!data.user || !data.session) {
        return {
          success: false,
          message: "Login failed",
          errors: [{ field: "general", message: "Invalid credentials" }],
        };
      }

      // Update last login
      await supabase
        .from("profiles")
        .update({ last_login: new Date().toISOString() })
        .eq("id", data.user.id);

      // Get profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email!,
        username: profile?.username || "User",
        phone: profile?.phone,
        isAdmin: profile?.is_admin || false,
        isVerified: data.user.email_confirmed_at !== null,
        language: profile?.language || this.detectLanguage(),
        accountScore: profile?.account_score || 0,
        daysPlayed: profile?.days_played || 0,
        totalXenocoins: profile?.total_xenocoins || 0,
        createdAt: new Date(data.user.created_at),
        lastLogin: new Date(profile?.last_login || data.user.created_at),
        preferences: profile?.preferences || this.getDefaultPreferences(),
      };

      return {
        success: true,
        user: authUser,
        token: data.session.access_token,
        message: "Login successful",
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "Login failed. Please try again.",
        errors: [{ field: "general", message: "An unexpected error occurred" }],
      };
    }
  }

  async logout(): Promise<void> {
    if (isMockMode) {
      setCurrentMockUser(null);
      return;
    }
    await supabase.auth.signOut();
  }

  async resetPassword(email: string): Promise<AuthResponse> {
    // Mock mode implementation
    if (isMockMode) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay

      if (!mockUsers[email]) {
        return {
          success: false,
          message: "User not found",
          errors: [
            { field: "email", message: "No user found with this email" },
          ],
        };
      }

      return {
        success: true,
        message:
          "Password reset link has been sent to your email (mock mode - check console for demo password).",
      };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return {
          success: false,
          message: handleSupabaseError(error),
          errors: [{ field: "email", message: handleSupabaseError(error) }],
        };
      }

      return {
        success: true,
        message: "Password reset link has been sent to your email.",
      };
    } catch (error) {
      console.error("Password reset error:", error);
      return {
        success: false,
        message: "Password reset failed. Please try again.",
        errors: [{ field: "general", message: "An unexpected error occurred" }],
      };
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    // Mock mode implementation
    if (isMockMode) {
      return getCurrentMockUser();
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      return {
        id: user.id,
        email: user.email!,
        username: profile?.username || "User",
        phone: profile?.phone,
        isAdmin: profile?.is_admin || false,
        isVerified: user.email_confirmed_at !== null,
        language: profile?.language || this.detectLanguage(),
        accountScore: profile?.account_score || 0,
        daysPlayed: profile?.days_played || 0,
        totalXenocoins: profile?.total_xenocoins || 0,
        createdAt: new Date(user.created_at),
        lastLogin: new Date(profile?.last_login || user.created_at),
        preferences: profile?.preferences || this.getDefaultPreferences(),
      };
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }

  private detectLanguage(): string {
    const userLang = navigator.language || navigator.languages[0];
    const countryCode = userLang.split("-")[0];

    const languageMap: Record<string, string> = {
      pt: "pt-BR",
      en: "en-US",
      es: "es-ES",
      fr: "fr-FR",
      de: "de-DE",
      it: "it-IT",
      ja: "ja-JP",
      ko: "ko-KR",
      zh: "zh-CN",
    };

    return languageMap[countryCode] || "en-US";
  }

  private getDefaultPreferences() {
    return {
      notifications: true,
      soundEffects: true,
      musicVolume: 0.7,
      language: this.detectLanguage(),
      theme: "light" as const,
      privacy: {
        showOnline: true,
        allowDuels: true,
        allowTrades: true,
      },
    };
  }
}

export const supabaseAuthService = SupabaseAuthService.getInstance();
