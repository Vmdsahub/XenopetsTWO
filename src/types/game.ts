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
  theme: "light" | "dark" | "auto";
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

export interface User {
  id: string;
  email: string;
  username: string;
  phone?: string;
  isAdmin: boolean;
  language: string;
  accountScore: number;
  daysPlayed: number;
  totalXenocoins: number;
  createdAt: Date;
  lastLogin: Date;
  unlockedAchievementsCount?: number;
  collectedCollectiblesCount?: number;
}

export interface Pet {
  id: string;
  name: string;
  species: "Dragon" | "Phoenix" | "Griffin" | "Unicorn";
  style: "normal" | "fire" | "ice" | "shadow" | "light" | "king" | "baby";
  level: number;
  ownerId: string;

  // Primary attributes (0-10 scale)
  happiness: number;
  health: number;
  hunger: number;

  // Secondary attributes (determine level)
  strength: number;
  dexterity: number;
  intelligence: number;
  speed: number;
  attack: number;
  defense: number;
  precision: number;
  evasion: number;
  luck: number;

  personality: "Sanguine" | "Choleric" | "Melancholic" | "Phlegmatic";
  conditions: PetCondition[];
  equipment: Equipment;
  weapon?: Weapon;
  imageUrl?: string;

  hatchTime?: Date;
  isAlive: boolean;
  deathDate?: Date;
  lastInteraction: Date;

  createdAt: Date;
  updatedAt: Date;
}

export interface PetCondition {
  id: string;
  type:
    | "sick"
    | "cold"
    | "hot"
    | "frozen"
    | "paralyzed"
    | "poisoned"
    | "blessed";
  name: string;
  description: string;
  effects: Record<string, number>;
  duration?: number;
  appliedAt: Date;
}

export interface Equipment {
  head?: Item;
  torso?: Item;
  legs?: Item;
  gloves?: Item;
  footwear?: Item;
}

export interface Weapon {
  id: string;
  name: string;
  type: "One-Handed Sword" | "Dual Daggers" | "Magic Wand";
  rarity: ItemRarity;
  stats: Record<string, number>;
  scalingStat: "strength" | "dexterity" | "intelligence";
  visualEffect?: string;
}

export interface Item {
  id: string; // This will now represent the UUID from the database `items` table.
  slug: string; // Human-readable string identifier, e.g., 'magic-apple-1'
  name: string;
  description: string;
  type:
    | "Food"
    | "Potion"
    | "Equipment"
    | "Special"
    | "Collectible"
    | "Theme"
    | "Weapon"
    | "Style";
  rarity: ItemRarity;
  price?: number;
  currency?: "xenocoins" | "cash";
  effects?: Record<string, number>;
  dailyLimit?: number;
  decompositionTime?: number;
  isEquipped?: boolean;
  isActive?: boolean;
  quantity: number;
  slot?: "head" | "torso" | "legs" | "gloves" | "footwear";
  imageUrl?: string;
  createdAt: Date;
  inventoryId?: string;
  equippedPetId?: string;
}

export type ItemRarity =
  | "Common"
  | "Uncommon"
  | "Rare"
  | "Epic"
  | "Legendary"
  | "Unique";

export interface WorldPosition {
  id: string;
  name: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
  interactionRadius: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameState {
  user: User | null;
  activePet: Pet | null;
  pets: Pet[];
  inventory: Item[];
  xenocoins: number;
  cash: number;
  notifications: Notification[];
  language: string;
  currentScreen: string;
  achievements: Achievement[];
  collectibles: Collectible[];
  quests: Quest[];
  redeemCodes: RedeemCode[];
  viewedUserId: string | null;
  shipState?: {
    x: number;
    y: number;
    angle: number;
    vx: number;
    vy: number;
    cameraX: number;
    cameraY: number;
  };
}

export interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "error" | "achievement";
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: "exploration" | "combat" | "collection" | "social" | "special";
  requirements: Record<string, any>;
  rewards: Record<string, number>;
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

export interface Collectible {
  id: string;
  name: string;
  type: "egg" | "fish" | "gem" | "stamp";
  rarity: ItemRarity;
  description: string;
  imageUrl?: string;
  isCollected: boolean;
  collectedAt?: Date;
  accountPoints: number; // Points awarded to account score when collected
  obtainMethod: string; // How to obtain this collectible
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: "delivery" | "minigame" | "exploration" | "combat" | "riddle";
  requirements: Record<string, any>;
  rewards: Record<string, number>;
  isActive: boolean;
  isCompleted: boolean;
  progress: Record<string, number>;
  startedAt?: Date;
  completedAt?: Date;
}

export interface RedeemCode {
  id: string;
  code: string;
  name: string;
  description: string;
  rewards: {
    xenocoins?: number;
    cash?: number;
    items?: string[]; // Item IDs
    collectibles?: string[]; // Collectible IDs
    accountPoints?: number;
  };
  maxUses: number;
  currentUses: number;
  expiresAt?: Date;
  isActive: boolean;
  createdBy: string; // Admin user ID
  createdAt: Date;
  usedBy: string[]; // Array of user IDs who used this code
}

export interface Saga {
  id: string;
  name: string;
  description: string;
  totalSteps: number;
  currentStep: number;
  isActive: boolean;
  steps: SagaStep[];
  rewards: Record<string, any>;
}

export interface SagaStep {
  id: string;
  stepNumber: number;
  name: string;
  description: string;
  type: "dialogue" | "battle" | "puzzle" | "exploration" | "item";
  requirements: Record<string, any>;
  rewards?: Record<string, any>;
  isCompleted: boolean;
  completedAt?: Date;
}
