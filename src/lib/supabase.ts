import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we're in development mode with mock values
const isMockMode =
  supabaseUrl?.includes("temp-mock") ||
  supabaseUrl?.includes("your_supabase_project_url") ||
  supabaseAnonKey?.includes("your_supabase_anon_key") ||
  supabaseAnonKey === "mock-key" ||
  !supabaseUrl ||
  !supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Supabase environment variables not set - running in mock mode",
  );
}

// Use mock values if not configured
const finalUrl = supabaseUrl || "https://temp-mock.supabase.co";
const finalKey = supabaseAnonKey || "mock-key";

// Create a custom fetch function with better error handling and retry logic
const customFetch = async (url: string, options: RequestInit = {}) => {
  const maxRetries = 2;
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          // Preserve original headers (including apikey)
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      // Don't retry if we get a successful response or client errors (4xx)
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }

      // Only retry on server errors (5xx) or network errors
      if (attempt === maxRetries) {
        return response;
      }
    } catch (error: any) {
      lastError = error;
      console.warn(`Fetch attempt ${attempt + 1} failed:`, error.message);

      // If it's the last attempt, throw the error
      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000),
      );
    }
  }

  throw new Error(
    `Connection failed after ${maxRetries + 1} attempts. ${lastError?.message || "Unknown error"}`,
  );
};

// Create a mock supabase client for development
const createMockClient = () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signInWithPassword: () =>
      Promise.resolve({
        data: {
          user: {
            id: "mock-user-123",
            email: "demo@example.com",
            user_metadata: { username: "Demo User" },
          },
          session: { access_token: "mock-token" },
        },
        error: null,
      }),
    signUp: () =>
      Promise.resolve({
        data: {
          user: {
            id: "mock-user-123",
            email: "demo@example.com",
            user_metadata: { username: "Demo User" },
          },
          session: { access_token: "mock-token" },
        },
        error: null,
      }),
    signOut: () => Promise.resolve({ error: null }),
    resetPasswordForEmail: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
  },
  from: (table: string) => {
    const mockQueryBuilder = {
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          order: (column: string, options?: any) => ({
            limit: (count: number) =>
              Promise.resolve({
                data:
                  table === "profiles"
                    ? [
                        {
                          id: "mock-user-123",
                          xenocoins: 0,
                          cash: 0,
                          username: "Demo User",
                          account_score: 0,
                          created_at: new Date().toISOString(),
                          last_login: new Date().toISOString(),
                          is_admin: false,
                          days_played: 1,
                          total_xenocoins: 0,
                        },
                      ]
                    : [],
                error: null,
              }),
            then: (callback: any) =>
              callback({
                data: table === "profiles" ? [] : [],
                error: null,
              }),
          }),
          single: () =>
            Promise.resolve({
              data:
                table === "profiles"
                  ? {
                      id: "mock-user-123",
                      xenocoins: 0,
                      cash: 0,
                      username: "Demo User",
                    }
                  : null,
              error: null,
            }),
          limit: (count: number) => Promise.resolve({ data: [], error: null }),
          then: (callback: any) => callback({ data: [], error: null }),
        }),
        order: (column: string, options?: any) => ({
          eq: (column: string, value: any) => ({
            limit: (count: number) =>
              Promise.resolve({ data: [], error: null }),
            then: (callback: any) => callback({ data: [], error: null }),
          }),
          limit: (count: number) => Promise.resolve({ data: [], error: null }),
          then: (callback: any) => callback({ data: [], error: null }),
        }),
        single: () =>
          Promise.resolve({
            data:
              table === "profiles"
                ? {
                    id: "mock-user-123",
                    xenocoins: 0,
                    cash: 0,
                    username: "Demo User",
                  }
                : null,
            error: null,
          }),
        limit: (count: number) => Promise.resolve({ data: [], error: null }),
        then: (callback: any) =>
          callback({
            data: [],
            error: null,
          }),
      }),
      insert: (data: any) => ({
        select: (columns?: string) => ({
          single: () =>
            Promise.resolve({ data: { id: "mock-id", ...data }, error: null }),
        }),
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => {
          console.log(`Mock update on ${table}:`, data);
          return Promise.resolve({ data: null, error: null });
        },
      }),
      delete: () => ({
        eq: (column: string, value: any) =>
          Promise.resolve({ data: null, error: null }),
      }),
      upsert: (data: any) => ({
        select: (columns?: string) => ({
          single: () =>
            Promise.resolve({ data: { id: "mock-id", ...data }, error: null }),
        }),
      }),
    };
    return mockQueryBuilder;
  },
  rpc: (functionName: string, params?: any) => {
    console.log(`Mock RPC call: ${functionName}`, params);
    return Promise.resolve({ data: true, error: null });
  },
  channel: () => ({
    on: () => ({ subscribe: () => Promise.resolve() }),
    unsubscribe: () => Promise.resolve(),
  }),
});

export const supabase = isMockMode
  ? (createMockClient() as any)
  : createClient<Database>(finalUrl, finalKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });

// Connection test function
export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const { error } = await supabase
      .from("profiles")
      .select("count", { count: "exact", head: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error("Supabase error:", error);

  // Handle network/fetch errors
  if (
    error?.name === "AuthRetryableFetchError" ||
    error?.message?.includes("Failed to fetch") ||
    error?.message?.includes("Connection failed")
  ) {
    return "Unable to connect to the server. Please check:\n1. Your internet connection\n2. If Supabase project is active\n3. CORS settings are configured correctly";
  }

  // Handle rate limiting errors
  if (error?.code === "over_email_send_rate_limit") {
    return "Too many requests. Please wait a moment before trying again.";
  }

  // Handle authentication errors
  if (
    error?.code === "invalid_credentials" ||
    error?.message === "Invalid login credentials"
  ) {
    return "Email ou senha inv��lidos. Por favor, verifique suas credenciais.";
  }

  if (error?.code === "PGRST301") {
    return "Insufficient permissions";
  }

  if (error?.code === "23505") {
    return "This item already exists";
  }

  if (error?.code === "23503") {
    return "Referenced item not found";
  }

  return error?.message || "An unexpected error occurred";
};

// Anti-cheat validation
export const validateGameAction = async (action: string, data: any) => {
  const maxValues = {
    xenocoins_gain: 10000,
    cash_gain: 100,
    pet_stat_change: 10, // Increased from 5 to 10 to accommodate items like Premium Elixir
    item_quantity: 100,
  };

  switch (action) {
    case "currency_gain":
      if (data.amount > maxValues.xenocoins_gain) {
        throw new Error("Invalid currency gain amount");
      }
      break;
    case "pet_stat_update":
      for (const [stat, value] of Object.entries(data.stats)) {
        if (Math.abs(value as number) > maxValues.pet_stat_change) {
          throw new Error(`Invalid stat change for ${stat}`);
        }
      }
      break;
    case "item_add":
      if (data.quantity > maxValues.item_quantity) {
        throw new Error("Invalid item quantity");
      }
      break;
  }

  return true;
};
