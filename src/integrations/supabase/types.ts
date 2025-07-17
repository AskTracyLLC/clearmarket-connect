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
      admin_discussions: {
        Row: {
          admin_user_id: string
          ai_suggestions_used: boolean | null
          category: string
          conflict_score: number | null
          content: string
          created_at: string | null
          engagement_prediction: Json | null
          id: string
          posted_post_id: string | null
          scheduled_date: string | null
          section: string
          similarity_analysis: Json | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          admin_user_id: string
          ai_suggestions_used?: boolean | null
          category?: string
          conflict_score?: number | null
          content: string
          created_at?: string | null
          engagement_prediction?: Json | null
          id?: string
          posted_post_id?: string | null
          scheduled_date?: string | null
          section?: string
          similarity_analysis?: Json | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          admin_user_id?: string
          ai_suggestions_used?: boolean | null
          category?: string
          conflict_score?: number | null
          content?: string
          created_at?: string | null
          engagement_prediction?: Json | null
          id?: string
          posted_post_id?: string | null
          scheduled_date?: string | null
          section?: string
          similarity_analysis?: Json | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_discussions_posted_post_id_fkey"
            columns: ["posted_post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          performed_by_admin: boolean | null
          target_id: string | null
          target_table: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          performed_by_admin?: boolean | null
          target_id?: string | null
          target_table?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          performed_by_admin?: boolean | null
          target_id?: string | null
          target_table?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
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
        Relationships: []
      }
      beta_testers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean | null
          name: string | null
          signup_date: string
          updated_at: string
          user_type: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          signup_date?: string
          updated_at?: string
          user_type: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          signup_date?: string
          updated_at?: string
          user_type?: string
        }
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
      community_analytics: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          metric_data: Json
          metric_type: string
          relevance_score: number
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          metric_data: Json
          metric_type: string
          relevance_score: number
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          metric_data?: Json
          metric_type?: string
          relevance_score?: number
        }
        Relationships: []
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
        ]
      }
      community_posts: {
        Row: {
          board_type: string
          content: string
          created_at: string | null
          flagged: boolean | null
          helpful_votes: number | null
          id: string
          is_anonymous: boolean | null
          poll_data: Json | null
          post_type: string
          priority: string
          screenshots: string[] | null
          section: string
          system_tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string
          user_tags: string[] | null
        }
        Insert: {
          board_type?: string
          content: string
          created_at?: string | null
          flagged?: boolean | null
          helpful_votes?: number | null
          id?: string
          is_anonymous?: boolean | null
          poll_data?: Json | null
          post_type?: string
          priority?: string
          screenshots?: string[] | null
          section?: string
          system_tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id: string
          user_tags?: string[] | null
        }
        Update: {
          board_type?: string
          content?: string
          created_at?: string | null
          flagged?: boolean | null
          helpful_votes?: number | null
          id?: string
          is_anonymous?: boolean | null
          poll_data?: Json | null
          post_type?: string
          priority?: string
          screenshots?: string[] | null
          section?: string
          system_tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
          user_tags?: string[] | null
        }
        Relationships: []
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
        Relationships: []
      }
      content_similarity_cache: {
        Row: {
          analysis_date: string | null
          content_hash: string
          expires_at: string | null
          id: string
          similar_posts: Json
        }
        Insert: {
          analysis_date?: string | null
          content_hash: string
          expires_at?: string | null
          id?: string
          similar_posts: Json
        }
        Update: {
          analysis_date?: string | null
          content_hash?: string
          expires_at?: string | null
          id?: string
          similar_posts?: Json
        }
        Relationships: []
      }
      counties: {
        Row: {
          created_at: string
          id: string
          name: string
          state_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          state_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          state_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "counties_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
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
        Relationships: []
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
        ]
      }
      discussion_suggestions: {
        Row: {
          admin_user_id: string | null
          category: string | null
          confidence_score: number
          created_at: string | null
          expires_at: string | null
          id: string
          rationale: string
          suggested_title: string
          suggested_topic: string
          tags: string[] | null
          used_at: string | null
          used_by_admin: boolean | null
        }
        Insert: {
          admin_user_id?: string | null
          category?: string | null
          confidence_score: number
          created_at?: string | null
          expires_at?: string | null
          id?: string
          rationale: string
          suggested_title: string
          suggested_topic: string
          tags?: string[] | null
          used_at?: string | null
          used_by_admin?: boolean | null
        }
        Update: {
          admin_user_id?: string | null
          category?: string | null
          confidence_score?: number
          created_at?: string | null
          expires_at?: string | null
          id?: string
          rationale?: string
          suggested_title?: string
          suggested_topic?: string
          tags?: string[] | null
          used_at?: string | null
          used_by_admin?: boolean | null
        }
        Relationships: []
      }
      discussion_templates: {
        Row: {
          category: string
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          post_type: string
          priority: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          id: string
          is_active?: boolean | null
          post_type?: string
          priority?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          post_type?: string
          priority?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string
          html_content: string
          id: number
          name: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          html_content: string
          id?: never
          name: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          html_content?: string
          id?: never
          name?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      feedback_posts: {
        Row: {
          author: string
          category: string
          created_at: string
          description: string
          id: string
          status: string
          title: string
          updated_at: string
          upvotes: number
          user_id: string | null
        }
        Insert: {
          author: string
          category?: string
          created_at?: string
          description: string
          id?: string
          status?: string
          title: string
          updated_at?: string
          upvotes?: number
          user_id?: string | null
        }
        Update: {
          author?: string
          category?: string
          created_at?: string
          description?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
          upvotes?: number
          user_id?: string | null
        }
        Relationships: []
      }
      feedback_sessions: {
        Row: {
          access_token: string
          anonymous_username: string
          created_at: string
          expires_at: string
          id: string
          last_accessed: string | null
          user_email: string
        }
        Insert: {
          access_token: string
          anonymous_username: string
          created_at?: string
          expires_at: string
          id?: string
          last_accessed?: string | null
          user_email: string
        }
        Update: {
          access_token?: string
          anonymous_username?: string
          created_at?: string
          expires_at?: string
          id?: string
          last_accessed?: string | null
          user_email?: string
        }
        Relationships: []
      }
      field_rep_signups: {
        Row: {
          agreed_to_analytics: boolean | null
          anonymous_username: string | null
          created_at: string
          current_challenges: string[] | null
          email: string
          experience_level: string | null
          feedback_access_token: string | null
          feedback_token_expires_at: string | null
          field_rep_name: string | null
          id: string
          interested_features: string[] | null
          interested_in_beta_testing: boolean | null
          join_feedback_group: boolean | null
          primary_state: string | null
          status: string | null
          updated_at: string
          work_types: string[] | null
        }
        Insert: {
          agreed_to_analytics?: boolean | null
          anonymous_username?: string | null
          created_at?: string
          current_challenges?: string[] | null
          email: string
          experience_level?: string | null
          feedback_access_token?: string | null
          feedback_token_expires_at?: string | null
          field_rep_name?: string | null
          id?: string
          interested_features?: string[] | null
          interested_in_beta_testing?: boolean | null
          join_feedback_group?: boolean | null
          primary_state?: string | null
          status?: string | null
          updated_at?: string
          work_types?: string[] | null
        }
        Update: {
          agreed_to_analytics?: boolean | null
          anonymous_username?: string | null
          created_at?: string
          current_challenges?: string[] | null
          email?: string
          experience_level?: string | null
          feedback_access_token?: string | null
          feedback_token_expires_at?: string | null
          field_rep_name?: string | null
          id?: string
          interested_features?: string[] | null
          interested_in_beta_testing?: boolean | null
          join_feedback_group?: boolean | null
          primary_state?: string | null
          status?: string | null
          updated_at?: string
          work_types?: string[] | null
        }
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
      internal_users: {
        Row: {
          access_expiration: string | null
          created_at: string
          created_by: string | null
          email: string
          id: string
          invite_sent: boolean
          is_active: boolean
          name: string
          notes: string | null
          profile_link: string | null
          role: string
          updated_at: string
        }
        Insert: {
          access_expiration?: string | null
          created_at?: string
          created_by?: string | null
          email: string
          id?: string
          invite_sent?: boolean
          is_active?: boolean
          name: string
          notes?: string | null
          profile_link?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          access_expiration?: string | null
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          invite_sent?: boolean
          is_active?: boolean
          name?: string
          notes?: string | null
          profile_link?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      launch_notifications: {
        Row: {
          agreed_to_analytics: boolean
          annual_volume: string | null
          company_name: string | null
          company_size: string | null
          coverage_areas: string[] | null
          created_at: string
          current_challenges: string | null
          email: string
          engagement_score: number | null
          feature_name: string
          id: string
          interested_features: string[] | null
          ip_address: unknown | null
          last_engagement: string | null
          notes: string | null
          notified_at: string | null
          primary_service: string | null
          referrer: string | null
          signup_source: string | null
          unsubscribed_at: string | null
          user_agent: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          wants_progress_reports: boolean
          website_url: string | null
        }
        Insert: {
          agreed_to_analytics?: boolean
          annual_volume?: string | null
          company_name?: string | null
          company_size?: string | null
          coverage_areas?: string[] | null
          created_at?: string
          current_challenges?: string | null
          email: string
          engagement_score?: number | null
          feature_name?: string
          id?: string
          interested_features?: string[] | null
          ip_address?: unknown | null
          last_engagement?: string | null
          notes?: string | null
          notified_at?: string | null
          primary_service?: string | null
          referrer?: string | null
          signup_source?: string | null
          unsubscribed_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          wants_progress_reports?: boolean
          website_url?: string | null
        }
        Update: {
          agreed_to_analytics?: boolean
          annual_volume?: string | null
          company_name?: string | null
          company_size?: string | null
          coverage_areas?: string[] | null
          created_at?: string
          current_challenges?: string | null
          email?: string
          engagement_score?: number | null
          feature_name?: string
          id?: string
          interested_features?: string[] | null
          ip_address?: unknown | null
          last_engagement?: string | null
          notes?: string | null
          notified_at?: string | null
          primary_service?: string | null
          referrer?: string | null
          signup_source?: string | null
          unsubscribed_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          wants_progress_reports?: boolean
          website_url?: string | null
        }
        Relationships: []
      }
      moderation_actions: {
        Row: {
          action_type: string
          created_at: string
          id: string
          metadata: Json | null
          moderator_id: string
          notes: string | null
          reason: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          moderator_id: string
          notes?: string | null
          reason?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          moderator_id?: string
          notes?: string | null
          reason?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      nda_signatures: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          signature_name: string
          signature_version: string
          signed_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          signature_name: string
          signature_version?: string
          signed_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          signature_name?: string
          signature_version?: string
          signed_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      poll_votes: {
        Row: {
          choice_index: number
          choice_text: string | null
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          choice_index: number
          choice_text?: string | null
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          choice_index?: number
          choice_text?: string | null
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_acknowledgments: {
        Row: {
          acknowledged_at: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_acknowledgments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
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
        Relationships: []
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
        Relationships: []
      }
      saved_local_news_searches: {
        Row: {
          created_at: string
          id: string
          location_display: string
          location_value: string
          name: string
          search_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_display: string
          location_value: string
          name: string
          search_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location_display?: string
          location_value?: string
          name?: string
          search_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_posts: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_discussion_posts: {
        Row: {
          admin_user_id: string
          conflict_post_id: string | null
          conflict_reason: string | null
          created_at: string | null
          discussion_template_id: string
          id: string
          posted_at: string | null
          posted_post_id: string | null
          priority: number | null
          scheduled_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_user_id: string
          conflict_post_id?: string | null
          conflict_reason?: string | null
          created_at?: string | null
          discussion_template_id: string
          id?: string
          posted_at?: string | null
          posted_post_id?: string | null
          priority?: number | null
          scheduled_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_user_id?: string
          conflict_post_id?: string | null
          conflict_reason?: string | null
          created_at?: string | null
          discussion_template_id?: string
          id?: string
          posted_at?: string | null
          posted_post_id?: string | null
          priority?: number | null
          scheduled_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_discussion_posts_conflict_post_id_fkey"
            columns: ["conflict_post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_discussion_posts_discussion_template_id_fkey"
            columns: ["discussion_template_id"]
            isOneToOne: false
            referencedRelation: "discussion_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_discussion_posts_posted_post_id_fkey"
            columns: ["posted_post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduler_settings: {
        Row: {
          conflict_action: string | null
          conflict_detection_enabled: boolean | null
          frequency: string | null
          id: string
          lookback_days: number | null
          max_posts_per_week: number | null
          preferred_days: number[] | null
          preferred_time: string | null
          similarity_threshold: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          conflict_action?: string | null
          conflict_detection_enabled?: boolean | null
          frequency?: string | null
          id?: string
          lookback_days?: number | null
          max_posts_per_week?: number | null
          preferred_days?: number[] | null
          preferred_time?: string | null
          similarity_threshold?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          conflict_action?: string | null
          conflict_detection_enabled?: boolean | null
          frequency?: string | null
          id?: string
          lookback_days?: number | null
          max_posts_per_week?: number | null
          preferred_days?: number[] | null
          preferred_time?: string | null
          similarity_threshold?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
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
      states: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          setting_key?: string
          setting_type?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      system_templates: {
        Row: {
          created_at: string
          created_by: string | null
          html_content: string
          id: string
          is_active: boolean
          last_modified_by: string | null
          subject: string | null
          template_name: string
          template_type: string
          text_content: string | null
          updated_at: string
          variables: Json | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          html_content: string
          id?: string
          is_active?: boolean
          last_modified_by?: string | null
          subject?: string | null
          template_name: string
          template_type: string
          text_content?: string | null
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          html_content?: string
          id?: string
          is_active?: boolean
          last_modified_by?: string | null
          subject?: string | null
          template_name?: string
          template_type?: string
          text_content?: string | null
          updated_at?: string
          variables?: Json | null
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
        Relationships: []
      }
      user_comments: {
        Row: {
          comment_text: string
          commenter_id: string
          created_at: string
          id: string
          target_user_id: string
          updated_at: string
        }
        Insert: {
          comment_text: string
          commenter_id: string
          created_at?: string
          id?: string
          target_user_id: string
          updated_at?: string
        }
        Update: {
          comment_text?: string
          commenter_id?: string
          created_at?: string
          id?: string
          target_user_id?: string
          updated_at?: string
        }
        Relationships: []
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
      user_preferences: {
        Row: {
          created_at: string
          direct_invite_only: boolean
          email_community_activity: boolean
          email_feedback_received: boolean
          email_new_connections: boolean
          email_new_messages: boolean
          email_weekly_digest: boolean
          id: string
          profile_visibility: string
          push_enabled: boolean
          push_network_updates: boolean
          push_new_messages: boolean
          search_visibility: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          direct_invite_only?: boolean
          email_community_activity?: boolean
          email_feedback_received?: boolean
          email_new_connections?: boolean
          email_new_messages?: boolean
          email_weekly_digest?: boolean
          id?: string
          profile_visibility?: string
          push_enabled?: boolean
          push_network_updates?: boolean
          push_new_messages?: boolean
          search_visibility?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          direct_invite_only?: boolean
          email_community_activity?: boolean
          email_feedback_received?: boolean
          email_new_connections?: boolean
          email_new_messages?: boolean
          email_weekly_digest?: boolean
          id?: string
          profile_visibility?: string
          push_enabled?: boolean
          push_network_updates?: boolean
          push_new_messages?: boolean
          search_visibility?: boolean
          updated_at?: string
          user_id?: string
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
      user_role_counters: {
        Row: {
          counter: number
          created_at: string | null
          role: string
        }
        Insert: {
          counter?: number
          created_at?: string | null
          role: string
        }
        Update: {
          counter?: number
          created_at?: string | null
          role?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          anonymous_username: string | null
          boost_expiration: string | null
          community_score: number | null
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          last_active: string | null
          profile_complete: number | null
          referred_by: string | null
          role: Database["public"]["Enums"]["user_role"]
          trust_score: number | null
          updated_at: string | null
        }
        Insert: {
          anonymous_username?: string | null
          boost_expiration?: string | null
          community_score?: number | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          last_active?: string | null
          profile_complete?: number | null
          referred_by?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          trust_score?: number | null
          updated_at?: string | null
        }
        Update: {
          anonymous_username?: string | null
          boost_expiration?: string | null
          community_score?: number | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          last_active?: string | null
          profile_complete?: number | null
          referred_by?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          trust_score?: number | null
          updated_at?: string | null
        }
        Relationships: []
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
        Relationships: []
      }
      vendor_signups: {
        Row: {
          agreed_to_analytics: boolean | null
          anonymous_username: string | null
          company_name: string | null
          company_website: string | null
          created_at: string
          current_challenges: string[] | null
          email: string
          feedback_access_token: string | null
          feedback_token_expires_at: string | null
          id: string
          interested_features: string[] | null
          interested_in_beta_testing: boolean | null
          join_feedback_group: boolean | null
          primary_service: string[] | null
          states_covered: string[] | null
          status: string | null
          updated_at: string
        }
        Insert: {
          agreed_to_analytics?: boolean | null
          anonymous_username?: string | null
          company_name?: string | null
          company_website?: string | null
          created_at?: string
          current_challenges?: string[] | null
          email: string
          feedback_access_token?: string | null
          feedback_token_expires_at?: string | null
          id?: string
          interested_features?: string[] | null
          interested_in_beta_testing?: boolean | null
          join_feedback_group?: boolean | null
          primary_service?: string[] | null
          states_covered?: string[] | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          agreed_to_analytics?: boolean | null
          anonymous_username?: string | null
          company_name?: string | null
          company_website?: string | null
          created_at?: string
          current_challenges?: string[] | null
          email?: string
          feedback_access_token?: string | null
          feedback_token_expires_at?: string | null
          id?: string
          interested_features?: string[] | null
          interested_in_beta_testing?: boolean | null
          join_feedback_group?: boolean | null
          primary_service?: string[] | null
          states_covered?: string[] | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      zip_codes: {
        Row: {
          county_id: string
          created_at: string
          id: string
          rural_urban_designation: string
          state_id: string
          updated_at: string
          zip_code: string
        }
        Insert: {
          county_id: string
          created_at?: string
          id?: string
          rural_urban_designation: string
          state_id: string
          updated_at?: string
          zip_code: string
        }
        Update: {
          county_id?: string
          created_at?: string
          id?: string
          rural_urban_designation?: string
          state_id?: string
          updated_at?: string
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "zip_codes_county_id_fkey"
            columns: ["county_id"]
            isOneToOne: false
            referencedRelation: "counties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zip_codes_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
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
      users_with_display_names: {
        Row: {
          anonymous_username: string | null
          boost_expiration: string | null
          community_score: number | null
          created_at: string | null
          display_name: string | null
          id: string | null
          last_active: string | null
          profile_complete: number | null
          role: Database["public"]["Enums"]["user_role"] | null
          trust_score: number | null
          updated_at: string | null
        }
        Insert: {
          anonymous_username?: string | null
          boost_expiration?: string | null
          community_score?: number | null
          created_at?: string | null
          display_name?: never
          id?: string | null
          last_active?: string | null
          profile_complete?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          trust_score?: number | null
          updated_at?: string | null
        }
        Update: {
          anonymous_username?: string | null
          boost_expiration?: string | null
          community_score?: number | null
          created_at?: string | null
          display_name?: never
          id?: string | null
          last_active?: string | null
          profile_complete?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          trust_score?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_new_role_type: {
        Args: { new_role_name: string }
        Returns: boolean
      }
      admin_update_user_role: {
        Args: {
          target_user_id: string
          new_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      award_credit: {
        Args: {
          target_user_id: string
          credit_amount: number
          credit_reason: string
        }
        Returns: boolean
      }
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
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
      can_create_flag: {
        Args: { user_id: string }
        Returns: boolean
      }
      cleanup_expired_ai_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      ensure_admin_exists: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      ensure_role_counter_exists: {
        Args: { role_name: string }
        Returns: undefined
      }
      generate_anonymous_username: {
        Args: { user_type_param: string }
        Returns: string
      }
      get_or_create_user_preferences: {
        Args: { target_user_id: string }
        Returns: {
          created_at: string
          direct_invite_only: boolean
          email_community_activity: boolean
          email_feedback_received: boolean
          email_new_connections: boolean
          email_new_messages: boolean
          email_weekly_digest: boolean
          id: string
          profile_visibility: string
          push_enabled: boolean
          push_network_updates: boolean
          push_new_messages: boolean
          search_visibility: boolean
          updated_at: string
          user_id: string
        }
      }
      get_role_counters: {
        Args: Record<PropertyKey, never>
        Returns: {
          role: string
          counter: number
          created_at: string
        }[]
      }
      get_trending_tags: {
        Args: {
          days_back?: number
          tag_limit?: number
          section_filter?: string
        }
        Returns: {
          tag_name: string
          tag_count: number
        }[]
      }
      get_user_display_name: {
        Args: { target_user_id: string }
        Returns: string
      }
      get_user_email: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_login_analytics: {
        Args: { target_anonymous_username: string; days_back?: number }
        Returns: {
          anonymous_username: string
          display_name: string
          role: Database["public"]["Enums"]["user_role"]
          last_active: string
          days_since_last_active: number
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_saved_posts: {
        Args: { target_user_id: string }
        Returns: {
          post_id: string
          title: string
          content: string
          post_type: string
          section: string
          saved_at: string
          post_created_at: string
        }[]
      }
      has_signed_nda: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete: {
        Args:
          | { uri: string }
          | { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_get: {
        Args: { uri: string } | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post: {
        Args:
          | { uri: string; content: string; content_type: string }
          | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_put: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      is_beta_tester: {
        Args: { user_email: string }
        Returns: boolean
      }
      populate_location_data_from_csv: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reset_role_counter: {
        Args: { target_role: string; new_value?: number }
        Returns: boolean
      }
      search_posts_by_tags: {
        Args: {
          search_tags: string[]
          section_filter?: string
          limit_count?: number
        }
        Returns: {
          id: string
          title: string
          content: string
          post_type: string
          user_tags: string[]
          system_tags: string[]
          helpful_votes: number
          created_at: string
          user_id: string
        }[]
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
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      toggle_user_activation: {
        Args: { target_user_id: string; is_active_param: boolean }
        Returns: boolean
      }
      update_trust_score: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      update_user_last_active: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string
      }
      validate_tag_length: {
        Args: { tags: string[] }
        Returns: boolean
      }
    }
    Enums: {
      flag_status: "pending" | "reviewed" | "dismissed"
      flag_target_type: "profile" | "post" | "comment"
      unlock_method: "credit" | "referral" | "purchase"
      user_role: "field_rep" | "vendor" | "moderator" | "admin"
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
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
