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
          event_visibility: string
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
          event_visibility?: string
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
          event_visibility?: string
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
      coverage_request_messages: {
        Row: {
          created_at: string
          id: string
          is_bulk_message: boolean
          message_content: string
          read_at: string | null
          recipient_id: string
          request_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_bulk_message?: boolean
          message_content: string
          read_at?: string | null
          recipient_id: string
          request_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_bulk_message?: boolean
          message_content?: string
          read_at?: string | null
          recipient_id?: string
          request_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      coverage_request_passes: {
        Row: {
          created_at: string
          field_rep_id: string
          id: string
          pass_reason: string
          request_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          field_rep_id: string
          id?: string
          pass_reason: string
          request_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          field_rep_id?: string
          id?: string
          pass_reason?: string
          request_id?: string
          vendor_id?: string
        }
        Relationships: []
      }
      coverage_request_responses: {
        Row: {
          created_at: string
          field_rep_id: string
          id: string
          request_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          field_rep_id: string
          id?: string
          request_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          field_rep_id?: string
          id?: string
          request_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      coverage_requests: {
        Row: {
          abc_required: boolean | null
          budget_range: string
          created_at: string
          description: string
          estimated_monthly_volume: string
          expires_at: string
          hide_from_all_network: boolean
          hide_from_current_network: boolean
          hud_key_required: boolean | null
          id: string
          selected_cities: string[] | null
          selected_counties: string[] | null
          selected_inspection_types: string[] | null
          selected_platforms: string[] | null
          selected_state: string
          status: string
          title: string
          updated_at: string
          vendor_id: string
          years_experience_required: string | null
        }
        Insert: {
          abc_required?: boolean | null
          budget_range: string
          created_at?: string
          description: string
          estimated_monthly_volume: string
          expires_at?: string
          hide_from_all_network?: boolean
          hide_from_current_network?: boolean
          hud_key_required?: boolean | null
          id?: string
          selected_cities?: string[] | null
          selected_counties?: string[] | null
          selected_inspection_types?: string[] | null
          selected_platforms?: string[] | null
          selected_state: string
          status?: string
          title: string
          updated_at?: string
          vendor_id: string
          years_experience_required?: string | null
        }
        Update: {
          abc_required?: boolean | null
          budget_range?: string
          created_at?: string
          description?: string
          estimated_monthly_volume?: string
          expires_at?: string
          hide_from_all_network?: boolean
          hide_from_current_network?: boolean
          hud_key_required?: boolean | null
          id?: string
          selected_cities?: string[] | null
          selected_counties?: string[] | null
          selected_inspection_types?: string[] | null
          selected_platforms?: string[] | null
          selected_state?: string
          status?: string
          title?: string
          updated_at?: string
          vendor_id?: string
          years_experience_required?: string | null
        }
        Relationships: []
      }
      credit_earning_audit_log: {
        Row: {
          action_type: string
          admin_id: string
          after_values: Json | null
          before_values: Json | null
          created_at: string
          id: string
          notes: string | null
          rule_id: string
        }
        Insert: {
          action_type: string
          admin_id: string
          after_values?: Json | null
          before_values?: Json | null
          created_at?: string
          id?: string
          notes?: string | null
          rule_id: string
        }
        Update: {
          action_type?: string
          admin_id?: string
          after_values?: Json | null
          before_values?: Json | null
          created_at?: string
          id?: string
          notes?: string | null
          rule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_earning_audit_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_earning_audit_log_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "credit_earning_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_earning_rules: {
        Row: {
          cooldown_hours: number | null
          created_at: string
          credit_amount: number
          daily_limit: number | null
          id: string
          internal_notes: string | null
          is_enabled: boolean
          max_per_target: number | null
          requires_verification: boolean
          rule_description: string
          rule_name: string
          updated_at: string
        }
        Insert: {
          cooldown_hours?: number | null
          created_at?: string
          credit_amount?: number
          daily_limit?: number | null
          id?: string
          internal_notes?: string | null
          is_enabled?: boolean
          max_per_target?: number | null
          requires_verification?: boolean
          rule_description: string
          rule_name: string
          updated_at?: string
        }
        Update: {
          cooldown_hours?: number | null
          created_at?: string
          credit_amount?: number
          daily_limit?: number | null
          id?: string
          internal_notes?: string | null
          is_enabled?: boolean
          max_per_target?: number | null
          requires_verification?: boolean
          rule_description?: string
          rule_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          metadata: Json | null
          reference_id: string | null
          reference_type: string | null
          rule_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          rule_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          rule_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "credit_earning_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_user_id_fkey"
            columns: ["user_id"]
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
      daily_credit_earnings: {
        Row: {
          date: string
          id: string
          rule_id: string
          times_earned: number
          total_credits: number
          user_id: string
        }
        Insert: {
          date?: string
          id?: string
          rule_id: string
          times_earned?: number
          total_credits?: number
          user_id: string
        }
        Update: {
          date?: string
          id?: string
          rule_id?: string
          times_earned?: number
          total_credits?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_credit_earnings_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "credit_earning_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_credit_earnings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
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
      helpful_votes: {
        Row: {
          created_at: string
          id: string
          target_id: string
          target_type: string
          voter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          target_id: string
          target_type: string
          voter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          target_id?: string
          target_type?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "helpful_votes_voter_id_fkey"
            columns: ["voter_id"]
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
      reviews: {
        Row: {
          created_at: string
          id: string
          rating: number
          review_text: string | null
          reviewed_user_id: string
          reviewer_id: string
          updated_at: string
          verified: boolean
          verified_at: string | null
          verified_by: string | null
          work_completed_date: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          rating: number
          review_text?: string | null
          reviewed_user_id: string
          reviewer_id: string
          updated_at?: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          work_completed_date?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          review_text?: string | null
          reviewed_user_id?: string
          reviewer_id?: string
          updated_at?: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
          work_completed_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_reviewed_user_id_fkey"
            columns: ["reviewed_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sent_emails: {
        Row: {
          email_type: string
          id: string
          metadata: Json | null
          sent_at: string
          status: string | null
          subject: string
          to_email: string
          user_id: string | null
        }
        Insert: {
          email_type: string
          id?: string
          metadata?: Json | null
          sent_at?: string
          status?: string | null
          subject: string
          to_email: string
          user_id?: string | null
        }
        Update: {
          email_type?: string
          id?: string
          metadata?: Json | null
          sent_at?: string
          status?: string | null
          subject?: string
          to_email?: string
          user_id?: string | null
        }
        Relationships: []
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
      user_invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string
          role: Database["public"]["Enums"]["user_role"]
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invitation_token: string
          invited_by: string
          role: Database["public"]["Enums"]["user_role"]
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          is_active: boolean
          join_date: string
          last_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          join_date?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          join_date?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          boost_expiration: string | null
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
          boost_expiration?: string | null
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
          boost_expiration?: string | null
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
      vendor_network_alert_recipients: {
        Row: {
          alert_id: string
          created_at: string
          delivery_status: string | null
          id: string
          recipient_id: string
          sent_at: string | null
        }
        Insert: {
          alert_id: string
          created_at?: string
          delivery_status?: string | null
          id?: string
          recipient_id: string
          sent_at?: string | null
        }
        Update: {
          alert_id?: string
          created_at?: string
          delivery_status?: string | null
          id?: string
          recipient_id?: string
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_vendor_network_alert_recipients_alert_id"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "vendor_network_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_vendor_network_alert_recipients_recipient_id"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_network_alerts: {
        Row: {
          created_at: string
          filters_used: Json | null
          id: string
          is_archived: boolean
          is_outdated: boolean
          message_body: string
          scheduled_send_date: string | null
          sent_at: string | null
          status: string
          subject: string
          total_recipients: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          filters_used?: Json | null
          id?: string
          is_archived?: boolean
          is_outdated?: boolean
          message_body: string
          scheduled_send_date?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          total_recipients?: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          filters_used?: Json | null
          id?: string
          is_archived?: boolean
          is_outdated?: boolean
          message_body?: string
          scheduled_send_date?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          total_recipients?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_vendor_network_alerts_vendor_id"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_rep_comments: {
        Row: {
          comment_text: string
          created_at: string
          field_rep_id: string
          id: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string
          field_rep_id: string
          id?: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string
          field_rep_id?: string
          id?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
      }
      zip_county_classifications: {
        Row: {
          county_name: string
          created_at: string
          id: string
          rural_urban_designation: string
          state: string
          updated_at: string
          zip_code: string
        }
        Insert: {
          county_name: string
          created_at?: string
          id?: string
          rural_urban_designation: string
          state: string
          updated_at?: string
          zip_code: string
        }
        Update: {
          county_name?: string
          created_at?: string
          id?: string
          rural_urban_designation?: string
          state?: string
          updated_at?: string
          zip_code?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_credits: {
        Args: {
          target_user_id: string
          rule_name_param: string
          reference_id_param?: string
          reference_type_param?: string
          metadata_param?: Json
        }
        Returns: boolean
      }
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
      setup_test_user: {
        Args: {
          user_email: string
          user_role: Database["public"]["Enums"]["user_role"]
          display_name_val: string
          trust_score_val: number
          profile_complete_val: number
          credits_val: number
        }
        Returns: undefined
      }
      spend_credits: {
        Args: {
          spender_user_id: string
          amount_param: number
          reference_id_param?: string
          reference_type_param?: string
          metadata_param?: Json
        }
        Returns: boolean
      }
      toggle_user_activation: {
        Args: { target_user_id: string; is_active_param: boolean }
        Returns: boolean
      }
      update_trust_score: {
        Args: { target_user_id: string }
        Returns: undefined
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
