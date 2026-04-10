export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      messages: {
        Row: {
          id: string;
          sender_id: string;
          recipient_email: string;
          encrypted_content: string;
          unlock_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          recipient_email: string;
          encrypted_content: string;
          unlock_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          recipient_email?: string;
          encrypted_content?: string;
          unlock_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      gifts: {
        Row: {
          id: string;
          message_id: string;
          gift_type: "coupon" | "video" | "voice" | "image";
          gift_payload: Json;
          opened_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          gift_type: "coupon" | "video" | "voice" | "image";
          gift_payload: Json;
          opened_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          message_id?: string;
          gift_type?: "coupon" | "video" | "voice" | "image";
          gift_payload?: Json;
          opened_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "gifts_message_id_fkey";
            columns: ["message_id"];
            isOneToOne: false;
            referencedRelation: "messages";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          is_premium: boolean;
          is_blocked: boolean;
          is_admin: boolean;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          is_premium?: boolean;
          is_blocked?: boolean;
          is_admin?: boolean;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          is_premium?: boolean;
          is_blocked?: boolean;
          is_admin?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      profile_share_links: {
        Row: {
          user_id: string;
          share_token: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          share_token?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          share_token?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profile_share_links_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      interactions: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          type: Database["public"]["Enums"]["interaction_type"];
          message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          type: Database["public"]["Enums"]["interaction_type"];
          message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          type?: Database["public"]["Enums"]["interaction_type"];
          message?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "interactions_receiver_id_fkey";
            columns: ["receiver_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "interactions_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      interactions_feed: {
        Row: {
          id: string;
          sender_id: string | null;
          receiver_id: string;
          type: Database["public"]["Enums"]["interaction_type"];
          message: string | null;
          created_at: string;
        };
        Relationships: [
          {
            foreignKeyName: "interactions_receiver_id_fkey";
            columns: ["receiver_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      delete_own_sent_interaction: {
        Args: { p_id: string };
        Returns: boolean;
      };
      get_profile_by_share_token: {
        Args: { p_token: string };
        Returns: {
          id: string;
          username: string;
          avatar_url: string | null;
        }[];
      };
      rotate_own_share_token: {
        Args: Record<string, never>;
        Returns: string;
      };
      admin_update_user_flags: {
        Args: {
          p_target_user_id: string;
          p_is_premium: boolean;
          p_is_blocked: boolean;
        };
        Returns: boolean;
      };
    };
    Enums: {
      interaction_type: "water_splash" | "black_soot" | "food" | "flower";
    };
    CompositeTypes: Record<string, never>;
  };
};
