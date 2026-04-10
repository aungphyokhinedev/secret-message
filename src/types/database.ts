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
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          is_premium?: boolean;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          is_premium?: boolean;
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
    };
    Enums: {
      interaction_type: "water_splash" | "black_soot" | "food" | "flower";
    };
    CompositeTypes: Record<string, never>;
  };
};
