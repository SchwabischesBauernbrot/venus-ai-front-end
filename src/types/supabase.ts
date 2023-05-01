export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      character_tags: {
        Row: {
          character_id: string
          created_at: string | null
          tag_id: number
        }
        Insert: {
          character_id: string
          created_at?: string | null
          tag_id: number
        }
        Update: {
          character_id?: string
          created_at?: string | null
          tag_id?: number
        }
      }
      characters: {
        Row: {
          avatar: string
          created_at: string
          creator_id: string
          description: string
          example_dialogs: string
          first_message: string
          fts: unknown | null
          id: string
          is_nsfw: boolean
          is_public: boolean
          name: string
          personality: string
          scenario: string
          updated_at: string
        }
        Insert: {
          avatar: string
          created_at?: string
          creator_id: string
          description: string
          example_dialogs: string
          first_message: string
          fts?: unknown | null
          id?: string
          is_nsfw?: boolean
          is_public?: boolean
          name: string
          personality: string
          scenario: string
          updated_at?: string
        }
        Update: {
          avatar?: string
          created_at?: string
          creator_id?: string
          description?: string
          example_dialogs?: string
          first_message?: string
          fts?: unknown | null
          id?: string
          is_nsfw?: boolean
          is_public?: boolean
          name?: string
          personality?: string
          scenario?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          chat_id: number
          created_at: string
          id: number
          is_bot: boolean
          is_main: boolean
          message: string
        }
        Insert: {
          chat_id: number
          created_at?: string
          id?: number
          is_bot?: boolean
          is_main?: boolean
          message: string
        }
        Update: {
          chat_id?: number
          created_at?: string
          id?: number
          is_bot?: boolean
          is_main?: boolean
          message?: string
        }
      }
      chats: {
        Row: {
          character_id: string
          created_at: string
          id: number
          is_public: boolean
          summary: string
          summary_chat_id: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          character_id: string
          created_at?: string
          id?: number
          is_public?: boolean
          summary?: string
          summary_chat_id?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          character_id?: string
          created_at?: string
          id?: number
          is_public?: boolean
          summary?: string
          summary_chat_id?: number | null
          updated_at?: string
          user_id?: string
        }
      }
      tags: {
        Row: {
          created_at: string
          description: string
          id: number
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: number
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: number
          name?: string
          slug?: string
        }
      }
      user_profiles: {
        Row: {
          about_me: string
          avatar: string
          config: Json
          id: string
          name: string
          profile: string
          user_name: string | null
        }
        Insert: {
          about_me?: string
          avatar?: string
          config?: Json
          id: string
          name?: string
          profile?: string
          user_name?: string | null
        }
        Update: {
          about_me?: string
          avatar?: string
          config?: Json
          id?: string
          name?: string
          profile?: string
          user_name?: string | null
        }
      }
    }
    Views: {
      character_search: {
        Row: {
          avatar: string | null
          created_at: string | null
          creator_id: string | null
          creator_name: string | null
          description: string | null
          example_dialogs: string | null
          first_message: string | null
          fts: unknown | null
          id: string | null
          is_nsfw: boolean | null
          is_public: boolean | null
          name: string | null
          personality: string | null
          scenario: string | null
          tag_ids: number[] | null
          total_chat: number | null
          total_message: number | null
          updated_at: string | null
        }
      }
      character_stats: {
        Row: {
          char_id: string | null
          total_chat: number | null
          total_message: number | null
        }
      }
      character_tags_view: {
        Row: {
          avatar: string | null
          created_at: string | null
          creator_id: string | null
          creator_name: string | null
          description: string | null
          example_dialogs: string | null
          first_message: string | null
          fts: unknown | null
          id: string | null
          is_nsfw: boolean | null
          is_public: boolean | null
          name: string | null
          personality: string | null
          scenario: string | null
          tag_id: number | null
          updated_at: string | null
        }
      }
      chat_message_count: {
        Row: {
          character_id: string | null
          chat_id: number | null
          message_count: number | null
        }
      }
    }
    Functions: {
      pgrst_watch: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_materialized_view: {
        Args: {
          view_name: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
