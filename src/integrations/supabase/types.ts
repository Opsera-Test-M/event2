export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      event_items: {
        Row: {
          category: Database["public"]["Enums"]["item_category"]
          created_at: string
          description: string | null
          estimated_price: number | null
          event_id: string
          id: string
          is_owned: boolean
          is_veg: boolean | null
          name: string
          notes: string | null
          quantity: number
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["item_category"]
          created_at?: string
          description?: string | null
          estimated_price?: number | null
          event_id: string
          id?: string
          is_owned?: boolean
          is_veg?: boolean | null
          name: string
          notes?: string | null
          quantity?: number
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["item_category"]
          created_at?: string
          description?: string | null
          estimated_price?: number | null
          event_id?: string
          id?: string
          is_owned?: boolean
          is_veg?: boolean | null
          name?: string
          notes?: string | null
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_themes: {
        Row: {
          color_palette: string[]
          created_at: string
          decor_vibe: string
          description: string
          event_id: string
          id: string
          name: string
        }
        Insert: {
          color_palette: string[]
          created_at?: string
          decor_vibe: string
          description: string
          event_id: string
          id?: string
          name: string
        }
        Update: {
          color_palette?: string[]
          created_at?: string
          decor_vibe?: string
          description?: string
          event_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_themes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          allergies: string | null
          budget: number
          created_at: string
          event_date: string
          food_preference: Database["public"]["Enums"]["food_preference"]
          guest_count: number
          guest_type: Database["public"]["Enums"]["guest_type"]
          id: string
          location: string
          name: string
          occasion: Database["public"]["Enums"]["event_occasion"]
          selected_theme_id: string | null
          status: Database["public"]["Enums"]["event_status"]
          style_preference: Database["public"]["Enums"]["style_preference"]
          updated_at: string
          user_id: string
        }
        Insert: {
          allergies?: string | null
          budget: number
          created_at?: string
          event_date: string
          food_preference: Database["public"]["Enums"]["food_preference"]
          guest_count: number
          guest_type: Database["public"]["Enums"]["guest_type"]
          id?: string
          location: string
          name: string
          occasion: Database["public"]["Enums"]["event_occasion"]
          selected_theme_id?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          style_preference: Database["public"]["Enums"]["style_preference"]
          updated_at?: string
          user_id: string
        }
        Update: {
          allergies?: string | null
          budget?: number
          created_at?: string
          event_date?: string
          food_preference?: Database["public"]["Enums"]["food_preference"]
          guest_count?: number
          guest_type?: Database["public"]["Enums"]["guest_type"]
          id?: string
          location?: string
          name?: string
          occasion?: Database["public"]["Enums"]["event_occasion"]
          selected_theme_id?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          style_preference?: Database["public"]["Enums"]["style_preference"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_selected_theme"
            columns: ["selected_theme_id"]
            isOneToOne: false
            referencedRelation: "event_themes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      event_occasion:
        | "birthday"
        | "baby_shower"
        | "wedding"
        | "house_party"
        | "festival"
        | "corporate"
        | "anniversary"
        | "graduation"
        | "holiday"
        | "other"
      event_status: "draft" | "planning" | "complete"
      food_preference: "veg" | "non_veg" | "mixed"
      guest_type: "kids" | "adults" | "mixed"
      item_category:
        | "decor"
        | "tableware"
        | "lighting"
        | "party_supplies"
        | "return_gifts"
        | "starters"
        | "main_course"
        | "desserts"
        | "beverages"
      style_preference: "minimal" | "luxury" | "fun" | "traditional" | "modern"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      event_occasion: [
        "birthday",
        "baby_shower",
        "wedding",
        "house_party",
        "festival",
        "corporate",
        "anniversary",
        "graduation",
        "holiday",
        "other",
      ],
      event_status: ["draft", "planning", "complete"],
      food_preference: ["veg", "non_veg", "mixed"],
      guest_type: ["kids", "adults", "mixed"],
      item_category: [
        "decor",
        "tableware",
        "lighting",
        "party_supplies",
        "return_gifts",
        "starters",
        "main_course",
        "desserts",
        "beverages",
      ],
      style_preference: ["minimal", "luxury", "fun", "traditional", "modern"],
    },
  },
} as const
