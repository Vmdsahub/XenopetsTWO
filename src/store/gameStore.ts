import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  GameState,
  Pet,
  Item,
  User,
  Notification,
  Achievement,
  Collectible,
  Quest,
  RedeemCode,
  WorldPosition,
} from "../types/game";
import { gameService } from "../services/gameService";
import { playNotificationSound } from "../utils/soundManager";

interface GameStore extends GameState {
  // Core actions
  setUser: (user: User | null) => void;
  setActivePet: (pet: Pet | null) => void;
  setCurrentScreen: (screen: string) => void;
  setViewedUserId: (userId: string | null) => void;

  // Planet management
  currentPlanet: { id: string; name: string; color: string } | null;
  setCurrentPlanet: (
    planet: { id: string; name: string; color: string } | null,
  ) => void;

  // World editing mode
  isWorldEditMode: boolean;
  setWorldEditMode: (enabled: boolean) => void;

  // Egg selection and hatching state
  selectedEggForHatching: any | null;
  isHatchingInProgress: boolean;
  hatchingEgg: {
    eggData: any;
    startTime: Date;
    userId: string; // Track which user this hatching belongs to
  } | null;
  setSelectedEggForHatching: (eggData: any) => void;
  clearSelectedEggForHatching: () => void;
  setIsHatchingInProgress: (isHatching: boolean) => void;
  setHatchingEgg: (eggData: any) => void;
  clearHatchingEgg: () => void;
  getHatchingTimeRemaining: () => number;

  // Pet management
  createPet: (
    petData: Omit<Pet, "id" | "createdAt" | "updatedAt">,
  ) => Promise<Pet | null>;
  updatePetStats: (petId: string, stats: Partial<Pet>) => Promise<boolean>;

  // Currency management
  updateCurrency: (
    type: "xenocoins" | "cash",
    amount: number,
  ) => Promise<boolean>;

  // Inventory management
  addToInventory: (item: Item) => Promise<boolean>;
  removeFromInventory: (
    inventoryItemId: string,
    quantity?: number,
  ) => Promise<boolean>;
  useItem: (inventoryItemId: string, petId: string) => Promise<boolean>;
  getUniversalItem: (slug: string) => Promise<Item | null>;

  // Store management
  getAllStores: () => Store[];
  getStoreById: (storeId: string) => Store | null;
  getStoresByType: (type: StoreType) => Store[];
  purchaseStoreItem: (
    storeId: string,
    itemId: string,
    quantity?: number,
  ) => Promise<PurchaseResult>;
  getStoreInventory: (storeId: string) => StoreItem[];
  restockStore: (storeId: string) => Promise<boolean>;

  // Notifications
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt">,
  ) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearNotifications: () => void;

  // Achievements and collectibles
  loadUserAchievements: (userId?: string) => Promise<void>;
  loadUserCollectibles: (userId?: string) => Promise<void>;
  getAllCollectibles: () => Collectible[];
  getCollectiblesByType: (type: string) => Collectible[];
  getCollectedCollectibles: () => Collectible[];
  getTotalCollectiblePoints: () => number;
  collectItem: (collectibleName: string) => Promise<boolean>;

  // Player search and profiles
  searchPlayers: (query: string) => Promise<User[]>;
  getPlayerProfile: (userId: string) => Promise<User | null>;

  // Redeem codes
  getAllRedeemCodes: () => RedeemCode[];
  getActiveRedeemCodes: () => RedeemCode[];
  createRedeemCode: (
    codeData: Omit<RedeemCode, "id" | "createdAt" | "currentUses" | "usedBy">,
  ) => void;
  updateRedeemCode: (codeId: string, updates: Partial<RedeemCode>) => void;
  deleteRedeemCode: (codeId: string) => void;
  redeemCode: (code: string) => Promise<{ success: boolean; message: string }>;

  // Daily check-in system
  dailyCheckin: () => void;
  canClaimDailyCheckin: () => boolean;
  getDailyCheckinStreak: () => number;
  canClaimWeeklyReward: () => boolean;
  claimWeeklyReward: () => void;

  // Ship state management
  updateShipState: (shipState: {
    x: number;
    y: number;
    angle: number;
    vx: number;
    vy: number;
    cameraX: number;
    cameraY: number;
  }) => void;
  getShipState: () => {
    x: number;
    y: number;
    angle: number;
    vx: number;
    vy: number;
    cameraX: number;
    cameraY: number;
  } | null;

  // World positions management
  worldPositions: WorldPosition[];
  setWorldPositions: (positions: WorldPosition[]) => void;
  updateWorldPosition: (
    worldId: string,
    updates: Partial<WorldPosition>,
  ) => void;
  loadWorldPositions: () => Promise<void>;
  subscribeToWorldPositions: () => void;
  unsubscribeFromWorldPositions: () => void;

  // Data loading and synchronization
  initializeNewUser: (userData: User) => void;
  loadUserData: (userId: string) => Promise<void>;
  subscribeToRealtimeUpdates: () => void;
  unsubscribeFromRealtimeUpdates: () => void;
}

// Store-related types
export interface Store {
  id: string;
  name: string;
  description: string;
  type: StoreType;
  npcName: string;
  npcImage: string;
  npcDialogue: string;

  inventory: StoreItem[];
  restockSchedule: RestockSchedule;
  specialOffers: SpecialOffer[];
  isOpen: boolean;
  openHours: { start: number; end: number };
  reputation: number;
  discountLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreItem {
  id: string;
  itemSlug: string;
  basePrice: number;
  currentPrice: number;
  currency: "xenocoins" | "cash";
  stock: number;
  maxStock: number;
  restockRate: number;
  isLimited: boolean;
  isOnSale: boolean;
  saleDiscount: number;
  requirements?: ItemRequirement[];
  lastRestocked: Date;
}

export interface ItemRequirement {
  type: "level" | "achievement" | "item" | "currency" | "reputation";
  value: string | number;
  description: string;
}

export interface RestockSchedule {
  interval: number; // hours
  lastRestock: Date;
  nextRestock: Date;
  items: string[]; // item slugs to restock
}

export interface SpecialOffer {
  id: string;
  name: string;
  description: string;
  itemSlug: string;
  originalPrice: number;
  salePrice: number;
  currency: "xenocoins" | "cash";
  startDate: Date;
  endDate: Date;
  maxPurchases: number;
  currentPurchases: number;
  isActive: boolean;
}

export interface PurchaseResult {
  success: boolean;
  message: string;
  item?: Item;
  totalCost: number;
  currency: "xenocoins" | "cash";
  newBalance: number;
}

export type StoreType =
  | "general"
  | "equipment"
  | "food"
  | "potions"
  | "collectibles"
  | "premium"
  | "seasonal";

// Mock store data - in a real app, this would come from your database
const mockStores: Store[] = [
  {
    id: "woodland-general",
    name: "Woodland General Store",
    description:
      "Your one-stop shop for basic pet care items and everyday necessities",
    type: "general",
    npcName: "Merchant Maya",
    npcImage:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200",
    npcDialogue:
      "Welcome to my shop, traveler! I have the finest items for your pets. What can I help you find today?",

    inventory: [
      {
        id: "si1",
        itemSlug: "health-potion-1",
        basePrice: 50,
        currentPrice: 50,
        currency: "xenocoins",
        stock: 25,
        maxStock: 50,
        restockRate: 5,
        isLimited: false,
        isOnSale: false,
        saleDiscount: 0,
        lastRestocked: new Date(),
      },
      {
        id: "si2",
        itemSlug: "magic-apple-1",
        basePrice: 25,
        currentPrice: 20,
        currency: "xenocoins",
        stock: 30,
        maxStock: 40,
        restockRate: 8,
        isLimited: false,
        isOnSale: true,
        saleDiscount: 20,
        lastRestocked: new Date(),
      },
      {
        id: "si3",
        itemSlug: "happiness-toy-1",
        basePrice: 30,
        currentPrice: 30,
        currency: "xenocoins",
        stock: 15,
        maxStock: 20,
        restockRate: 3,
        isLimited: false,
        isOnSale: false,
        saleDiscount: 0,
        lastRestocked: new Date(),
      },
    ],
    restockSchedule: {
      interval: 6,
      lastRestock: new Date(),
      nextRestock: new Date(Date.now() + 6 * 60 * 60 * 1000),
      items: ["health-potion-1", "magic-apple-1", "happiness-toy-1"],
    },
    specialOffers: [
      {
        id: "weekly-apple-deal",
        name: "Weekly Apple Special",
        description: "Get Magic Apples at 20% off this week!",
        itemSlug: "magic-apple-1",
        originalPrice: 25,
        salePrice: 20,
        currency: "xenocoins",
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        maxPurchases: 100,
        currentPurchases: 23,
        isActive: true,
      },
    ],
    isOpen: true,
    openHours: { start: 6, end: 22 },
    reputation: 0,
    discountLevel: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "oasis-trading",
    name: "Oasis Trading Post",
    description: "Rare items and equipment for the adventurous explorer",
    type: "equipment",
    npcName: "Desert Trader Zara",
    npcImage:
      "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=200",
    npcDialogue:
      "Ah, a fellow traveler! The desert has been kind to me, and I have rare treasures to share. Perhaps something for your companions?",

    inventory: [
      {
        id: "si4",
        itemSlug: "energy-drink-1",
        basePrice: 75,
        currentPrice: 75,
        currency: "xenocoins",
        stock: 12,
        maxStock: 15,
        restockRate: 2,
        isLimited: false,
        isOnSale: false,
        saleDiscount: 0,
        lastRestocked: new Date(),
      },
      {
        id: "si5",
        itemSlug: "desert-crystal-1",
        basePrice: 200,
        currentPrice: 200,
        currency: "xenocoins",
        stock: 5,
        maxStock: 8,
        restockRate: 1,
        isLimited: true,
        isOnSale: false,
        saleDiscount: 0,
        requirements: [
          {
            type: "level",
            value: 5,
            description: "Requires pet level 5 or higher",
          },
        ],
        lastRestocked: new Date(),
      },
    ],
    restockSchedule: {
      interval: 12,
      lastRestock: new Date(),
      nextRestock: new Date(Date.now() + 12 * 60 * 60 * 1000),
      items: ["energy-drink-1", "desert-crystal-1"],
    },
    specialOffers: [],
    isOpen: true,
    openHours: { start: 8, end: 20 },
    reputation: 0,
    discountLevel: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mountain-armory",
    name: "Mountain Armory",
    description: "Premium equipment and weapons for serious trainers",
    type: "equipment",
    npcName: "Blacksmith Boris",
    npcImage:
      "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=200",
    npcDialogue:
      "Welcome to my forge! These mountains provide the finest materials for crafting. Your pets deserve the best protection and weapons!",

    inventory: [
      {
        id: "si6",
        itemSlug: "iron-armor-1",
        basePrice: 500,
        currentPrice: 500,
        currency: "xenocoins",
        stock: 3,
        maxStock: 5,
        restockRate: 1,
        isLimited: true,
        isOnSale: false,
        saleDiscount: 0,
        requirements: [
          {
            type: "level",
            value: 10,
            description: "Requires pet level 10 or higher",
          },
        ],
        lastRestocked: new Date(),
      },
      {
        id: "si7",
        itemSlug: "crystal-sword-1",
        basePrice: 1000,
        currentPrice: 1000,
        currency: "xenocoins",
        stock: 2,
        maxStock: 3,
        restockRate: 1,
        isLimited: true,
        isOnSale: false,
        saleDiscount: 0,
        requirements: [
          {
            type: "level",
            value: 15,
            description: "Requires pet level 15 or higher",
          },
          {
            type: "achievement",
            value: "First Battle Victory",
            description: "Must have won at least one battle",
          },
        ],
        lastRestocked: new Date(),
      },
      {
        id: "si8",
        itemSlug: "premium-elixir-1",
        basePrice: 5,
        currentPrice: 5,
        currency: "cash",
        stock: 10,
        maxStock: 10,
        restockRate: 2,
        isLimited: false,
        isOnSale: false,
        saleDiscount: 0,
        lastRestocked: new Date(),
      },
    ],
    restockSchedule: {
      interval: 24,
      lastRestock: new Date(),
      nextRestock: new Date(Date.now() + 24 * 60 * 60 * 1000),
      items: ["iron-armor-1", "crystal-sword-1", "premium-elixir-1"],
    },
    specialOffers: [],
    isOpen: true,
    openHours: { start: 7, end: 19 },
    reputation: 0,
    discountLevel: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock universal items database
const universalItems: Record<string, Item> = {
  "health-potion-1": {
    id: "health-potion-1",
    slug: "health-potion-1",
    name: "Health Potion",
    description: "A magical elixir that restores 5 health points instantly",
    type: "Potion",
    rarity: "Common",
    price: 50,
    currency: "xenocoins",
    effects: { health: 5 },
    dailyLimit: 10,
    quantity: 1,
    createdAt: new Date(),
  },
  "magic-apple-1": {
    id: "magic-apple-1",
    slug: "magic-apple-1",
    name: "Magic Apple",
    description: "A mystical fruit that restores hunger and provides energy",
    type: "Food",
    rarity: "Uncommon",
    price: 25,
    currency: "xenocoins",
    effects: { hunger: 3, happiness: 1 },
    quantity: 1,
    createdAt: new Date(),
  },
  "happiness-toy-1": {
    id: "happiness-toy-1",
    slug: "happiness-toy-1",
    name: "Happiness Toy",
    description: "A colorful toy that brings joy to pets",
    type: "Special",
    rarity: "Common",
    price: 30,
    currency: "xenocoins",
    effects: { happiness: 2 },
    dailyLimit: 5,
    quantity: 1,
    createdAt: new Date(),
  },
  "energy-drink-1": {
    id: "energy-drink-1",
    slug: "energy-drink-1",
    name: "Energy Drink",
    description: "A refreshing beverage that boosts pet stats temporarily",
    type: "Potion",
    rarity: "Uncommon",
    price: 75,
    currency: "xenocoins",
    effects: { speed: 2, dexterity: 1 },
    dailyLimit: 3,
    quantity: 1,
    createdAt: new Date(),
  },
  "desert-crystal-1": {
    id: "desert-crystal-1",
    slug: "desert-crystal-1",
    name: "Desert Crystal",
    description: "A rare crystal that enhances magical abilities",
    type: "Special",
    rarity: "Rare",
    price: 200,
    currency: "xenocoins",
    effects: { intelligence: 3, luck: 1 },
    quantity: 1,
    createdAt: new Date(),
  },
  "iron-armor-1": {
    id: "iron-armor-1",
    slug: "iron-armor-1",
    name: "Iron Armor",
    description: "Sturdy armor that provides excellent protection",
    type: "Equipment",
    rarity: "Rare",
    price: 500,
    currency: "xenocoins",
    effects: { defense: 5, health: 2 },
    slot: "torso",
    quantity: 1,
    createdAt: new Date(),
  },
  "crystal-sword-1": {
    id: "crystal-sword-1",
    slug: "crystal-sword-1",
    name: "Crystal Sword",
    description: "A magnificent sword forged from mountain crystals",
    type: "Weapon",
    rarity: "Epic",
    price: 1000,
    currency: "xenocoins",
    effects: { attack: 8, strength: 3 },
    slot: "weapon",
    quantity: 1,
    createdAt: new Date(),
  },
  "premium-elixir-1": {
    id: "premium-elixir-1",
    slug: "premium-elixir-1",
    name: "Premium Elixir",
    description: "An exclusive elixir that dramatically boosts all stats",
    type: "Potion",
    rarity: "Legendary",
    price: 5,
    currency: "cash",
    effects: {
      health: 3,
      happiness: 3,
      strength: 2,
      dexterity: 2,
      intelligence: 2,
    },
    dailyLimit: 1,
    quantity: 1,
    createdAt: new Date(),
  },
};

// Helper function to convert date strings back to Date objects
const rehydrateDates = (obj: any): any => {
  if (!obj) return obj;

  if (
    typeof obj === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)
  ) {
    return new Date(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(rehydrateDates);
  }

  if (typeof obj === "object") {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (
        key.includes("At") ||
        key.includes("Date") ||
        key === "createdAt" ||
        key === "updatedAt" ||
        key === "lastLogin" ||
        key === "hatchTime" ||
        key === "deathDate" ||
        key === "lastInteraction"
      ) {
        result[key] = typeof value === "string" ? new Date(value) : value;
      } else {
        result[key] = rehydrateDates(value);
      }
    }
    return result;
  }

  return obj;
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      activePet: null,
      pets: [],
      inventory: [],
      xenocoins: 0,
      cash: 0,
      notifications: [],
      language: "pt-BR",
      currentScreen: "pet",
      currentPlanet: null,
      isWorldEditMode: false,
      achievements: [],
      collectibles: [],
      quests: [],
      redeemCodes: [
        {
          id: "alpha-code-1",
          code: "ALPHA2025",
          name: "Pacote Alpha",
          description: "Recompensas especiais para jogadores alpha",
          rewards: {
            xenocoins: 5000,
            cash: 50,
            collectibles: ["Ovo Alpha"],
            accountPoints: 1000,
          },
          maxUses: 100,
          currentUses: 0,
          isActive: true,
          createdBy: "system",
          createdAt: new Date(),
          usedBy: [],
        },
        {
          id: "welcome-code-1",
          code: "WELCOME",
          name: "Pacote de Boas-vindas",
          description: "Recompensas para novos jogadores",
          rewards: {
            xenocoins: 1000,
            cash: 10,
            accountPoints: 100,
          },
          maxUses: -1,
          currentUses: 0,
          isActive: true,
          createdBy: "system",
          createdAt: new Date(),
          usedBy: [],
        },
      ],
      viewedUserId: null,
      shipState: null,

      // World positions state
      worldPositions: [],

      // Egg selection and hatching state
      selectedEggForHatching: null,
      isHatchingInProgress: false,
      hatchingEgg: null,

      // Core actions
      setUser: (user) => {
        const state = get();

        // If switching to a different user, clear egg hatching state
        if (user && state.user && user.id !== state.user.id) {
          set({
            user,
            selectedEggForHatching: null,
            isHatchingInProgress: false,
            hatchingEgg: null,
          });
        } else if (!user) {
          // Logging out, clear all user-specific state and localStorage
          if (state.user) {
            // Clear user-specific localStorage items
            localStorage.removeItem(`lastCheckin_${state.user.id}`);
            localStorage.removeItem(`checkinStreak_${state.user.id}`);
          }

          set({
            user: null,
            pets: [],
            inventory: [],
            xenocoins: 0,
            cash: 0,
            notifications: [],
            achievements: [],
            collectibles: [],
            selectedEggForHatching: null,
            isHatchingInProgress: false,
            hatchingEgg: null,
          });
        } else {
          set({ user });
        }
      },
      setActivePet: (pet) => set({ activePet: pet }),
      setCurrentScreen: (screen) => set({ currentScreen: screen }),
      setViewedUserId: (userId) => set({ viewedUserId: userId }),
      setCurrentPlanet: (planet) => set({ currentPlanet: planet }),

      // World editing mode
      setWorldEditMode: (enabled) => {
        const state = get();
        // Only allow admins to enable world edit mode
        if (enabled && !state.user?.isAdmin) {
          console.warn("⚠️ Only admins can enable world edit mode");
          return;
        }
        set({ isWorldEditMode: enabled });
      },

      // Egg selection and hatching actions
      setSelectedEggForHatching: (eggData) =>
        set({ selectedEggForHatching: eggData }),
      clearSelectedEggForHatching: () => set({ selectedEggForHatching: null }),
      setIsHatchingInProgress: (isHatching) =>
        set({ isHatchingInProgress: isHatching }),
      setHatchingEgg: (eggData) => {
        const state = get();
        if (!state.user) return;

        set({
          hatchingEgg: {
            eggData,
            startTime: new Date(),
            userId: state.user.id,
          },
        });
      },
      clearHatchingEgg: () => set({ hatchingEgg: null }),
      getHatchingTimeRemaining: () => {
        const state = get();
        if (!state.hatchingEgg || !state.user) return 0;

        // Check if the hatching egg belongs to the current user
        if (state.hatchingEgg.userId !== state.user.id) {
          // Clear invalid hatching state
          get().clearHatchingEgg();
          return 0;
        }

        const elapsedTime = Date.now() - state.hatchingEgg.startTime.getTime();
        const hatchingDuration = 3 * 60 * 1000; // 3 minutes in milliseconds
        return Math.max(0, hatchingDuration - elapsedTime);
      },

      // Pet management
      createPet: async (petData) => {
        try {
          const newPet = await gameService.createPet(petData);
          if (newPet) {
            set((state) => ({
              pets: [...state.pets, newPet],
              activePet: state.activePet || newPet,
            }));
          }
          return newPet;
        } catch (error) {
          console.error("Error creating pet:", error);
          return null;
        }
      },

      updatePetStats: async (petId, stats) => {
        try {
          const success = await gameService.updatePetStats(petId, stats);
          if (success) {
            set((state) => ({
              pets: state.pets.map((pet) =>
                pet.id === petId
                  ? { ...pet, ...stats, updatedAt: new Date() }
                  : pet,
              ),
              activePet:
                state.activePet?.id === petId
                  ? { ...state.activePet, ...stats, updatedAt: new Date() }
                  : state.activePet,
            }));
          }
          return success;
        } catch (error) {
          console.error("Error updating pet stats:", error);
          return false;
        }
      },

      // Currency management
      updateCurrency: async (type, amount) => {
        const state = get();
        if (!state.user) return false;

        try {
          const success = await gameService.updateUserCurrency(
            state.user.id,
            type,
            amount,
          );
          if (success) {
            set((state) => ({
              [type]: Math.max(0, state[type] + amount),
            }));
          }
          return success;
        } catch (error) {
          console.error("Error updating currency:", error);
          return false;
        }
      },

      // Inventory management
      addToInventory: async (item) => {
        const state = get();
        if (!state.user) return false;

        try {
          const result = await gameService.addItemToInventory(
            state.user.id,
            item.id,
          );
          if (result) {
            // Check if item already exists in inventory
            const existingItemIndex = state.inventory.findIndex(
              (invItem) => invItem.id === item.id && !invItem.isEquipped,
            );

            if (existingItemIndex >= 0) {
              // Update quantity of existing item
              set((state) => ({
                inventory: state.inventory.map((invItem, index) =>
                  index === existingItemIndex
                    ? { ...invItem, quantity: invItem.quantity + item.quantity }
                    : invItem,
                ),
              }));
            } else {
              // Add new item to inventory
              set((state) => ({
                inventory: [
                  ...state.inventory,
                  { ...item, inventoryId: result.id },
                ],
              }));
            }
          }
          return !!result;
        } catch (error) {
          console.error("Error adding item to inventory:", error);
          return false;
        }
      },

      removeFromInventory: async (inventoryItemId, quantity = 1) => {
        const state = get();
        if (!state.user) return false;

        try {
          const success = await gameService.removeItemFromInventory(
            state.user.id,
            inventoryItemId,
            quantity,
          );
          if (success) {
            set((state) => {
              const itemIndex = state.inventory.findIndex(
                (item) => (item.inventoryId || item.id) === inventoryItemId,
              );

              if (itemIndex >= 0) {
                const item = state.inventory[itemIndex];
                const newQuantity = item.quantity - quantity;

                if (newQuantity <= 0) {
                  // Remove item completely
                  return {
                    inventory: state.inventory.filter(
                      (_, index) => index !== itemIndex,
                    ),
                  };
                } else {
                  // Update quantity
                  return {
                    inventory: state.inventory.map((invItem, index) =>
                      index === itemIndex
                        ? { ...invItem, quantity: newQuantity }
                        : invItem,
                    ),
                  };
                }
              }
              return state;
            });
          }
          return success;
        } catch (error) {
          console.error("Error removing item from inventory:", error);
          return false;
        }
      },

      useItem: async (inventoryItemId, petId) => {
        const state = get();
        const item = state.inventory.find(
          (i) => (i.inventoryId || i.id) === inventoryItemId,
        );
        const pet = state.pets.find((p) => p.id === petId);

        if (!item || !pet || !item.effects) return false;

        try {
          // Apply item effects to pet
          const statUpdates: Partial<Pet> = {};
          let hasValidEffects = false;

          Object.entries(item.effects).forEach(([stat, value]) => {
            if (typeof value === "number") {
              switch (stat) {
                case "health":
                  statUpdates.health = Math.min(10, pet.health + value);
                  hasValidEffects = true;
                  break;
                case "happiness":
                  statUpdates.happiness = Math.min(10, pet.happiness + value);
                  hasValidEffects = true;
                  break;
                case "hunger":
                  statUpdates.hunger = Math.min(10, pet.hunger + value);
                  hasValidEffects = true;
                  break;
                case "strength":
                  statUpdates.strength = pet.strength + value;
                  hasValidEffects = true;
                  break;
                case "dexterity":
                  statUpdates.dexterity = pet.dexterity + value;
                  hasValidEffects = true;
                  break;
                case "intelligence":
                  statUpdates.intelligence = pet.intelligence + value;
                  hasValidEffects = true;
                  break;
                case "speed":
                  statUpdates.speed = pet.speed + value;
                  hasValidEffects = true;
                  break;
                case "attack":
                  statUpdates.attack = pet.attack + value;
                  hasValidEffects = true;
                  break;
                case "defense":
                  statUpdates.defense = pet.defense + value;
                  hasValidEffects = true;
                  break;
                case "precision":
                  statUpdates.precision = pet.precision + value;
                  hasValidEffects = true;
                  break;
                case "evasion":
                  statUpdates.evasion = pet.evasion + value;
                  hasValidEffects = true;
                  break;
                case "luck":
                  statUpdates.luck = pet.luck + value;
                  hasValidEffects = true;
                  break;
              }
            }
          });

          if (!hasValidEffects) {
            get().addNotification({
              type: "warning",
              title: "Item sem efeito",
              message: "Este item não tem efeitos aplicáveis ao seu pet.",
              isRead: false,
            });
            return false;
          }

          // Update pet stats
          const updateSuccess = await get().updatePetStats(petId, statUpdates);
          if (!updateSuccess) return false;

          // Remove item from inventory
          const removeSuccess = await get().removeFromInventory(
            inventoryItemId,
            1,
          );
          if (!removeSuccess) return false;

          // Show success notification
          get().addNotification({
            type: "success",
            title: "Item usado!",
            message: `${item.name} foi usado em ${pet.name}. Efeitos aplicados com sucesso!`,
            isRead: false,
          });

          return true;
        } catch (error) {
          console.error("Error using item:", error);
          get().addNotification({
            type: "error",
            title: "Erro",
            message: "Ocorreu um erro ao usar o item.",
            isRead: false,
          });
          return false;
        }
      },

      getUniversalItem: async (slug) => {
        try {
          // First try to get from local mock data
          if (universalItems[slug]) {
            return { ...universalItems[slug] };
          }

          // Fallback to database lookup
          const item = await gameService.getItemByName(slug.replace(/-/g, " "));
          return item;
        } catch (error) {
          console.error("Error getting universal item:", error);
          return null;
        }
      },

      // Store management
      getAllStores: () => mockStores,

      getStoreById: (storeId) => {
        return mockStores.find((store) => store.id === storeId) || null;
      },

      getStoresByType: (type) => {
        return mockStores.filter((store) => store.type === type);
      },

      purchaseStoreItem: async (storeId, itemId, quantity = 1) => {
        const state = get();
        const store = get().getStoreById(storeId);

        if (!store || !state.user) {
          return {
            success: false,
            message: "Store or user not found",
            totalCost: 0,
            currency: "xenocoins",
            newBalance: 0,
          };
        }

        const storeItem = store.inventory.find((item) => item.id === itemId);
        if (!storeItem) {
          return {
            success: false,
            message: "Item not found in store",
            totalCost: 0,
            currency: "xenocoins",
            newBalance: 0,
          };
        }

        // Check stock
        if (storeItem.stock < quantity) {
          return {
            success: false,
            message: `Insufficient stock. Only ${storeItem.stock} available.`,
            totalCost: 0,
            currency: storeItem.currency,
            newBalance: state[storeItem.currency],
          };
        }

        // Check requirements
        if (storeItem.requirements) {
          for (const req of storeItem.requirements) {
            if (req.type === "level" && state.activePet) {
              if (state.activePet.level < req.value) {
                return {
                  success: false,
                  message: req.description,
                  totalCost: 0,
                  currency: storeItem.currency,
                  newBalance: state[storeItem.currency],
                };
              }
            }
            // Add other requirement checks as needed
          }
        }

        const totalCost = storeItem.currentPrice * quantity;
        const currentBalance = state[storeItem.currency];

        // Check if user has enough currency
        if (currentBalance < totalCost) {
          return {
            success: false,
            message: `Insufficient ${storeItem.currency}. Need ${totalCost}, have ${currentBalance}.`,
            totalCost,
            currency: storeItem.currency,
            newBalance: currentBalance,
          };
        }

        try {
          // Get the universal item
          const universalItem = await get().getUniversalItem(
            storeItem.itemSlug,
          );
          if (!universalItem) {
            return {
              success: false,
              message: "Item data not found",
              totalCost,
              currency: storeItem.currency,
              newBalance: currentBalance,
            };
          }

          // Deduct currency
          const currencySuccess = await get().updateCurrency(
            storeItem.currency,
            -totalCost,
          );
          if (!currencySuccess) {
            return {
              success: false,
              message: "Failed to process payment",
              totalCost,
              currency: storeItem.currency,
              newBalance: currentBalance,
            };
          }

          // Add item to inventory
          const itemToAdd = { ...universalItem, quantity };
          const inventorySuccess = await get().addToInventory(itemToAdd);
          if (!inventorySuccess) {
            // Refund currency if inventory addition failed
            await get().updateCurrency(storeItem.currency, totalCost);
            return {
              success: false,
              message: "Failed to add item to inventory",
              totalCost,
              currency: storeItem.currency,
              newBalance: currentBalance,
            };
          }

          // Update store stock
          const storeIndex = mockStores.findIndex((s) => s.id === storeId);
          if (storeIndex >= 0) {
            const itemIndex = mockStores[storeIndex].inventory.findIndex(
              (i) => i.id === itemId,
            );
            if (itemIndex >= 0) {
              mockStores[storeIndex].inventory[itemIndex].stock -= quantity;
            }
          }

          const newBalance = currentBalance - totalCost;

          // Add success notification
          get().addNotification({
            type: "success",
            title: "Purchase Successful!",
            message: `Purchased ${quantity}x ${universalItem.name} for ${totalCost} ${storeItem.currency}`,
            isRead: false,
          });

          return {
            success: true,
            message: "Purchase completed successfully",
            item: universalItem,
            totalCost,
            currency: storeItem.currency,
            newBalance,
          };
        } catch (error) {
          console.error("Error during purchase:", error);
          return {
            success: false,
            message: "An error occurred during purchase",
            totalCost,
            currency: storeItem.currency,
            newBalance: currentBalance,
          };
        }
      },

      getStoreInventory: (storeId) => {
        const store = get().getStoreById(storeId);
        return store ? store.inventory : [];
      },

      restockStore: async (storeId) => {
        const store = get().getStoreById(storeId);
        if (!store) return false;

        try {
          const storeIndex = mockStores.findIndex((s) => s.id === storeId);
          if (storeIndex >= 0) {
            // Restock items based on restock rate
            mockStores[storeIndex].inventory.forEach((item) => {
              const newStock = Math.min(
                item.maxStock,
                item.stock + item.restockRate,
              );
              item.stock = newStock;
              item.lastRestocked = new Date();
            });

            // Update restock schedule
            const now = new Date();
            mockStores[storeIndex].restockSchedule.lastRestock = now;
            mockStores[storeIndex].restockSchedule.nextRestock = new Date(
              now.getTime() + store.restockSchedule.interval * 60 * 60 * 1000,
            );

            return true;
          }
          return false;
        } catch (error) {
          console.error("Error restocking store:", error);
          return false;
        }
      },

      // Notifications
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep only last 50
        }));

        // Play notification sound
        try {
          playNotificationSound();
        } catch (error) {
          console.error("Error playing notification sound:", error);
        }
      },

      markNotificationAsRead: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification,
          ),
        }));
      },

      markAllNotificationsAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            isRead: true,
          })),
        }));
      },

      deleteNotification: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.filter(
            (n) => n.id !== notificationId,
          ),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      // Achievements and collectibles
      loadUserAchievements: async (userId) => {
        try {
          const userIdToUse = userId || get().user?.id;
          if (!userIdToUse) return;

          const achievements =
            await gameService.getUserAchievements(userIdToUse);
          set({ achievements });
        } catch (error) {
          console.error("Error loading achievements:", error);
        }
      },

      loadUserCollectibles: async (userId) => {
        try {
          const userIdToUse = userId || get().user?.id;
          if (!userIdToUse) return;

          const collectibles =
            await gameService.getUserCollectedCollectibles(userIdToUse);
          set({ collectibles });
        } catch (error) {
          console.error("Error loading collectibles:", error);
        }
      },

      getAllCollectibles: () => {
        // Mock collectibles data - in a real app, this would come from your database
        return [
          {
            id: "1",
            name: "Ovo Alpha",
            type: "egg",
            rarity: "Unique",
            description:
              "Distribuído através de código para jogadores do alpha",
            isCollected: false,
            accountPoints: 100,
            obtainMethod: "Redeem code",
          },
          {
            id: "2",
            name: "Peixe Dourado",
            type: "fish",
            rarity: "Epic",
            description: "Um peixe lendário dos oceanos profundos",
            isCollected: false,
            accountPoints: 50,
            obtainMethod: "Fishing",
          },
        ] as Collectible[];
      },

      getCollectiblesByType: (type) => {
        return get()
          .getAllCollectibles()
          .filter((c) => c.type === type);
      },

      getCollectedCollectibles: () => {
        return get().collectibles.filter((c) => c.isCollected);
      },

      getTotalCollectiblePoints: () => {
        return get()
          .getCollectedCollectibles()
          .reduce((total, c) => total + c.accountPoints, 0);
      },

      collectItem: async (collectibleName) => {
        const state = get();
        if (!state.user) return false;

        try {
          const success = await gameService.addUserCollectible(
            state.user.id,
            collectibleName,
          );
          if (success) {
            // Reload collectibles
            await get().loadUserCollectibles();

            get().addNotification({
              type: "success",
              title: "Collectible Obtained!",
              message: `You collected: ${collectibleName}`,
              isRead: false,
            });
          }
          return success;
        } catch (error) {
          console.error("Error collecting item:", error);
          return false;
        }
      },

      // Player search and profiles
      searchPlayers: async (query) => {
        try {
          return await gameService.searchPlayers(query);
        } catch (error) {
          console.error("Error searching players:", error);
          return [];
        }
      },

      getPlayerProfile: async (userId) => {
        try {
          return await gameService.getPlayerProfile(userId);
        } catch (error) {
          console.error("Error getting player profile:", error);
          return null;
        }
      },

      // Redeem codes
      getAllRedeemCodes: () => get().redeemCodes,

      getActiveRedeemCodes: () => {
        const now = new Date();
        return get().redeemCodes.filter(
          (code) =>
            code.isActive &&
            (code.maxUses === -1 || code.currentUses < code.maxUses) &&
            (!code.expiresAt || code.expiresAt > now),
        );
      },

      createRedeemCode: (codeData) => {
        const newCode: RedeemCode = {
          ...codeData,
          id: crypto.randomUUID(),
          currentUses: 0,
          usedBy: [],
          createdAt: new Date(),
        };

        set((state) => ({
          redeemCodes: [...state.redeemCodes, newCode],
        }));
      },

      updateRedeemCode: (codeId, updates) => {
        set((state) => ({
          redeemCodes: state.redeemCodes.map((code) =>
            code.id === codeId ? { ...code, ...updates } : code,
          ),
        }));
      },

      deleteRedeemCode: (codeId) => {
        set((state) => ({
          redeemCodes: state.redeemCodes.filter((code) => code.id !== codeId),
        }));
      },

      redeemCode: async (code) => {
        const state = get();
        if (!state.user) {
          return { success: false, message: "User not logged in" };
        }

        const redeemCode = state.redeemCodes.find(
          (rc) => rc.code.toUpperCase() === code.toUpperCase() && rc.isActive,
        );

        if (!redeemCode) {
          return { success: false, message: "Código inválido ou expirado" };
        }

        // Check if user already used this code
        if (redeemCode.usedBy.includes(state.user.id)) {
          return { success: false, message: "Você já resgatou este código" };
        }

        // Check usage limits
        if (
          redeemCode.maxUses !== -1 &&
          redeemCode.currentUses >= redeemCode.maxUses
        ) {
          return {
            success: false,
            message: "Este código atingiu o limite de usos",
          };
        }

        // Check expiration
        if (redeemCode.expiresAt && redeemCode.expiresAt < new Date()) {
          return { success: false, message: "Este código expirou" };
        }

        try {
          // Apply rewards
          const rewards = redeemCode.rewards;
          let rewardMessages: string[] = [];

          // Currency rewards
          if (rewards.xenocoins && rewards.xenocoins > 0) {
            await get().updateCurrency("xenocoins", rewards.xenocoins);
            rewardMessages.push(`${rewards.xenocoins} Xenocoins`);
          }

          if (rewards.cash && rewards.cash > 0) {
            await get().updateCurrency("cash", rewards.cash);
            rewardMessages.push(`${rewards.cash} Cash`);
          }

          // Account points
          if (rewards.accountPoints && rewards.accountPoints > 0) {
            // Update account score (this would be handled by the backend in a real app)
            if (state.user) {
              const updatedUser = {
                ...state.user,
                accountScore: state.user.accountScore + rewards.accountPoints,
              };
              set({ user: updatedUser });
              rewardMessages.push(`${rewards.accountPoints} pontos de conta`);
            }
          }

          // Collectibles
          if (rewards.collectibles && rewards.collectibles.length > 0) {
            for (const collectibleName of rewards.collectibles) {
              await get().collectItem(collectibleName);
              rewardMessages.push(`Colecionável: ${collectibleName}`);
            }
          }

          // Items
          if (rewards.items && rewards.items.length > 0) {
            for (const itemSlug of rewards.items) {
              const item = await get().getUniversalItem(itemSlug);
              if (item) {
                await get().addToInventory(item);
                rewardMessages.push(`Item: ${item.name}`);
              }
            }
          }

          // Update code usage
          get().updateRedeemCode(redeemCode.id, {
            currentUses: redeemCode.currentUses + 1,
            usedBy: [...redeemCode.usedBy, state.user.id],
          });

          const message = `Código resgatado com sucesso! Recompensas: ${rewardMessages.join(", ")}`;

          get().addNotification({
            type: "success",
            title: "Código Resgatado!",
            message,
            isRead: false,
          });

          return { success: true, message };
        } catch (error) {
          console.error("Error redeeming code:", error);
          return {
            success: false,
            message: "Erro ao resgatar código. Tente novamente.",
          };
        }
      },

      // Daily check-in system
      dailyCheckin: () => {
        const state = get();
        if (!state.user || !get().canClaimDailyCheckin()) return;

        // Award daily check-in rewards
        get().updateCurrency("xenocoins", 50);

        // Update last check-in date with user ID (in a real app, this would be stored in the backend)
        const today = new Date().toDateString();
        localStorage.setItem(`lastCheckin_${state.user.id}`, today);

        get().addNotification({
          type: "success",
          title: "Check-in Diário!",
          message: "Você recebeu 50 Xenocoins pelo check-in diário!",
          isRead: false,
        });
      },

      canClaimDailyCheckin: () => {
        const state = get();
        if (!state.user) return false;

        const lastCheckin = localStorage.getItem(
          `lastCheckin_${state.user.id}`,
        );
        const today = new Date().toDateString();
        return lastCheckin !== today;
      },

      getDailyCheckinStreak: () => {
        const state = get();
        if (!state.user) return 0;

        // In a real app, this would be stored in the backend
        const streak = localStorage.getItem(`checkinStreak_${state.user.id}`);
        return streak ? parseInt(streak, 10) : 0;
      },

      canClaimWeeklyReward: () => {
        const streak = get().getDailyCheckinStreak();
        return streak >= 7 && streak % 7 === 0;
      },

      claimWeeklyReward: () => {
        if (!get().canClaimWeeklyReward()) return;

        get().updateCurrency("cash", 2);

        get().addNotification({
          type: "success",
          title: "Recompensa Semanal!",
          message: "Você recebeu 2 Cash pela sequência semanal!",
          isRead: false,
        });
      },

      // Data loading and synchronization
      initializeNewUser: (userData) => {
        set({
          user: userData,
          pets: [],
          inventory: [],
          xenocoins: 0,
          cash: 0,
          notifications: [],
          achievements: [],
          collectibles: [],
          // Clear egg hatching state for new user
          selectedEggForHatching: null,
          isHatchingInProgress: false,
          hatchingEgg: null,
        });
      },

      loadUserData: async (userId) => {
        try {
          // Load pets
          const pets = await gameService.getUserPets(userId);
          const activePet = pets.find((pet) => pet.isActive) || pets[0] || null;

          // Load inventory
          const inventory = await gameService.getUserInventory(userId);

          // Load currency
          const currency = await gameService.getUserCurrency(userId);

          // Load notifications
          const notifications = await gameService.getUserNotifications(userId);

          // Load achievements
          const achievements = await gameService.getUserAchievements(userId);

          // Load collectibles
          const collectibles =
            await gameService.getUserCollectedCollectibles(userId);

          // Clear egg hatching state if it belongs to a different user
          const state = get();
          let updateData: any = {
            pets,
            activePet,
            inventory,
            xenocoins: currency?.xenocoins || 0,
            cash: currency?.cash || 0,
            notifications,
            achievements,
            collectibles,
          };

          if (state.hatchingEgg && state.hatchingEgg.userId !== userId) {
            updateData.selectedEggForHatching = null;
            updateData.isHatchingInProgress = false;
            updateData.hatchingEgg = null;
          }

          set(updateData);
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      },

      // World positions management
      setWorldPositions: (positions) => {
        set({ worldPositions: positions });
      },

      updateWorldPosition: (
        worldId: string,
        updates: Partial<WorldPosition>,
      ) => {
        const state = get();
        const updatedPositions = state.worldPositions.map((world) =>
          world.id === worldId
            ? { ...world, ...updates, updatedAt: new Date() }
            : world,
        );

        console.log("📍 Updating world position:", { worldId, updates });
        set({ worldPositions: updatedPositions });
      },

      loadWorldPositions: async () => {
        const state = get();

        // Se já tem posições no store, usa elas
        if (state.worldPositions.length > 0) {
          console.log(
            "📍 Using world positions from store:",
            state.worldPositions,
          );
          return;
        }

        // Se não tem, cria posições padrão
        const defaultPositions = [
          {
            id: "planet-0",
            name: "Estação Galáctica",
            x: 7750,
            y: 7250,
            size: 60,
            rotation: 0,
            color: "#ff6b6b",
            interactionRadius: 120, // Área de pouso grande para estação principal
            imageUrl:
              "https://cdn.builder.io/api/v1/image/assets%2Ff94d2a386a444693b9fbdff90d783a66%2Fdfdbc589c3f344eea7b33af316e83b41?format=webp&width=800",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "planet-1",
            name: "Base Orbital",
            x: 7966.6,
            y: 7625,
            size: 60,
            rotation: 0,
            color: "#4ecdc4",
            interactionRadius: 100, // Área de pouso média para base
            imageUrl:
              "https://cdn.builder.io/api/v1/image/assets%2Ff94d2a386a444693b9fbdff90d783a66%2Fd42810aa3d45429d93d8c58c52827326?format=webp&width=800",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "planet-2",
            name: "Mundo Alienígena",
            x: 7750,
            y: 8000,
            size: 60,
            rotation: 0,
            color: "#45b7d1",
            interactionRadius: 80, // Área de pouso menor - mundo perigoso
            imageUrl:
              "https://cdn.builder.io/api/v1/image/assets%2Ff94d2a386a444693b9fbdff90d783a66%2Fdfce7132f868407eb4d7afdf27d09a77?format=webp&width=800",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "planet-3",
            name: "Terra Verdejante",
            x: 7533.4,
            y: 7625,
            size: 60,
            rotation: 0,
            color: "#96ceb4",
            interactionRadius: 90, // Área de pouso padrão
            imageUrl:
              "https://cdn.builder.io/api/v1/image/assets%2Ff94d2a386a444693b9fbdff90d783a66%2F8e6b96287f6448089ed602d82e2839bc?format=webp&width=800",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "planet-4",
            name: "Reino Gelado",
            x: 7533.4,
            y: 7375,
            size: 60,
            rotation: 0,
            color: "#ffeaa7",
            interactionRadius: 70, // Área de pouso pequena - condições difíceis
            imageUrl:
              "https://cdn.builder.io/api/v1/image/assets%2Ff94d2a386a444693b9fbdff90d783a66%2F7a1b7c8172a5446b9a22ffd65d22a6f7?format=webp&width=800",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "planet-5",
            name: "Vila Ancestral",
            x: 7966.6,
            y: 7375,
            size: 60,
            rotation: 0,
            color: "#dda0dd",
            interactionRadius: 110, // Área de pouso grande - vila acolhedora
            imageUrl:
              "https://cdn.builder.io/api/v1/image/assets%2Ff94d2a386a444693b9fbdff90d783a66%2F76c4f943e6e045938d8e5efb84a2a969?format=webp&width=800",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        console.log("📍 Creating default world positions");
        set({ worldPositions: defaultPositions });
      },

      subscribeToWorldPositions: () => {
        // No need for real-time subscriptions with localStorage
        console.log(
          "📍 World positions using localStorage - no subscription needed",
        );
      },

      unsubscribeFromWorldPositions: () => {
        // No need for real-time subscriptions with localStorage
        console.log(
          "📍 World positions using localStorage - no unsubscription needed",
        );
      },

      subscribeToRealtimeUpdates: () => {
        const state = get();
        if (!state.user) return;

        // Subscribe to user-specific data
        console.log(
          "Subscribing to real-time updates for user:",
          state.user.id,
        );

        // Subscribe to world positions for all users
        get().subscribeToWorldPositions();
      },

      unsubscribeFromRealtimeUpdates: () => {
        console.log("Unsubscribing from real-time updates");

        // Unsubscribe from world positions
        get().unsubscribeFromWorldPositions();
      },

      // Ship state management
      updateShipState: (shipState) => {
        set({ shipState });
      },

      getShipState: () => {
        const state = get();
        return state.shipState;
      },
    }),
    {
      name: "xenopets-game-store",
      partialize: (state) => ({
        user: state.user,
        activePet: state.activePet,
        pets: state.pets,
        inventory: state.inventory,
        xenocoins: state.xenocoins,
        cash: state.cash,
        notifications: state.notifications,
        language: state.language,
        currentScreen: state.currentScreen,
        currentPlanet: state.currentPlanet,
        achievements: state.achievements,
        collectibles: state.collectibles,
        redeemCodes: state.redeemCodes,
        selectedEggForHatching: state.selectedEggForHatching,
        isHatchingInProgress: state.isHatchingInProgress,
        hatchingEgg: state.hatchingEgg,
        shipState: state.shipState,
        worldPositions: state.worldPositions,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Rehydrate dates for all objects
          if (state.user) state.user = rehydrateDates(state.user);
          if (state.activePet)
            state.activePet = rehydrateDates(state.activePet);
          if (state.pets) state.pets = state.pets.map(rehydrateDates);
          if (state.inventory)
            state.inventory = state.inventory.map(rehydrateDates);
          if (state.notifications)
            state.notifications = state.notifications.map(rehydrateDates);
          if (state.achievements)
            state.achievements = state.achievements.map(rehydrateDates);
          if (state.collectibles)
            state.collectibles = state.collectibles.map(rehydrateDates);
          if (state.redeemCodes)
            state.redeemCodes = state.redeemCodes.map(rehydrateDates);
          if (state.hatchingEgg) {
            state.hatchingEgg = rehydrateDates(state.hatchingEgg);

            // Validate that hatching egg belongs to current user
            if (
              state.user &&
              state.hatchingEgg &&
              state.hatchingEgg.userId !== state.user.id
            ) {
              // Clear invalid hatching state from different user
              state.selectedEggForHatching = null;
              state.isHatchingInProgress = false;
              state.hatchingEgg = null;
            }
          }
        }
      },
    },
  ),
);
