export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          metadata: Json | null
          target_id: string | null
          target_table: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_table?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_table?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      auto_reply_settings: {
        Row: {
          active_from: string | null
          active_until: string | null
          created_at: string | null
          enabled: boolean | null
          id: string
          message_template: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active_from?: string | null
          active_until?: string | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          message_template?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active_from?: string | null
          active_until?: string | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          message_template?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auto_reply_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bulk_message_recipients: {
        Row: {
          bulk_message_id: string
          id: string
          recipient_id: string
          sent_at: string | null
        }
        Insert: {
          bulk_message_id: string
          id?: string
          recipient_id: string
          sent_at?: string | null
        }
        Update: {
          bulk_message_id?: string
          id?: string
          recipient_id?: string
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bulk_message_recipients_bulk_message_id_fkey"
            columns: ["bulk_message_id"]
            isOneToOne: false
            referencedRelation: "bulk_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bulk_message_recipients_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bulk_messages: {
        Row: {
          area: string | null
          content: string
          created_at: string | null
          dates_mentioned: string[] | null
          id: string
          message_template: string
          sender_id: string
          subject: string
        }
        Insert: {
          area?: string | null
          content: string
          created_at?: string | null
          dates_mentioned?: string[] | null
          id?: string
          message_template: string
          sender_id: string
          subject: string
        }
        Update: {
          area?: string | null
          content?: string
          created_at?: string | null
          dates_mentioned?: string[] | null
          id?: string
          message_template?: string
          sender_id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "bulk_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string
          event_type: string
          id: string
          notify_network: boolean | null
          start_date: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date: string
          event_type: string
          id?: string
          notify_network?: boolean | null
          start_date: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string
          event_type?: string
          id?: string
          notify_network?: boolean | null
          start_date?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      community_comments: {
        Row: {
          content: string
          created_at: string | null
          flagged: boolean | null
          helpful_votes: number | null
          id: string
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          flagged?: boolean | null
          helpful_votes?: number | null
          id?: string
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          flagged?: boolean | null
          helpful_votes?: number | null
          id?: string
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          content: string
          created_at: string | null
          flagged: boolean | null
          helpful_votes: number | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          flagged?: boolean | null
          helpful_votes?: number | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          flagged?: boolean | null
          helpful_votes?: number | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_unlocks: {
        Row: {
          created_at: string | null
          id: string
          method: Database["public"]["Enums"]["unlock_method"]
          unlocked_user_id: string
          unlocker_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          method: Database["public"]["Enums"]["unlock_method"]
          unlocked_user_id: string
          unlocker_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          method?: Database["public"]["Enums"]["unlock_method"]
          unlocked_user_id?: string
          unlocker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_unlocks_unlocked_user_id_fkey"
            columns: ["unlocked_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_unlocks_unlocker_id_fkey"
            columns: ["unlocker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      credits: {
        Row: {
          current_balance: number | null
          earned_credits: number | null
          paid_credits: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          current_balance?: number | null
          earned_credits?: number | null
          paid_credits?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          current_balance?: number | null
          earned_credits?: number | null
          paid_credits?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      flags: {
        Row: {
          created_at: string | null
          flagged_by: string
          id: string
          reason: string | null
          status: Database["public"]["Enums"]["flag_status"] | null
          target_id: string
          target_type: Database["public"]["Enums"]["flag_target_type"]
        }
        Insert: {
          created_at?: string | null
          flagged_by: string
          id?: string
          reason?: string | null
          status?: Database["public"]["Enums"]["flag_status"] | null
          target_id: string
          target_type: Database["public"]["Enums"]["flag_target_type"]
        }
        Update: {
          created_at?: string | null
          flagged_by?: string
          id?: string
          reason?: string | null
          status?: Database["public"]["Enums"]["flag_status"] | null
          target_id?: string
          target_type?: Database["public"]["Enums"]["flag_target_type"]
        }
        Relationships: [
          {
            foreignKeyName: "flags_flagged_by_fkey"
            columns: ["flagged_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          joined_user_id: string | null
          referee_email: string
          referrer_id: string
          reward_claimed: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          joined_user_id?: string | null
          referee_email: string
          referrer_id: string
          reward_claimed?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          joined_user_id?: string | null
          referee_email?: string
          referrer_id?: string
          reward_claimed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_joined_user_id_fkey"
            columns: ["joined_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount_cents: number
          created_at: string | null
          credits_awarded: number | null
          currency: string | null
          id: string
          metadata: Json | null
          payment_provider: string | null
          provider_transaction_id: string | null
          status: string | null
          transaction_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          credits_awarded?: number | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          payment_provider?: string | null
          provider_transaction_id?: string | null
          status?: string | null
          transaction_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          credits_awarded?: number | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          payment_provider?: string | null
          provider_transaction_id?: string | null
          status?: string | null
          transaction_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          community_score: number | null
          created_at: string | null
          display_name: string | null
          id: string
          last_active: string | null
          profile_complete: number | null
          referred_by: string | null
          role: Database["public"]["Enums"]["user_role"]
          trust_score: number | null
          updated_at: string | null
        }
        Insert: {
          community_score?: number | null
          created_at?: string | null
          display_name?: string | null
          id: string
          last_active?: string | null
          profile_complete?: number | null
          referred_by?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          trust_score?: number | null
          updated_at?: string | null
        }
        Update: {
          community_score?: number | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          last_active?: string | null
          profile_complete?: number | null
          referred_by?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          trust_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_create_flag: {
        Args: { user_id: string }
        Returns: boolean
      }
      ensure_admin_exists: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      flag_status: "pending" | "reviewed" | "dismissed"
      flag_target_type: "profile" | "post" | "comment"
      unlock_method: "credit" | "referral" | "purchase"
      user_role: "field_rep" | "vendor" | "moderator" | "admin"
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
      flag_status: ["pending", "reviewed", "dismissed"],
      flag_target_type: ["profile", "post", "comment"],
      unlock_method: ["credit", "referral", "purchase"],
      user_role: ["field_rep", "vendor", "moderator", "admin"],
    },
  },
} as const
