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
      characters: {
        Row: {
          avatar: string
          created_at: string
          creator_id: string
          description: string
          example_dialogs: string
          first_message: string
          id: string
          is_public: boolean
          name: string
          personality: string
          scenario: string
          updated_at: string
        }
        Insert: {
          avatar?: string
          created_at?: string
          creator_id?: string
          description?: string
          example_dialogs?: string
          first_message?: string
          id?: string
          is_public?: boolean
          name?: string
          personality?: string
          scenario?: string
          updated_at?: string
        }
        Update: {
          avatar?: string
          created_at?: string
          creator_id?: string
          description?: string
          example_dialogs?: string
          first_message?: string
          id?: string
          is_public?: boolean
          name?: string
          personality?: string
          scenario?: string
          updated_at?: string
        }
      }
      chats: {
        Row: {
          character_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          character_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          character_id?: string
          created_at?: string
          id?: string
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
          about_me: string | null
          avatar: string | null
          id: string
          name: string
        }
        Insert: {
          about_me?: string | null
          avatar?: string | null
          id: string
          name: string
        }
        Update: {
          about_me?: string | null
          avatar?: string | null
          id?: string
          name?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

