import { supabase } from "../lib/supabase";
import {
  logError,
  getErrorMessage,
  withErrorHandling,
} from "../utils/errorHandler";

export interface DatabaseStore {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface DatabaseShopItem {
  id: string;
  shop_id: string;
  item_id: string;
  price: number;
  currency: "xenocoins" | "cash";
  stock_limit: number | null;
  is_available: boolean;
  created_at: string;
}

export interface DatabaseItem {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  price: number;
  currency: "xenocoins" | "cash";
  effects: any;
  daily_limit: number | null;
  slot: string | null;
  image_url: string | null;
  is_tradeable: boolean;
  created_at: string;
}

export interface StoreWithItems extends DatabaseStore {
  shop_items: (DatabaseShopItem & {
    items: DatabaseItem;
  })[];
}

export class StoreService {
  private static instance: StoreService;

  public static getInstance(): StoreService {
    if (!StoreService.instance) {
      StoreService.instance = new StoreService();
    }
    return StoreService.instance;
  }

  /**
   * Get all active stores with their items
   */
  async getAllStores(): Promise<StoreWithItems[]> {
    return withErrorHandling(
      async () => {
        const { data, error } = await supabase
          .from("shops")
          .select(
            `
          *,
          shop_items (
            *,
            items (*)
          )
        `,
          )
          .eq("is_active", true)
          .order("name");

        if (error) throw error;
        return data || [];
      },
      "StoreService.getAllStores",
      [],
    );
  }

  /**
   * Get a specific store by ID
   */
  async getStoreById(storeId: string): Promise<StoreWithItems | null> {
    return withErrorHandling(
      async () => {
        const { data, error } = await supabase
          .from("shops")
          .select(
            `
          *,
          shop_items (
            *,
            items (*)
          )
        `,
          )
          .eq("id", storeId)
          .eq("is_active", true)
          .single();

        if (error) {
          if (error.code === "PGRST116") return null;
          throw error;
        }
        return data;
      },
      "StoreService.getStoreById",
      null,
    );
  }

  /**
   * Get all available items
   */
  async getAllItems(): Promise<DatabaseItem[]> {
    return withErrorHandling(
      async () => {
        const { data, error } = await supabase
          .from("items")
          .select("*")
          .order("name");

        if (error) throw error;
        return data || [];
      },
      "StoreService.getAllItems",
      [],
    );
  }

  /**
   * Get item by ID
   */
  async getItemById(itemId: string): Promise<DatabaseItem | null> {
    return withErrorHandling(
      async () => {
        const { data, error } = await supabase
          .from("items")
          .select("*")
          .eq("id", itemId)
          .single();

        if (error) {
          if (error.code === "PGRST116") return null;
          throw error;
        }
        return data;
      },
      "StoreService.getItemById",
      null,
    );
  }

  /**
   * Purchase an item from a store
   */
  async purchaseItem(
    userId: string,
    shopItemId: string,
    quantity: number = 1,
  ): Promise<{
    success: boolean;
    message: string;
    newBalance?: { xenocoins: number; cash: number };
  }> {
    return withErrorHandling(
      async () => {
        // Start a transaction-like operation
        const { data: shopItem, error: shopError } = await supabase
          .from("shop_items")
          .select(
            `
          *,
          items (*),
          shops (*)
        `,
          )
          .eq("id", shopItemId)
          .eq("is_available", true)
          .single();

        if (shopError) {
          if (shopError.code === "PGRST116") {
            return { success: false, message: "Item not found or unavailable" };
          }
          throw shopError;
        }

        if (!shopItem) {
          return { success: false, message: "Item not available" };
        }

        const totalCost = shopItem.price * quantity;

        // Check user's current balance
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("xenocoins, cash")
          .eq("id", userId)
          .single();

        if (profileError) throw profileError;

        const currentBalance =
          shopItem.currency === "xenocoins" ? profile.xenocoins : profile.cash;

        if (currentBalance < totalCost) {
          return {
            success: false,
            message: `Insufficient ${shopItem.currency}. You need ${totalCost.toLocaleString()} but have ${currentBalance.toLocaleString()}.`,
          };
        }

        // Check stock if limited
        if (shopItem.stock_limit !== null && shopItem.stock_limit < quantity) {
          return {
            success: false,
            message: `Not enough stock. Only ${shopItem.stock_limit} available.`,
          };
        }

        // Deduct currency
        const newBalance = currentBalance - totalCost;
        const updateField =
          shopItem.currency === "xenocoins" ? "xenocoins" : "cash";

        const { error: balanceError } = await supabase
          .from("profiles")
          .update({ [updateField]: newBalance })
          .eq("id", userId);

        if (balanceError) throw balanceError;

        // Add item to inventory
        const { error: inventoryError } = await supabase
          .from("inventory")
          .insert({
            user_id: userId,
            item_id: shopItem.item_id,
            quantity: quantity,
          });

        if (inventoryError) {
          // Rollback balance change
          await supabase
            .from("profiles")
            .update({ [updateField]: currentBalance })
            .eq("id", userId);
          throw inventoryError;
        }

        // Update stock if limited
        if (shopItem.stock_limit !== null) {
          const { error: stockError } = await supabase
            .from("shop_items")
            .update({ stock_limit: shopItem.stock_limit - quantity })
            .eq("id", shopItemId);

          if (stockError) {
            console.warn(
              "Failed to update stock:",
              getErrorMessage(stockError),
            );
          }
        }

        // Get updated balances
        const { data: updatedProfile } = await supabase
          .from("profiles")
          .select("xenocoins, cash")
          .eq("id", userId)
          .single();

        return {
          success: true,
          message: `Successfully purchased ${quantity}x ${shopItem.items.name}!`,
          newBalance: updatedProfile
            ? {
                xenocoins: updatedProfile.xenocoins,
                cash: updatedProfile.cash,
              }
            : undefined,
        };
      },
      "StoreService.purchaseItem",
      {
        success: false,
        message: "Purchase failed due to an unexpected error",
      },
    );
  }

  /**
   * Check if user can afford an item
   */
  async canAffordItem(
    userId: string,
    shopItemId: string,
    quantity: number = 1,
  ): Promise<boolean> {
    return withErrorHandling(
      async () => {
        const { data: shopItem, error: shopError } = await supabase
          .from("shop_items")
          .select("price, currency")
          .eq("id", shopItemId)
          .single();

        if (shopError) return false;

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("xenocoins, cash")
          .eq("id", userId)
          .single();

        if (profileError) return false;

        const totalCost = shopItem.price * quantity;
        const currentBalance =
          shopItem.currency === "xenocoins" ? profile.xenocoins : profile.cash;

        return currentBalance >= totalCost;
      },
      "StoreService.canAffordItem",
      false,
    );
  }

  /**
   * Search items by name or description
   */
  async searchItems(query: string): Promise<DatabaseItem[]> {
    return withErrorHandling(
      async () => {
        const { data, error } = await supabase
          .from("items")
          .select("*")
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .order("name");

        if (error) throw error;
        return data || [];
      },
      "StoreService.searchItems",
      [],
    );
  }
}

export const storeService = StoreService.getInstance();
