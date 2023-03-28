export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      character_tags: {
        Row: {
          character_id: string;
          created_at: string;
          id: number;
          tag_id: number;
        };
        Insert: {
          character_id: string;
          created_at?: string;
          id?: number;
          tag_id: number;
        };
        Update: {
          character_id?: string;
          created_at?: string;
          id?: number;
          tag_id?: number;
        };
      };
      characters: {
        Row: {
          avatar: string;
          created_at: string;
          creator_id: string;
          description: string;
          example_dialogs: string;
          first_message: string;
          id: string;
          is_nsfw: boolean;
          is_public: boolean;
          name: string;
          personality: string;
          scenario: string;
          updated_at: string;
        };
        Insert: {
          avatar: string;
          created_at?: string;
          creator_id: string;
          description: string;
          example_dialogs: string;
          first_message: string;
          id?: string;
          is_nsfw?: boolean;
          is_public?: boolean;
          name: string;
          personality: string;
          scenario: string;
          updated_at?: string;
        };
        Update: {
          avatar?: string;
          created_at?: string;
          creator_id?: string;
          description?: string;
          example_dialogs?: string;
          first_message?: string;
          id?: string;
          is_nsfw?: boolean;
          is_public?: boolean;
          name?: string;
          personality?: string;
          scenario?: string;
          updated_at?: string;
        };
      };
      chats: {
        Row: {
          character_id: string;
          created_at: string;
          id: string;
          user_id: string;
        };
        Insert: {
          character_id: string;
          created_at?: string;
          id?: string;
          user_id: string;
        };
        Update: {
          character_id?: string;
          created_at?: string;
          id?: string;
          user_id?: string;
        };
      };
      tags: {
        Row: {
          created_at: string;
          description: string;
          id: number;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: number;
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: number;
          name?: string;
          slug?: string;
        };
      };
      user_profiles: {
        Row: {
          about_me: string;
          avatar: string;
          id: string;
          name: string;
          profile: string;
          user_name: string | null;
        };
        Insert: {
          about_me: string;
          avatar: string;
          id: string;
          name: string;
          profile?: string;
          user_name?: string | null;
        };
        Update: {
          about_me?: string;
          avatar?: string;
          id?: string;
          name?: string;
          profile?: string;
          user_name?: string | null;
        };
      };
    };
    Views: {
      view_chars: {
        Row: {
          avatar: string | null;
          description: string | null;
          id: string | null;
          name: string | null;
        };
        Insert: {
          avatar?: string | null;
          description?: string | null;
          id?: string | null;
          name?: string | null;
        };
        Update: {
          avatar?: string | null;
          description?: string | null;
          id?: string | null;
          name?: string | null;
        };
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
