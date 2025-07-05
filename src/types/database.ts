export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          phone: string | null;
          is_admin: boolean;
          language: string;
          account_score: number;
          days_played: number;
          total_xenocoins: number;
          xenocoins: number;
          cash: number;
          avatar_url: string | null;
          preferences: any;
          created_at: string;
          updated_at: string;
          last_login: string;
        };
        Insert: {
          id: string;
          username: string;
          phone?: string | null;
          is_admin?: boolean;
          language?: string;
          account_score?: number;
          days_played?: number;
          total_xenocoins?: number;
          xenocoins?: number;
          cash?: number;
          avatar_url?: string | null;
          preferences?: any;
          created_at?: string;
          updated_at?: string;
          last_login?: string;
        };
        Update: {
          id?: string;
          username?: string;
          phone?: string | null;
          is_admin?: boolean;
          language?: string;
          account_score?: number;
          days_played?: number;
          total_xenocoins?: number;
          xenocoins?: number;
          cash?: number;
          avatar_url?: string | null;
          preferences?: any;
          created_at?: string;
          updated_at?: string;
          last_login?: string;
        };
      };
      pets: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          species: "Dragon" | "Phoenix" | "Griffin" | "Unicorn";
          style:
            | "normal"
            | "fire"
            | "ice"
            | "shadow"
            | "light"
            | "king"
            | "baby";
          level: number;
          happiness: number;
          health: number;
          hunger: number;
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
          is_alive: boolean;
          is_active: boolean;
          hatch_time: string | null;
          death_date: string | null;
          last_interaction: string;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          species: "Dragon" | "Phoenix" | "Griffin" | "Unicorn";
          style?:
            | "normal"
            | "fire"
            | "ice"
            | "shadow"
            | "light"
            | "king"
            | "baby";
          level?: number;
          happiness?: number;
          health?: number;
          hunger?: number;
          strength?: number;
          dexterity?: number;
          intelligence?: number;
          speed?: number;
          attack?: number;
          defense?: number;
          precision?: number;
          evasion?: number;
          luck?: number;
          personality: "Sanguine" | "Choleric" | "Melancholic" | "Phlegmatic";
          is_alive?: boolean;
          is_active?: boolean;
          hatch_time?: string | null;
          death_date?: string | null;
          last_interaction?: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          species?: "Dragon" | "Phoenix" | "Griffin" | "Unicorn";
          style?:
            | "normal"
            | "fire"
            | "ice"
            | "shadow"
            | "light"
            | "king"
            | "baby";
          level?: number;
          happiness?: number;
          health?: number;
          hunger?: number;
          strength?: number;
          dexterity?: number;
          intelligence?: number;
          speed?: number;
          attack?: number;
          defense?: number;
          precision?: number;
          evasion?: number;
          luck?: number;
          personality?: "Sanguine" | "Choleric" | "Melancholic" | "Phlegmatic";
          is_alive?: boolean;
          is_active?: boolean;
          hatch_time?: string | null;
          death_date?: string | null;
          last_interaction?: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      items: {
        Row: {
          id: string;
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
          rarity:
            | "Common"
            | "Uncommon"
            | "Rare"
            | "Epic"
            | "Legendary"
            | "Unique";
          price: number;
          currency: "xenocoins" | "cash";
          effects: any;
          daily_limit: number | null;
          decomposition_hours: number;
          slot:
            | "head"
            | "torso"
            | "legs"
            | "gloves"
            | "footwear"
            | "weapon"
            | null;
          image_url: string | null;
          is_tradeable: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
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
          rarity:
            | "Common"
            | "Uncommon"
            | "Rare"
            | "Epic"
            | "Legendary"
            | "Unique";
          price?: number;
          currency?: "xenocoins" | "cash";
          effects?: any;
          daily_limit?: number | null;
          decomposition_hours?: number;
          slot?:
            | "head"
            | "torso"
            | "legs"
            | "gloves"
            | "footwear"
            | "weapon"
            | null;
          image_url?: string | null;
          is_tradeable?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          type?:
            | "Food"
            | "Potion"
            | "Equipment"
            | "Special"
            | "Collectible"
            | "Theme"
            | "Weapon"
            | "Style";
          rarity?:
            | "Common"
            | "Uncommon"
            | "Rare"
            | "Epic"
            | "Legendary"
            | "Unique";
          price?: number;
          currency?: "xenocoins" | "cash";
          effects?: any;
          daily_limit?: number | null;
          decomposition_hours?: number;
          slot?:
            | "head"
            | "torso"
            | "legs"
            | "gloves"
            | "footwear"
            | "weapon"
            | null;
          image_url?: string | null;
          is_tradeable?: boolean;
          created_at?: string;
        };
      };
      inventory: {
        Row: {
          id: string;
          user_id: string;
          item_id: string;
          quantity: number;
          is_equipped: boolean;
          equipped_pet_id: string | null;
          acquired_at: string;
          last_used: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_id: string;
          quantity?: number;
          is_equipped?: boolean;
          equipped_pet_id?: string | null;
          acquired_at?: string;
          last_used?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          item_id?: string;
          quantity?: number;
          is_equipped?: boolean;
          equipped_pet_id?: string | null;
          acquired_at?: string;
          last_used?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: "info" | "warning" | "success" | "error" | "achievement";
          title: string;
          message: string;
          is_read: boolean;
          action_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "info" | "warning" | "success" | "error" | "achievement";
          title: string;
          message: string;
          is_read?: boolean;
          action_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "info" | "warning" | "success" | "error" | "achievement";
          title?: string;
          message?: string;
          is_read?: boolean;
          action_url?: string | null;
          created_at?: string;
        };
      };
      world_positions: {
        Row: {
          id: string;
          name: string;
          x: number;
          y: number;
          size: number;
          rotation: number;
          color: string;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          x?: number;
          y?: number;
          size?: number;
          rotation?: number;
          color?: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          x?: number;
          y?: number;
          size?: number;
          rotation?: number;
          color?: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      update_user_currency: {
        Args: {
          user_id: string;
          currency_type: string;
          amount: number;
          reason?: string;
        };
        Returns: boolean;
      };
      calculate_pet_level: {
        Args: {
          pet_id: string;
        };
        Returns: number;
      };
    };
  };
}
