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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      abandonment_alerts: {
        Row: {
          alert_type: string
          child_id: string
          created_at: string | null
          days_inactive: number | null
          id: string
          is_resolved: boolean | null
          last_activity_at: string | null
          message: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
        }
        Insert: {
          alert_type: string
          child_id: string
          created_at?: string | null
          days_inactive?: number | null
          id?: string
          is_resolved?: boolean | null
          last_activity_at?: string | null
          message?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
        }
        Update: {
          alert_type?: string
          child_id?: string
          created_at?: string | null
          days_inactive?: number | null
          id?: string
          is_resolved?: boolean | null
          last_activity_at?: string | null
          message?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "abandonment_alerts_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "abandonment_alerts_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "abandonment_alerts_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "abandonment_alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "abandonment_alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      accessibility_presets: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          label: string
          profile: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: string
          label: string
          profile?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          label?: string
          profile?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      accessibility_profiles: {
        Row: {
          game_id: string | null
          id: string
          preset_id: string | null
          profile: Json
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          game_id?: string | null
          id?: string
          preset_id?: string | null
          profile?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          game_id?: string | null
          id?: string
          preset_id?: string | null
          profile?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accessibility_profiles_preset_id_fkey"
            columns: ["preset_id"]
            isOneToOne: false
            referencedRelation: "accessibility_presets"
            referencedColumns: ["id"]
          },
        ]
      }
      achievements: {
        Row: {
          category: string
          created_at: string | null
          description: string
          icon: string
          id: string
          key: string
          name: string
          rarity: string
          required_value: number
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          icon: string
          id?: string
          key: string
          name: string
          rarity?: string
          required_value: number
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          key?: string
          name?: string
          rarity?: string
          required_value?: number
        }
        Relationships: []
      }
      adaptive_progress: {
        Row: {
          ai_insights: Json | null
          avg_accuracy: number | null
          avg_reaction_time_ms: number | null
          child_profile_id: string
          created_at: string | null
          current_difficulty: number | null
          game_id: string
          id: string
          last_played_at: string | null
          mastery_level: number | null
          recommended_next_difficulty: number | null
          sessions_completed: number | null
          total_score: number | null
          updated_at: string | null
        }
        Insert: {
          ai_insights?: Json | null
          avg_accuracy?: number | null
          avg_reaction_time_ms?: number | null
          child_profile_id: string
          created_at?: string | null
          current_difficulty?: number | null
          game_id: string
          id?: string
          last_played_at?: string | null
          mastery_level?: number | null
          recommended_next_difficulty?: number | null
          sessions_completed?: number | null
          total_score?: number | null
          updated_at?: string | null
        }
        Update: {
          ai_insights?: Json | null
          avg_accuracy?: number | null
          avg_reaction_time_ms?: number | null
          child_profile_id?: string
          created_at?: string | null
          current_difficulty?: number | null
          game_id?: string
          id?: string
          last_played_at?: string | null
          mastery_level?: number | null
          recommended_next_difficulty?: number | null
          sessions_completed?: number | null
          total_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "adaptive_progress_child_profile_id_fkey"
            columns: ["child_profile_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adaptive_progress_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "cognitive_games"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_content_recommendations: {
        Row: {
          applied_at: string | null
          child_id: string
          confidence_score: number | null
          content_id: string | null
          content_name: string | null
          created_at: string | null
          dismissed_at: string | null
          expires_at: string | null
          id: string
          is_applied: boolean | null
          reason: string | null
          recommendation_type: string
        }
        Insert: {
          applied_at?: string | null
          child_id: string
          confidence_score?: number | null
          content_id?: string | null
          content_name?: string | null
          created_at?: string | null
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          is_applied?: boolean | null
          reason?: string | null
          recommendation_type: string
        }
        Update: {
          applied_at?: string | null
          child_id?: string
          confidence_score?: number | null
          content_id?: string | null
          content_name?: string | null
          created_at?: string | null
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          is_applied?: boolean | null
          reason?: string | null
          recommendation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_content_recommendations_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_content_recommendations_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "ai_content_recommendations_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_emotional_analysis: {
        Row: {
          analysis_date: string
          child_id: string
          confidence_score: number | null
          created_at: string | null
          data_sources: Json | null
          detected_patterns: Json | null
          emotional_state: string | null
          id: string
          recommendations: Json | null
        }
        Insert: {
          analysis_date: string
          child_id: string
          confidence_score?: number | null
          created_at?: string | null
          data_sources?: Json | null
          detected_patterns?: Json | null
          emotional_state?: string | null
          id?: string
          recommendations?: Json | null
        }
        Update: {
          analysis_date?: string
          child_id?: string
          confidence_score?: number | null
          created_at?: string | null
          data_sources?: Json | null
          detected_patterns?: Json | null
          emotional_state?: string | null
          id?: string
          recommendations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_emotional_analysis_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_emotional_analysis_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "ai_emotional_analysis_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_generated_stories: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          child_id: string | null
          created_at: string | null
          generated_story: Json
          id: string
          problem_description: string
          requested_by: string
          status: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          child_id?: string | null
          created_at?: string | null
          generated_story: Json
          id?: string
          problem_description: string
          requested_by: string
          status?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          child_id?: string | null
          created_at?: string | null
          generated_story?: Json
          id?: string
          problem_description?: string
          requested_by?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_generated_stories_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generated_stories_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "ai_generated_stories_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_recommendations: {
        Row: {
          applied_at: string | null
          child_profile_id: string
          created_at: string | null
          description: string | null
          id: string
          priority: number | null
          reasoning: string | null
          recommendation_type: string
          recommended_games: string[] | null
          status: string | null
          suggested_actions: Json | null
          title: string
          valid_until: string | null
        }
        Insert: {
          applied_at?: string | null
          child_profile_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: number | null
          reasoning?: string | null
          recommendation_type: string
          recommended_games?: string[] | null
          status?: string | null
          suggested_actions?: Json | null
          title: string
          valid_until?: string | null
        }
        Update: {
          applied_at?: string | null
          child_profile_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: number | null
          reasoning?: string | null
          recommendation_type?: string
          recommended_games?: string[] | null
          status?: string | null
          suggested_actions?: Json | null
          title?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_recommendations_child_profile_id_fkey"
            columns: ["child_profile_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          institution_id: string | null
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          permissions: string[] | null
          rate_limit_per_hour: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          permissions?: string[] | null
          rate_limit_per_hour?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          permissions?: string[] | null
          rate_limit_per_hour?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      api_usage_logs: {
        Row: {
          api_key_id: string
          created_at: string | null
          endpoint: string
          id: string
          ip_address: unknown
          method: string
          response_time_ms: number | null
          status_code: number | null
        }
        Insert: {
          api_key_id: string
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address?: unknown
          method: string
          response_time_ms?: number | null
          status_code?: number | null
        }
        Update: {
          api_key_id?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: unknown
          method?: string
          response_time_ms?: number | null
          status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          id: string
          ip_address: unknown
          resource_id: string | null
          resource_type: string
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      avatar_emotional_states: {
        Row: {
          child_id: string
          current_mood: string | null
          energy_level: number | null
          id: string
          last_activity_at: string | null
          mode: string | null
          updated_at: string | null
        }
        Insert: {
          child_id: string
          current_mood?: string | null
          energy_level?: number | null
          id?: string
          last_activity_at?: string | null
          mode?: string | null
          updated_at?: string | null
        }
        Update: {
          child_id?: string
          current_mood?: string | null
          energy_level?: number | null
          id?: string
          last_activity_at?: string | null
          mode?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avatar_emotional_states_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avatar_emotional_states_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "avatar_emotional_states_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      avatar_items: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          is_premium: boolean | null
          item_type: string
          name: string
          rarity: string | null
          unlock_requirement: string | null
          unlock_value: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          is_premium?: boolean | null
          item_type: string
          name: string
          rarity?: string | null
          unlock_requirement?: string | null
          unlock_value?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          is_premium?: boolean | null
          item_type?: string
          name?: string
          rarity?: string | null
          unlock_requirement?: string | null
          unlock_value?: number | null
        }
        Relationships: []
      }
      behavioral_insights: {
        Row: {
          child_profile_id: string | null
          created_at: string | null
          description: string
          id: string
          insight_type: string
          severity: string
          status: string | null
          supporting_data: Json | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          child_profile_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          insight_type: string
          severity?: string
          status?: string | null
          supporting_data?: Json | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          child_profile_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          insight_type?: string
          severity?: string
          status?: string | null
          supporting_data?: Json | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "behavioral_insights_child_profile_id_fkey"
            columns: ["child_profile_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      biofeedback_alerts: {
        Row: {
          acknowledged_at: string | null
          alert_type: string
          child_id: string
          created_at: string | null
          id: string
          is_acknowledged: boolean | null
          message: string
          recommendation: string | null
          severity: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          alert_type: string
          child_id: string
          created_at?: string | null
          id?: string
          is_acknowledged?: boolean | null
          message: string
          recommendation?: string | null
          severity?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          alert_type?: string
          child_id?: string
          created_at?: string | null
          id?: string
          is_acknowledged?: boolean | null
          message?: string
          recommendation?: string | null
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "biofeedback_alerts_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biofeedback_alerts_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "biofeedback_alerts_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      biofeedback_readings: {
        Row: {
          child_id: string | null
          connection_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          reading_type: string
          recorded_at: string
          unit: string
          value: number
        }
        Insert: {
          child_id?: string | null
          connection_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          reading_type: string
          recorded_at: string
          unit: string
          value: number
        }
        Update: {
          child_id?: string | null
          connection_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          reading_type?: string
          recorded_at?: string
          unit?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "biofeedback_readings_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biofeedback_readings_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "biofeedback_readings_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biofeedback_readings_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "wearable_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      case_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string
          from_professional_id: string | null
          id: string
          queue_item_id: string
          reason: string | null
          to_professional_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by: string
          from_professional_id?: string | null
          id?: string
          queue_item_id: string
          reason?: string | null
          to_professional_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string
          from_professional_id?: string | null
          id?: string
          queue_item_id?: string
          reason?: string | null
          to_professional_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_assignments_from_professional_id_fkey"
            columns: ["from_professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_assignments_from_professional_id_fkey"
            columns: ["from_professional_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_assignments_queue_item_id_fkey"
            columns: ["queue_item_id"]
            isOneToOne: false
            referencedRelation: "queue_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_assignments_to_professional_id_fkey"
            columns: ["to_professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_assignments_to_professional_id_fkey"
            columns: ["to_professional_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          behavioral_tags: string[] | null
          child_profile_id: string | null
          context_type: string
          created_at: string | null
          id: string
          sentiment_score: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          behavioral_tags?: string[] | null
          child_profile_id?: string | null
          context_type?: string
          created_at?: string | null
          id?: string
          sentiment_score?: number | null
          title?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          behavioral_tags?: string[] | null
          child_profile_id?: string | null
          context_type?: string
          created_at?: string | null
          id?: string
          sentiment_score?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_child_profile_id_fkey"
            columns: ["child_profile_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      child_access: {
        Row: {
          access_level: string
          approval_status: string | null
          approved_at: string | null
          child_id: string
          expires_at: string | null
          granted_at: string | null
          granted_by: string
          id: string
          is_active: boolean | null
          professional_id: string
        }
        Insert: {
          access_level: string
          approval_status?: string | null
          approved_at?: string | null
          child_id: string
          expires_at?: string | null
          granted_at?: string | null
          granted_by: string
          id?: string
          is_active?: boolean | null
          professional_id: string
        }
        Update: {
          access_level?: string
          approval_status?: string | null
          approved_at?: string | null
          child_id?: string
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string
          id?: string
          is_active?: boolean | null
          professional_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_access_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_access_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "child_access_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_access_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_access_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_access_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_access_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      child_avatar_items: {
        Row: {
          child_id: string
          id: string
          is_equipped: boolean | null
          item_id: string
          unlocked_at: string | null
        }
        Insert: {
          child_id: string
          id?: string
          is_equipped?: boolean | null
          item_id: string
          unlocked_at?: string | null
        }
        Update: {
          child_id?: string
          id?: string
          is_equipped?: boolean | null
          item_id?: string
          unlocked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "child_avatar_items_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_avatar_items_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "child_avatar_items_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_avatar_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "avatar_items"
            referencedColumns: ["id"]
          },
        ]
      }
      child_profiles: {
        Row: {
          cognitive_baseline: Json | null
          created_at: string | null
          current_level: number | null
          date_of_birth: string
          diagnosed_conditions: string[] | null
          id: string
          name: string
          parent_user_id: string
          sensory_profile: Json | null
          total_stars: number | null
          updated_at: string | null
        }
        Insert: {
          cognitive_baseline?: Json | null
          created_at?: string | null
          current_level?: number | null
          date_of_birth: string
          diagnosed_conditions?: string[] | null
          id?: string
          name: string
          parent_user_id: string
          sensory_profile?: Json | null
          total_stars?: number | null
          updated_at?: string | null
        }
        Update: {
          cognitive_baseline?: Json | null
          created_at?: string | null
          current_level?: number | null
          date_of_birth?: string
          diagnosed_conditions?: string[] | null
          id?: string
          name?: string
          parent_user_id?: string
          sensory_profile?: Json | null
          total_stars?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      children: {
        Row: {
          avatar_url: string | null
          birth_date: string
          consent_data_usage: boolean | null
          consent_research: boolean | null
          created_at: string | null
          gender: string | null
          id: string
          is_active: boolean | null
          name: string
          neurodevelopmental_conditions: Json | null
          parent_id: string | null
          relationship_type: string | null
          sensory_profile: Json | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          birth_date: string
          consent_data_usage?: boolean | null
          consent_research?: boolean | null
          created_at?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          neurodevelopmental_conditions?: Json | null
          parent_id?: string | null
          relationship_type?: string | null
          sensory_profile?: Json | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string
          consent_data_usage?: boolean | null
          consent_research?: boolean | null
          created_at?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          neurodevelopmental_conditions?: Json | null
          parent_id?: string | null
          relationship_type?: string | null
          sensory_profile?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "children_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "children_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class_students: {
        Row: {
          child_id: string
          class_id: string
          enrolled_at: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          teacher_id: string | null
        }
        Insert: {
          child_id: string
          class_id: string
          enrolled_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          teacher_id?: string | null
        }
        Update: {
          child_id?: string
          class_id?: string
          enrolled_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_students_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_students_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "class_students_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "school_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "teacher_student_relationships"
            referencedColumns: ["class_id"]
          },
        ]
      }
      classroom_weekly_reports: {
        Row: {
          active_students: number | null
          avg_engagement_score: number | null
          class_id: string
          concerns: Json | null
          generated_at: string | null
          highlights: Json | null
          id: string
          is_sent: boolean | null
          sent_to: string[] | null
          skill_metrics: Json | null
          total_students: number | null
          week_end: string
          week_start: string
        }
        Insert: {
          active_students?: number | null
          avg_engagement_score?: number | null
          class_id: string
          concerns?: Json | null
          generated_at?: string | null
          highlights?: Json | null
          id?: string
          is_sent?: boolean | null
          sent_to?: string[] | null
          skill_metrics?: Json | null
          total_students?: number | null
          week_end: string
          week_start: string
        }
        Update: {
          active_students?: number | null
          avg_engagement_score?: number | null
          class_id?: string
          concerns?: Json | null
          generated_at?: string | null
          highlights?: Json | null
          id?: string
          is_sent?: boolean | null
          sent_to?: string[] | null
          skill_metrics?: Json | null
          total_students?: number | null
          week_end?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "classroom_weekly_reports_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "school_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classroom_weekly_reports_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "teacher_student_relationships"
            referencedColumns: ["class_id"]
          },
        ]
      }
      clinical_audit_logs: {
        Row: {
          action_details: Json | null
          action_type: string
          child_id: string | null
          created_at: string
          id: string
          ip_address: unknown
          professional_id: string | null
          resource_id: string | null
          resource_type: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          child_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          professional_id?: string | null
          resource_id?: string | null
          resource_type: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          child_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          professional_id?: string | null
          resource_id?: string | null
          resource_type?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinical_audit_logs_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_audit_logs_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "clinical_audit_logs_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_outcomes: {
        Row: {
          behavioral_improvement: number | null
          child_id: string
          cognitive_improvement: number | null
          created_at: string | null
          entry_behavioral_score: number | null
          entry_cognitive_score: number | null
          entry_global_risk: string | null
          entry_socioemotional_score: number | null
          exit_behavioral_score: number | null
          exit_cognitive_score: number | null
          exit_global_risk: string | null
          exit_socioemotional_score: number | null
          global_improvement: number | null
          id: string
          measurement_end: string | null
          measurement_start: string
          outcome_classification: string | null
          plan_adherence_percentage: number | null
          professional_id: string
          socioemotional_improvement: number | null
          total_sessions: number | null
          updated_at: string | null
        }
        Insert: {
          behavioral_improvement?: number | null
          child_id: string
          cognitive_improvement?: number | null
          created_at?: string | null
          entry_behavioral_score?: number | null
          entry_cognitive_score?: number | null
          entry_global_risk?: string | null
          entry_socioemotional_score?: number | null
          exit_behavioral_score?: number | null
          exit_cognitive_score?: number | null
          exit_global_risk?: string | null
          exit_socioemotional_score?: number | null
          global_improvement?: number | null
          id?: string
          measurement_end?: string | null
          measurement_start: string
          outcome_classification?: string | null
          plan_adherence_percentage?: number | null
          professional_id: string
          socioemotional_improvement?: number | null
          total_sessions?: number | null
          updated_at?: string | null
        }
        Update: {
          behavioral_improvement?: number | null
          child_id?: string
          cognitive_improvement?: number | null
          created_at?: string | null
          entry_behavioral_score?: number | null
          entry_cognitive_score?: number | null
          entry_global_risk?: string | null
          entry_socioemotional_score?: number | null
          exit_behavioral_score?: number | null
          exit_cognitive_score?: number | null
          exit_global_risk?: string | null
          exit_socioemotional_score?: number | null
          global_improvement?: number | null
          id?: string
          measurement_end?: string | null
          measurement_start?: string
          outcome_classification?: string | null
          plan_adherence_percentage?: number | null
          professional_id?: string
          socioemotional_improvement?: number | null
          total_sessions?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinical_outcomes_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_outcomes_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "clinical_outcomes_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_pattern_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          action_taken: string | null
          alert_type: string
          child_id: string
          created_at: string
          description: string
          detected_pattern: Json | null
          domain: string
          id: string
          is_acknowledged: boolean | null
          professional_id: string | null
          recommendations: Json | null
          severity: string
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          action_taken?: string | null
          alert_type: string
          child_id: string
          created_at?: string
          description: string
          detected_pattern?: Json | null
          domain: string
          id?: string
          is_acknowledged?: boolean | null
          professional_id?: string | null
          recommendations?: Json | null
          severity?: string
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          action_taken?: string | null
          alert_type?: string
          child_id?: string
          created_at?: string
          description?: string
          detected_pattern?: Json | null
          domain?: string
          id?: string
          is_acknowledged?: boolean | null
          professional_id?: string | null
          recommendations?: Json | null
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_pattern_alerts_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_pattern_alerts_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "clinical_pattern_alerts_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_protocols: {
        Row: {
          age_max: number | null
          age_min: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_weeks: number | null
          evaluation_metrics: Json | null
          id: string
          is_active: boolean | null
          name: string
          recommended_games: string[] | null
          recommended_trails: string[] | null
          sessions_per_week: number | null
          target_condition: string
          updated_at: string | null
        }
        Insert: {
          age_max?: number | null
          age_min?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_weeks?: number | null
          evaluation_metrics?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          recommended_games?: string[] | null
          recommended_trails?: string[] | null
          sessions_per_week?: number | null
          target_condition: string
          updated_at?: string | null
        }
        Update: {
          age_max?: number | null
          age_min?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_weeks?: number | null
          evaluation_metrics?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          recommended_games?: string[] | null
          recommended_trails?: string[] | null
          sessions_per_week?: number | null
          target_condition?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      clinical_reports: {
        Row: {
          alert_flags: Json | null
          created_at: string
          detailed_analysis: Json | null
          generated_by_ai: boolean | null
          generated_date: string
          id: string
          intervention_recommendations: Json | null
          progress_indicators: Json | null
          report_period_end: string
          report_period_start: string
          report_type: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewed_by_professional: boolean | null
          summary_insights: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_flags?: Json | null
          created_at?: string
          detailed_analysis?: Json | null
          generated_by_ai?: boolean | null
          generated_date?: string
          id?: string
          intervention_recommendations?: Json | null
          progress_indicators?: Json | null
          report_period_end: string
          report_period_start: string
          report_type: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewed_by_professional?: boolean | null
          summary_insights?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_flags?: Json | null
          created_at?: string
          detailed_analysis?: Json | null
          generated_by_ai?: boolean | null
          generated_date?: string
          id?: string
          intervention_recommendations?: Json | null
          progress_indicators?: Json | null
          report_period_end?: string
          report_period_start?: string
          report_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewed_by_professional?: boolean | null
          summary_insights?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cognitive_games: {
        Row: {
          active: boolean | null
          age_max: number | null
          age_min: number | null
          avg_duration_minutes: number | null
          category_id: string | null
          cognitive_domains: string[] | null
          created_at: string | null
          description: string | null
          difficulty_levels: number | null
          game_config: Json | null
          game_id: string
          id: string
          name: string
          sensory_settings: Json | null
          target_conditions: string[] | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          age_max?: number | null
          age_min?: number | null
          avg_duration_minutes?: number | null
          category_id?: string | null
          cognitive_domains?: string[] | null
          created_at?: string | null
          description?: string | null
          difficulty_levels?: number | null
          game_config?: Json | null
          game_id: string
          id?: string
          name: string
          sensory_settings?: Json | null
          target_conditions?: string[] | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          age_max?: number | null
          age_min?: number | null
          avg_duration_minutes?: number | null
          category_id?: string | null
          cognitive_domains?: string[] | null
          created_at?: string | null
          description?: string | null
          difficulty_levels?: number | null
          game_config?: Json | null
          game_id?: string
          id?: string
          name?: string
          sensory_settings?: Json | null
          target_conditions?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cognitive_games_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "game_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      community_categories: {
        Row: {
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          target_audience: string
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          target_audience: string
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          target_audience?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
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
      community_leaderboard: {
        Row: {
          id: string
          period: string
          points: number | null
          rank: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          period: string
          points?: number | null
          rank?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          period?: string
          points?: number | null
          rank?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      community_likes: {
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
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_points: {
        Row: {
          badges_earned: string[] | null
          id: string
          level: number | null
          monthly_points: number | null
          rank: string | null
          total_points: number | null
          updated_at: string | null
          user_id: string
          weekly_points: number | null
        }
        Insert: {
          badges_earned?: string[] | null
          id?: string
          level?: number | null
          monthly_points?: number | null
          rank?: string | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
          weekly_points?: number | null
        }
        Update: {
          badges_earned?: string[] | null
          id?: string
          level?: number | null
          monthly_points?: number | null
          rank?: string | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
          weekly_points?: number | null
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          child_id: string | null
          comments_count: number | null
          content: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_public: boolean | null
          likes_count: number | null
          metadata: Json | null
          post_type: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          child_id?: string | null
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          likes_count?: number | null
          metadata?: Json | null
          post_type: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          child_id?: string | null
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          likes_count?: number | null
          metadata?: Json | null
          post_type?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "community_posts_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      condensed_assessments: {
        Row: {
          assessment_date: string
          behavioral_impulsivity_score: number | null
          behavioral_organization_score: number | null
          behavioral_overall_score: number | null
          behavioral_percentile: number | null
          behavioral_planning_score: number | null
          behavioral_risk: string | null
          behavioral_trend: string | null
          child_id: string
          cognitive_attention_score: number | null
          cognitive_memory_score: number | null
          cognitive_overall_score: number | null
          cognitive_percentile: number | null
          cognitive_processing_score: number | null
          cognitive_risk: string | null
          cognitive_trend: string | null
          created_at: string | null
          id: string
          notes: string | null
          professional_id: string
          socioemotional_anxiety_score: number | null
          socioemotional_interaction_score: number | null
          socioemotional_overall_score: number | null
          socioemotional_percentile: number | null
          socioemotional_regulation_score: number | null
          socioemotional_risk: string | null
          socioemotional_trend: string | null
          source_session_id: string | null
          source_type: string | null
          updated_at: string | null
        }
        Insert: {
          assessment_date?: string
          behavioral_impulsivity_score?: number | null
          behavioral_organization_score?: number | null
          behavioral_overall_score?: number | null
          behavioral_percentile?: number | null
          behavioral_planning_score?: number | null
          behavioral_risk?: string | null
          behavioral_trend?: string | null
          child_id: string
          cognitive_attention_score?: number | null
          cognitive_memory_score?: number | null
          cognitive_overall_score?: number | null
          cognitive_percentile?: number | null
          cognitive_processing_score?: number | null
          cognitive_risk?: string | null
          cognitive_trend?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          professional_id: string
          socioemotional_anxiety_score?: number | null
          socioemotional_interaction_score?: number | null
          socioemotional_overall_score?: number | null
          socioemotional_percentile?: number | null
          socioemotional_regulation_score?: number | null
          socioemotional_risk?: string | null
          socioemotional_trend?: string | null
          source_session_id?: string | null
          source_type?: string | null
          updated_at?: string | null
        }
        Update: {
          assessment_date?: string
          behavioral_impulsivity_score?: number | null
          behavioral_organization_score?: number | null
          behavioral_overall_score?: number | null
          behavioral_percentile?: number | null
          behavioral_planning_score?: number | null
          behavioral_risk?: string | null
          behavioral_trend?: string | null
          child_id?: string
          cognitive_attention_score?: number | null
          cognitive_memory_score?: number | null
          cognitive_overall_score?: number | null
          cognitive_percentile?: number | null
          cognitive_processing_score?: number | null
          cognitive_risk?: string | null
          cognitive_trend?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          professional_id?: string
          socioemotional_anxiety_score?: number | null
          socioemotional_interaction_score?: number | null
          socioemotional_overall_score?: number | null
          socioemotional_percentile?: number | null
          socioemotional_regulation_score?: number | null
          socioemotional_risk?: string | null
          socioemotional_trend?: string | null
          source_session_id?: string | null
          source_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "condensed_assessments_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "condensed_assessments_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "condensed_assessments_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "condensed_assessments_source_session_id_fkey"
            columns: ["source_session_id"]
            isOneToOne: false
            referencedRelation: "teleorientation_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      content_library: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          file_size: number | null
          file_url: string
          id: string
          institution_id: string | null
          is_public: boolean | null
          metadata: Json | null
          mime_type: string | null
          name: string
          tags: string[] | null
          thumbnail_url: string | null
          type: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          institution_id?: string | null
          is_public?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          name: string
          tags?: string[] | null
          thumbnail_url?: string | null
          type: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          institution_id?: string | null
          is_public?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          name?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_library_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_library_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_library_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reports: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          description: string | null
          id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
      content_saves: {
        Row: {
          content_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          content_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          content_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_saves_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "editorial_content"
            referencedColumns: ["id"]
          },
        ]
      }
      content_versions: {
        Row: {
          changes_summary: string | null
          content_id: string
          content_snapshot: Json
          content_type: string
          created_at: string | null
          created_by: string | null
          id: string
          version_number: number
        }
        Insert: {
          changes_summary?: string | null
          content_id: string
          content_snapshot: Json
          content_type: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          version_number?: number
        }
        Update: {
          changes_summary?: string | null
          content_id?: string
          content_snapshot?: Json
          content_type?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cooperative_sessions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          game_id: string
          guest_profile_id: string | null
          host_profile_id: string
          id: string
          session_code: string
          session_data: Json | null
          started_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          game_id: string
          guest_profile_id?: string | null
          host_profile_id: string
          id?: string
          session_code: string
          session_data?: Json | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          game_id?: string
          guest_profile_id?: string | null
          host_profile_id?: string
          id?: string
          session_code?: string
          session_data?: Json | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cooperative_sessions_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "cognitive_games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cooperative_sessions_guest_profile_id_fkey"
            columns: ["guest_profile_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cooperative_sessions_host_profile_id_fkey"
            columns: ["host_profile_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      data_access_logs: {
        Row: {
          access_reason: string | null
          access_type: string
          accessed_child_id: string | null
          accessed_user_id: string | null
          created_at: string | null
          data_category: string
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string
        }
        Insert: {
          access_reason?: string | null
          access_type: string
          accessed_child_id?: string | null
          accessed_user_id?: string | null
          created_at?: string | null
          data_category: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id: string
        }
        Update: {
          access_reason?: string | null
          access_type?: string
          accessed_child_id?: string | null
          accessed_user_id?: string | null
          created_at?: string | null
          data_category?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      data_anonymization_logs: {
        Row: {
          anonymized_by: string
          anonymized_fields: string[]
          created_at: string | null
          id: string
          reason: string | null
          record_id: string
          table_name: string
        }
        Insert: {
          anonymized_by?: string
          anonymized_fields: string[]
          created_at?: string | null
          id?: string
          reason?: string | null
          record_id: string
          table_name: string
        }
        Update: {
          anonymized_by?: string
          anonymized_fields?: string[]
          created_at?: string | null
          id?: string
          reason?: string | null
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      data_consents: {
        Row: {
          child_id: string | null
          consent_given: boolean
          consent_type: string
          consent_version: string
          consented_at: string | null
          id: string
          ip_address: unknown
          revoked_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          child_id?: string | null
          consent_given: boolean
          consent_type: string
          consent_version: string
          consented_at?: string | null
          id?: string
          ip_address?: unknown
          revoked_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          child_id?: string | null
          consent_given?: boolean
          consent_type?: string
          consent_version?: string
          consented_at?: string | null
          id?: string
          ip_address?: unknown
          revoked_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_consents_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_consents_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "data_consents_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_consents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_consents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      data_deletion_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          child_id: string | null
          completed_at: string | null
          created_at: string | null
          data_categories: string[] | null
          id: string
          reason: string | null
          rejection_reason: string | null
          request_type: string
          status: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          child_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          data_categories?: string[] | null
          id?: string
          reason?: string | null
          rejection_reason?: string | null
          request_type: string
          status?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          child_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          data_categories?: string[] | null
          id?: string
          reason?: string | null
          rejection_reason?: string | null
          request_type?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_deletion_requests_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_deletion_requests_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "data_deletion_requests_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      data_export_requests: {
        Row: {
          child_id: string | null
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          expires_at: string | null
          export_url: string | null
          id: string
          request_type: string
          status: string
          user_id: string
        }
        Insert: {
          child_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          expires_at?: string | null
          export_url?: string | null
          id?: string
          request_type: string
          status?: string
          user_id: string
        }
        Update: {
          child_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          expires_at?: string | null
          export_url?: string | null
          id?: string
          request_type?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_export_requests_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_export_requests_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "data_export_requests_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      data_retention_policies: {
        Row: {
          anonymize_after_days: number | null
          created_at: string | null
          data_type: string
          description: string | null
          id: string
          is_active: boolean | null
          retention_days: number
          updated_at: string | null
        }
        Insert: {
          anonymize_after_days?: number | null
          created_at?: string | null
          data_type: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          retention_days: number
          updated_at?: string | null
        }
        Update: {
          anonymize_after_days?: number | null
          created_at?: string | null
          data_type?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          retention_days?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      data_sync_logs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          direction: string
          error_details: Json | null
          id: string
          integration_id: string
          records_failed: number | null
          records_processed: number | null
          started_at: string
          status: string
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          direction: string
          error_details?: Json | null
          id?: string
          integration_id: string
          records_failed?: number | null
          records_processed?: number | null
          started_at: string
          status?: string
          sync_type: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          direction?: string
          error_details?: Json | null
          id?: string
          integration_id?: string
          records_failed?: number | null
          records_processed?: number | null
          started_at?: string
          status?: string
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_sync_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "external_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      development_trails: {
        Row: {
          content_items: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: number | null
          estimated_duration_days: number | null
          id: string
          is_active: boolean | null
          is_premium: boolean | null
          name: string
          sort_order: number | null
          target_age_max: number | null
          target_age_min: number | null
          target_conditions: string[] | null
          updated_at: string | null
        }
        Insert: {
          content_items?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: number | null
          estimated_duration_days?: number | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          name: string
          sort_order?: number | null
          target_age_max?: number | null
          target_age_min?: number | null
          target_conditions?: string[] | null
          updated_at?: string | null
        }
        Update: {
          content_items?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: number | null
          estimated_duration_days?: number | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          name?: string
          sort_order?: number | null
          target_age_max?: number | null
          target_age_min?: number | null
          target_conditions?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "development_trails_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "development_trails_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_prescriptions: {
        Row: {
          child_id: string
          created_at: string
          description: string
          dosage: string | null
          duration: string | null
          end_date: string | null
          frequency: string | null
          id: string
          notes: string | null
          parent_acknowledged_at: string | null
          prescription_type: string
          professional_id: string
          session_id: string | null
          signature_hash: string | null
          signed_at: string | null
          start_date: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          child_id: string
          created_at?: string
          description: string
          dosage?: string | null
          duration?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          notes?: string | null
          parent_acknowledged_at?: string | null
          prescription_type: string
          professional_id: string
          session_id?: string | null
          signature_hash?: string | null
          signed_at?: string | null
          start_date?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          description?: string
          dosage?: string | null
          duration?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          notes?: string | null
          parent_acknowledged_at?: string | null
          prescription_type?: string
          professional_id?: string
          session_id?: string | null
          signature_hash?: string | null
          signed_at?: string | null
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_prescriptions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_prescriptions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "digital_prescriptions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_prescriptions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "teleorientation_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      editorial_content: {
        Row: {
          author_credentials: string | null
          author_name: string | null
          category_id: string | null
          content: string | null
          content_type: string
          created_at: string | null
          id: string
          is_premium: boolean | null
          is_published: boolean | null
          language: string | null
          media_url: string | null
          published_at: string | null
          reading_time_minutes: number | null
          save_count: number | null
          subtitle: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_credentials?: string | null
          author_name?: string | null
          category_id?: string | null
          content?: string | null
          content_type: string
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          is_published?: boolean | null
          language?: string | null
          media_url?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          save_count?: number | null
          subtitle?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_credentials?: string | null
          author_name?: string | null
          category_id?: string | null
          content?: string | null
          content_type?: string
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          is_published?: boolean | null
          language?: string | null
          media_url?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          save_count?: number | null
          subtitle?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "editorial_content_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "community_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      emotional_checkins: {
        Row: {
          child_profile_id: string | null
          completed_at: string | null
          conversation_id: string | null
          created_at: string | null
          emotions_detected: string[] | null
          id: string
          mood_rating: number | null
          notes: string | null
          scheduled_for: string
          user_id: string
        }
        Insert: {
          child_profile_id?: string | null
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string | null
          emotions_detected?: string[] | null
          id?: string
          mood_rating?: number | null
          notes?: string | null
          scheduled_for: string
          user_id: string
        }
        Update: {
          child_profile_id?: string | null
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string | null
          emotions_detected?: string[] | null
          id?: string
          mood_rating?: number | null
          notes?: string | null
          scheduled_for?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emotional_checkins_child_profile_id_fkey"
            columns: ["child_profile_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emotional_checkins_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      external_integrations: {
        Row: {
          config: Json | null
          created_at: string | null
          credentials_encrypted: string | null
          error_message: string | null
          id: string
          institution_id: string | null
          integration_type: string | null
          is_active: boolean | null
          last_sync_at: string | null
          provider: string
          sync_status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          credentials_encrypted?: string | null
          error_message?: string | null
          id?: string
          institution_id?: string | null
          integration_type?: string | null
          is_active?: boolean | null
          last_sync_at?: string | null
          provider: string
          sync_status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          credentials_encrypted?: string | null
          error_message?: string | null
          id?: string
          institution_id?: string | null
          integration_type?: string | null
          is_active?: boolean | null
          last_sync_at?: string | null
          provider?: string
          sync_status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "external_integrations_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      family_links: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          family_member_id: string
          id: string
          parent_user_id: string
          relationship: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          family_member_id: string
          id?: string
          parent_user_id: string
          relationship?: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          family_member_id?: string
          id?: string
          parent_user_id?: string
          relationship?: string
          status?: string
        }
        Relationships: []
      }
      follow_up_plans: {
        Row: {
          child_id: string
          created_at: string | null
          frequency: string | null
          id: string
          interventions: Json | null
          next_review_date: string | null
          objectives: Json | null
          professional_id: string
          session_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          child_id: string
          created_at?: string | null
          frequency?: string | null
          id?: string
          interventions?: Json | null
          next_review_date?: string | null
          objectives?: Json | null
          professional_id: string
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string | null
          frequency?: string | null
          id?: string
          interventions?: Json | null
          next_review_date?: string | null
          objectives?: Json | null
          professional_id?: string
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_plans_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_up_plans_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "follow_up_plans_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_up_plans_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "teleorientation_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_categories: {
        Row: {
          cognitive_domains: string[] | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          target_condition: string[] | null
        }
        Insert: {
          cognitive_domains?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          target_condition?: string[] | null
        }
        Update: {
          cognitive_domains?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          target_condition?: string[] | null
        }
        Relationships: []
      }
      game_metrics: {
        Row: {
          created_at: string | null
          difficulty_at_event: number | null
          event_data: Json | null
          event_type: string
          id: string
          reaction_time_ms: number | null
          session_id: string
          timestamp_ms: number
        }
        Insert: {
          created_at?: string | null
          difficulty_at_event?: number | null
          event_data?: Json | null
          event_type: string
          id?: string
          reaction_time_ms?: number | null
          session_id: string
          timestamp_ms: number
        }
        Update: {
          created_at?: string | null
          difficulty_at_event?: number | null
          event_data?: Json | null
          event_type?: string
          id?: string
          reaction_time_ms?: number | null
          session_id?: string
          timestamp_ms?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_metrics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          accuracy_percentage: number | null
          attention_span_seconds: number | null
          auto_adjusted_difficulty: boolean | null
          avg_reaction_time_ms: number | null
          child_profile_id: string
          completed: boolean | null
          completed_at: string | null
          correct_attempts: number | null
          created_at: string | null
          difficulty_level: number | null
          duration_seconds: number | null
          error_pattern: Json | null
          fastest_reaction_time_ms: number | null
          frustration_events: number | null
          game_id: string
          help_requests: number | null
          id: string
          incorrect_attempts: number | null
          max_possible_score: number | null
          pause_count: number | null
          quit_reason: string | null
          score: number | null
          session_data: Json | null
          session_number: number | null
          slowest_reaction_time_ms: number | null
          started_at: string | null
          total_attempts: number | null
        }
        Insert: {
          accuracy_percentage?: number | null
          attention_span_seconds?: number | null
          auto_adjusted_difficulty?: boolean | null
          avg_reaction_time_ms?: number | null
          child_profile_id: string
          completed?: boolean | null
          completed_at?: string | null
          correct_attempts?: number | null
          created_at?: string | null
          difficulty_level?: number | null
          duration_seconds?: number | null
          error_pattern?: Json | null
          fastest_reaction_time_ms?: number | null
          frustration_events?: number | null
          game_id: string
          help_requests?: number | null
          id?: string
          incorrect_attempts?: number | null
          max_possible_score?: number | null
          pause_count?: number | null
          quit_reason?: string | null
          score?: number | null
          session_data?: Json | null
          session_number?: number | null
          slowest_reaction_time_ms?: number | null
          started_at?: string | null
          total_attempts?: number | null
        }
        Update: {
          accuracy_percentage?: number | null
          attention_span_seconds?: number | null
          auto_adjusted_difficulty?: boolean | null
          avg_reaction_time_ms?: number | null
          child_profile_id?: string
          completed?: boolean | null
          completed_at?: string | null
          correct_attempts?: number | null
          created_at?: string | null
          difficulty_level?: number | null
          duration_seconds?: number | null
          error_pattern?: Json | null
          fastest_reaction_time_ms?: number | null
          frustration_events?: number | null
          game_id?: string
          help_requests?: number | null
          id?: string
          incorrect_attempts?: number | null
          max_possible_score?: number | null
          pause_count?: number | null
          quit_reason?: string | null
          score?: number | null
          session_data?: Json | null
          session_number?: number | null
          slowest_reaction_time_ms?: number | null
          started_at?: string | null
          total_attempts?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_child_profile_id_fkey"
            columns: ["child_profile_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_sessions_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "cognitive_games"
            referencedColumns: ["id"]
          },
        ]
      }
      government_health_integration: {
        Row: {
          api_endpoint: string | null
          certification_expires_at: string | null
          certified_at: string | null
          compliance_certificate: string | null
          created_at: string
          credentials_encrypted: string | null
          id: string
          institution_id: string | null
          integration_type: string
          is_active: boolean | null
          last_sync_at: string | null
          sync_errors: Json | null
          sync_status: string | null
          system_identifier: string | null
          updated_at: string
        }
        Insert: {
          api_endpoint?: string | null
          certification_expires_at?: string | null
          certified_at?: string | null
          compliance_certificate?: string | null
          created_at?: string
          credentials_encrypted?: string | null
          id?: string
          institution_id?: string | null
          integration_type: string
          is_active?: boolean | null
          last_sync_at?: string | null
          sync_errors?: Json | null
          sync_status?: string | null
          system_identifier?: string | null
          updated_at?: string
        }
        Update: {
          api_endpoint?: string | null
          certification_expires_at?: string | null
          certified_at?: string | null
          compliance_certificate?: string | null
          created_at?: string
          credentials_encrypted?: string | null
          id?: string
          institution_id?: string | null
          integration_type?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          sync_errors?: Json | null
          sync_status?: string | null
          system_identifier?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "government_health_integration_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      group_assignments: {
        Row: {
          assigned_by: string
          class_id: string | null
          content_id: string
          content_type: string
          created_at: string | null
          due_date: string | null
          id: string
          institution_id: string | null
          is_active: boolean | null
          notes: string | null
        }
        Insert: {
          assigned_by: string
          class_id?: string | null
          content_id: string
          content_type: string
          created_at?: string | null
          due_date?: string | null
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          notes?: string | null
        }
        Update: {
          assigned_by?: string
          class_id?: string | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          due_date?: string | null
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "school_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "teacher_student_relationships"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "group_assignments_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      health_export_logs: {
        Row: {
          acknowledged_at: string | null
          child_id: string | null
          created_at: string
          data_exported: Json | null
          error_message: string | null
          export_format: string | null
          export_type: string
          id: string
          integration_id: string | null
          response_data: Json | null
          sent_at: string | null
          status: string
        }
        Insert: {
          acknowledged_at?: string | null
          child_id?: string | null
          created_at?: string
          data_exported?: Json | null
          error_message?: string | null
          export_format?: string | null
          export_type: string
          id?: string
          integration_id?: string | null
          response_data?: Json | null
          sent_at?: string | null
          status?: string
        }
        Update: {
          acknowledged_at?: string | null
          child_id?: string | null
          created_at?: string
          data_exported?: Json | null
          error_message?: string | null
          export_format?: string | null
          export_type?: string
          id?: string
          integration_id?: string | null
          response_data?: Json | null
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_export_logs_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_export_logs_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "health_export_logs_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_export_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "government_health_integration"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_members: {
        Row: {
          department: string | null
          id: string
          institution_id: string
          is_active: boolean | null
          joined_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          department?: string | null
          id?: string
          institution_id: string
          is_active?: boolean | null
          joined_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          department?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean | null
          joined_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_members_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          address: string | null
          city: string | null
          contact_email: string
          contact_phone: string | null
          country: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          max_users: number | null
          name: string
          settings: Json | null
          state: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_email: string
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          max_users?: number | null
          name: string
          settings?: Json | null
          state?: string | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_email?: string
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          max_users?: number | null
          name?: string
          settings?: Json | null
          state?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      internal_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          read_at: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          read_at?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          read_at?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          child_birth_date: string | null
          child_conditions: Json | null
          child_name: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          invite_code: string
          invite_type: string
          inviter_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          child_birth_date?: string | null
          child_conditions?: Json | null
          child_name?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invite_code?: string
          invite_type: string
          inviter_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          child_birth_date?: string | null
          child_conditions?: Json | null
          child_name?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invite_code?: string
          invite_type?: string
          inviter_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      learning_sessions: {
        Row: {
          completed: boolean | null
          created_at: string | null
          game_type: string
          id: string
          performance_data: Json | null
          session_duration_seconds: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          game_type: string
          id?: string
          performance_data?: Json | null
          session_duration_seconds?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          game_type?: string
          id?: string
          performance_data?: Json | null
          session_duration_seconds?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      legal_documents: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          document_type: string
          id: string
          is_active: boolean | null
          published_at: string | null
          summary: string | null
          title: string
          version: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          document_type: string
          id?: string
          is_active?: boolean | null
          published_at?: string | null
          summary?: string | null
          title: string
          version: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          document_type?: string
          id?: string
          is_active?: boolean | null
          published_at?: string | null
          summary?: string | null
          title?: string
          version?: string
        }
        Relationships: []
      }
      licenses: {
        Row: {
          created_at: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          license_type: string
          max_students: number
          max_teachers: number
          school_id: string | null
          updated_at: string | null
          valid_from: string
          valid_until: string
        }
        Insert: {
          created_at?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          license_type: string
          max_students: number
          max_teachers: number
          school_id?: string | null
          updated_at?: string | null
          valid_from: string
          valid_until: string
        }
        Update: {
          created_at?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          license_type?: string
          max_students?: number
          max_teachers?: number
          school_id?: string | null
          updated_at?: string | null
          valid_from?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "licenses_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_creators: {
        Row: {
          bio: string | null
          commission_rate: number | null
          created_at: string | null
          credentials: string[] | null
          display_name: string
          id: string
          rating: number | null
          review_count: number | null
          total_earnings: number | null
          updated_at: string | null
          user_id: string
          verification_status: string | null
          verified_at: string | null
        }
        Insert: {
          bio?: string | null
          commission_rate?: number | null
          created_at?: string | null
          credentials?: string[] | null
          display_name: string
          id?: string
          rating?: number | null
          review_count?: number | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
          verified_at?: string | null
        }
        Update: {
          bio?: string | null
          commission_rate?: number | null
          created_at?: string | null
          credentials?: string[] | null
          display_name?: string
          id?: string
          rating?: number | null
          review_count?: number | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      marketplace_items: {
        Row: {
          age_max: number | null
          age_min: number | null
          approved_at: string | null
          approved_by: string | null
          content_data: Json
          created_at: string | null
          creator_id: string
          description: string | null
          download_count: number | null
          id: string
          is_premium_only: boolean | null
          item_type: string
          language: string | null
          preview_url: string | null
          price_coins: number | null
          price_real: number | null
          rating: number | null
          review_count: number | null
          status: string | null
          target_conditions: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          age_max?: number | null
          age_min?: number | null
          approved_at?: string | null
          approved_by?: string | null
          content_data: Json
          created_at?: string | null
          creator_id: string
          description?: string | null
          download_count?: number | null
          id?: string
          is_premium_only?: boolean | null
          item_type: string
          language?: string | null
          preview_url?: string | null
          price_coins?: number | null
          price_real?: number | null
          rating?: number | null
          review_count?: number | null
          status?: string | null
          target_conditions?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          age_max?: number | null
          age_min?: number | null
          approved_at?: string | null
          approved_by?: string | null
          content_data?: Json
          created_at?: string | null
          creator_id?: string
          description?: string | null
          download_count?: number | null
          id?: string
          is_premium_only?: boolean | null
          item_type?: string
          language?: string | null
          preview_url?: string | null
          price_coins?: number | null
          price_real?: number | null
          rating?: number | null
          review_count?: number | null
          status?: string | null
          target_conditions?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_items_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "marketplace_creators"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_purchases: {
        Row: {
          created_at: string | null
          creator_earnings: number | null
          id: string
          item_id: string
          payment_type: string
          platform_fee: number | null
          price_paid: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          creator_earnings?: number | null
          id?: string
          item_id: string
          payment_type: string
          platform_fee?: number | null
          price_paid: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          creator_earnings?: number | null
          id?: string
          item_id?: string
          payment_type?: string
          platform_fee?: number | null
          price_paid?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_purchases_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string
          id: string
          message_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type: string
          id?: string
          message_id: string
          storage_path: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          id?: string
          message_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "secure_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      network_reports: {
        Row: {
          generated_at: string | null
          generated_by: string | null
          id: string
          metrics: Json
          period_end: string
          period_start: string
          region: string | null
          report_type: string
          report_url: string | null
          school_id: string | null
        }
        Insert: {
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          metrics?: Json
          period_end: string
          period_start: string
          region?: string | null
          report_type: string
          report_url?: string | null
          school_id?: string | null
        }
        Update: {
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          metrics?: Json
          period_end?: string
          period_start?: string
          region?: string | null
          report_type?: string
          report_url?: string | null
          school_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "network_reports_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      neuro_anamnesis: {
        Row: {
          allergies: string[] | null
          child_id: string
          complaint_duration: string | null
          completed_at: string | null
          created_at: string
          current_medications: Json | null
          developmental_milestones: Json | null
          family_history: Json | null
          id: string
          learning_difficulties: Json | null
          main_complaint: string
          medical_history: Json | null
          pregnancy_birth_history: Json | null
          previous_diagnoses: string[] | null
          previous_evaluations: Json | null
          professional_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          school_history: Json | null
          social_behavior: Json | null
          status: string | null
          updated_at: string
        }
        Insert: {
          allergies?: string[] | null
          child_id: string
          complaint_duration?: string | null
          completed_at?: string | null
          created_at?: string
          current_medications?: Json | null
          developmental_milestones?: Json | null
          family_history?: Json | null
          id?: string
          learning_difficulties?: Json | null
          main_complaint: string
          medical_history?: Json | null
          pregnancy_birth_history?: Json | null
          previous_diagnoses?: string[] | null
          previous_evaluations?: Json | null
          professional_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_history?: Json | null
          social_behavior?: Json | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          allergies?: string[] | null
          child_id?: string
          complaint_duration?: string | null
          completed_at?: string | null
          created_at?: string
          current_medications?: Json | null
          developmental_milestones?: Json | null
          family_history?: Json | null
          id?: string
          learning_difficulties?: Json | null
          main_complaint?: string
          medical_history?: Json | null
          pregnancy_birth_history?: Json | null
          previous_diagnoses?: string[] | null
          previous_evaluations?: Json | null
          professional_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_history?: Json | null
          social_behavior?: Json | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "neuro_anamnesis_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "neuro_anamnesis_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "neuro_anamnesis_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      operational_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          auto_resolved: boolean | null
          created_at: string | null
          description: string
          id: string
          institution_id: string
          is_acknowledged: boolean | null
          queue_id: string | null
          queue_item_id: string | null
          resolved_at: string | null
          severity: string | null
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          auto_resolved?: boolean | null
          created_at?: string | null
          description: string
          id?: string
          institution_id: string
          is_acknowledged?: boolean | null
          queue_id?: string | null
          queue_item_id?: string | null
          resolved_at?: string | null
          severity?: string | null
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          auto_resolved?: boolean | null
          created_at?: string | null
          description?: string
          id?: string
          institution_id?: string
          is_acknowledged?: boolean | null
          queue_id?: string | null
          queue_item_id?: string | null
          resolved_at?: string | null
          severity?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "operational_alerts_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operational_alerts_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operational_alerts_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operational_alerts_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "service_queues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operational_alerts_queue_item_id_fkey"
            columns: ["queue_item_id"]
            isOneToOne: false
            referencedRelation: "queue_items"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_training: {
        Row: {
          certificate_url: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          module_name: string
          progress_data: Json | null
          score: number | null
          started_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          certificate_url?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          module_name: string
          progress_data?: Json | null
          score?: number | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          certificate_url?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          module_name?: string
          progress_data?: Json | null
          score?: number | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      patient_protocols: {
        Row: {
          child_id: string
          completed_at: string | null
          created_at: string | null
          id: string
          notes: string | null
          progress_percentage: number | null
          protocol_id: string
          started_at: string | null
          status: string | null
          target_end_at: string | null
          therapist_id: string
          updated_at: string | null
        }
        Insert: {
          child_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          progress_percentage?: number | null
          protocol_id: string
          started_at?: string | null
          status?: string | null
          target_end_at?: string | null
          therapist_id: string
          updated_at?: string | null
        }
        Update: {
          child_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          progress_percentage?: number | null
          protocol_id?: string
          started_at?: string | null
          status?: string | null
          target_end_at?: string | null
          therapist_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_protocols_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_protocols_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "patient_protocols_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_protocols_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "clinical_protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          external_payment_id: string | null
          id: string
          invoice_url: string | null
          metadata: Json | null
          paid_at: string | null
          payment_method: string | null
          payment_provider: string | null
          receipt_url: string | null
          status: string
          subscription_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          external_payment_id?: string | null
          id?: string
          invoice_url?: string | null
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          receipt_url?: string | null
          status?: string
          subscription_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          external_payment_id?: string | null
          id?: string
          invoice_url?: string | null
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          receipt_url?: string | null
          status?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      pei_plans: {
        Row: {
          accommodations: Json | null
          created_at: string | null
          goals: Json | null
          id: string
          progress_notes: Json | null
          screening_id: string
          status: string | null
          strategies: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accommodations?: Json | null
          created_at?: string | null
          goals?: Json | null
          id?: string
          progress_notes?: Json | null
          screening_id: string
          status?: string | null
          strategies?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accommodations?: Json | null
          created_at?: string | null
          goals?: Json | null
          id?: string
          progress_notes?: Json | null
          screening_id?: string
          status?: string | null
          strategies?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pei_plans_screening_id_fkey"
            columns: ["screening_id"]
            isOneToOne: false
            referencedRelation: "screenings"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_triage_forms: {
        Row: {
          auto_summary: string | null
          calculated_risk_score: number | null
          checklist_responses: Json
          child_id: string
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          historical_summary: Json | null
          id: string
          reviewed_by: string | null
          risk_level: string | null
          session_id: string | null
          status: string | null
        }
        Insert: {
          auto_summary?: string | null
          calculated_risk_score?: number | null
          checklist_responses?: Json
          child_id: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          historical_summary?: Json | null
          id?: string
          reviewed_by?: string | null
          risk_level?: string | null
          session_id?: string | null
          status?: string | null
        }
        Update: {
          auto_summary?: string | null
          calculated_risk_score?: number | null
          checklist_responses?: Json
          child_id?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          historical_summary?: Json | null
          id?: string
          reviewed_by?: string | null
          risk_level?: string | null
          session_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pre_triage_forms_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_triage_forms_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "pre_triage_forms_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_workload: {
        Row: {
          availability_status: string | null
          created_at: string | null
          current_active_cases: number | null
          id: string
          institution_id: string
          last_assignment_at: string | null
          max_daily_cases: number | null
          max_weekly_cases: number | null
          professional_id: string
          specializations: string[] | null
          updated_at: string | null
        }
        Insert: {
          availability_status?: string | null
          created_at?: string | null
          current_active_cases?: number | null
          id?: string
          institution_id: string
          last_assignment_at?: string | null
          max_daily_cases?: number | null
          max_weekly_cases?: number | null
          professional_id: string
          specializations?: string[] | null
          updated_at?: string | null
        }
        Update: {
          availability_status?: string | null
          created_at?: string | null
          current_active_cases?: number | null
          id?: string
          institution_id?: string
          last_assignment_at?: string | null
          max_daily_cases?: number | null
          max_weekly_cases?: number | null
          professional_id?: string
          specializations?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_workload_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_workload_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_workload_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          professional_registration: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          professional_registration?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          professional_registration?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      queue_items: {
        Row: {
          assigned_to: string | null
          child_id: string
          completed_at: string | null
          created_at: string | null
          entered_queue_at: string | null
          id: string
          notes: string | null
          priority_score: number | null
          queue_id: string
          risk_level: string | null
          sla_breached: boolean | null
          sla_deadline: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          child_id: string
          completed_at?: string | null
          created_at?: string | null
          entered_queue_at?: string | null
          id?: string
          notes?: string | null
          priority_score?: number | null
          queue_id: string
          risk_level?: string | null
          sla_breached?: boolean | null
          sla_deadline?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          child_id?: string
          completed_at?: string | null
          created_at?: string | null
          entered_queue_at?: string | null
          id?: string
          notes?: string | null
          priority_score?: number | null
          queue_id?: string
          risk_level?: string | null
          sla_breached?: boolean | null
          sla_deadline?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "queue_items_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_items_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_items_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_items_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "queue_items_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_items_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "service_queues"
            referencedColumns: ["id"]
          },
        ]
      }
      regional_pricing: {
        Row: {
          country_code: string
          created_at: string | null
          currency_code: string
          id: string
          is_active: boolean | null
          plan_id: string
          price_monthly: number
          price_yearly: number
        }
        Insert: {
          country_code: string
          created_at?: string | null
          currency_code: string
          id?: string
          is_active?: boolean | null
          plan_id: string
          price_monthly: number
          price_yearly: number
        }
        Update: {
          country_code?: string
          created_at?: string | null
          currency_code?: string
          id?: string
          is_active?: boolean | null
          plan_id?: string
          price_monthly?: number
          price_yearly?: number
        }
        Relationships: [
          {
            foreignKeyName: "regional_pricing_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      routine_steps: {
        Row: {
          audio_url: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_completed: boolean | null
          order_number: number
          routine_id: string
          title: string
        }
        Insert: {
          audio_url?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_completed?: boolean | null
          order_number?: number
          routine_id: string
          title: string
        }
        Update: {
          audio_url?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_completed?: boolean | null
          order_number?: number
          routine_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "routine_steps_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      routines: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_template: boolean | null
          routine_type: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_template?: boolean | null
          routine_type?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_template?: boolean | null
          routine_type?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      school_classes: {
        Row: {
          created_at: string | null
          description: string | null
          grade_level: string | null
          id: string
          name: string
          school_id: string | null
          school_year: string | null
          teacher_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          grade_level?: string | null
          id?: string
          name: string
          school_id?: string | null
          school_year?: string | null
          teacher_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          grade_level?: string | null
          id?: string
          name?: string
          school_id?: string | null
          school_year?: string | null
          teacher_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_communications: {
        Row: {
          child_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          priority: string | null
          recipient_role: string
          sender_id: string
          sender_role: string
          subject: string
        }
        Insert: {
          child_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          priority?: string | null
          recipient_role: string
          sender_id: string
          sender_role: string
          subject: string
        }
        Update: {
          child_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          priority?: string | null
          recipient_role?: string
          sender_id?: string
          sender_role?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_communications_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_communications_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "school_communications_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      school_occurrences: {
        Row: {
          child_id: string
          created_at: string | null
          description: string
          follow_up_needed: boolean | null
          id: string
          intervention_taken: string | null
          occurred_at: string
          occurrence_type: string
          severity: string | null
          teacher_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          child_id: string
          created_at?: string | null
          description: string
          follow_up_needed?: boolean | null
          id?: string
          intervention_taken?: string | null
          occurred_at: string
          occurrence_type: string
          severity?: string | null
          teacher_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string | null
          description?: string
          follow_up_needed?: boolean | null
          id?: string
          intervention_taken?: string | null
          occurred_at?: string
          occurrence_type?: string
          severity?: string | null
          teacher_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_occurrences_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_occurrences_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "school_occurrences_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          active: boolean | null
          address: string | null
          city: string | null
          code: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          name: string
          principal_name: string | null
          region: string | null
          state: string | null
          total_students: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          city?: string | null
          code?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          name: string
          principal_name?: string | null
          region?: string | null
          state?: string | null
          total_students?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          city?: string | null
          code?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          name?: string
          principal_name?: string | null
          region?: string | null
          state?: string | null
          total_students?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      screenings: {
        Row: {
          created_at: string | null
          duration: number | null
          id: string
          percentile: number | null
          recommended_action: string | null
          score: number
          test_data: Json | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          id?: string
          percentile?: number | null
          recommended_action?: string | null
          score: number
          test_data?: Json | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          id?: string
          percentile?: number | null
          recommended_action?: string | null
          score?: number
          test_data?: Json | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      secure_messages: {
        Row: {
          child_id: string | null
          content: string
          created_at: string | null
          id: string
          institution_id: string | null
          is_archived: boolean | null
          is_read: boolean | null
          message_type: Database["public"]["Enums"]["message_type"] | null
          metadata: Json | null
          parent_message_id: string | null
          read_at: string | null
          recipient_id: string | null
          sender_id: string
          subject: string | null
        }
        Insert: {
          child_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          institution_id?: string | null
          is_archived?: boolean | null
          is_read?: boolean | null
          message_type?: Database["public"]["Enums"]["message_type"] | null
          metadata?: Json | null
          parent_message_id?: string | null
          read_at?: string | null
          recipient_id?: string | null
          sender_id: string
          subject?: string | null
        }
        Update: {
          child_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          institution_id?: string | null
          is_archived?: boolean | null
          is_read?: boolean | null
          message_type?: Database["public"]["Enums"]["message_type"] | null
          metadata?: Json | null
          parent_message_id?: string | null
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "secure_messages_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secure_messages_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "secure_messages_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secure_messages_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secure_messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "secure_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secure_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secure_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secure_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secure_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_queues: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          institution_id: string | null
          is_active: boolean | null
          name: string
          priority_weight: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          name: string
          priority_weight?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          name?: string
          priority_weight?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_queues_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_configurations: {
        Row: {
          alert_threshold_percent: number | null
          created_at: string | null
          escalation_hours: number | null
          id: string
          institution_id: string
          max_wait_hours: number
          risk_level: string
          updated_at: string | null
        }
        Insert: {
          alert_threshold_percent?: number | null
          created_at?: string | null
          escalation_hours?: number | null
          id?: string
          institution_id: string
          max_wait_hours: number
          risk_level: string
          updated_at?: string | null
        }
        Update: {
          alert_threshold_percent?: number | null
          created_at?: string | null
          escalation_hours?: number | null
          id?: string
          institution_id?: string
          max_wait_hours?: number
          risk_level?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sla_configurations_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      smart_alerts: {
        Row: {
          action_url: string | null
          alert_type: string
          child_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          is_sent: boolean | null
          message: string
          read_at: string | null
          scheduled_for: string | null
          sent_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          alert_type: string
          child_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          is_sent?: boolean | null
          message: string
          read_at?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          alert_type?: string
          child_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          is_sent?: boolean | null
          message?: string
          read_at?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smart_alerts_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smart_alerts_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "smart_alerts_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      social_missions: {
        Row: {
          badge_reward: string | null
          category: string
          created_at: string | null
          description: string
          end_date: string | null
          id: string
          is_active: boolean | null
          mission_type: string
          points_reward: number | null
          requirements: Json
          start_date: string | null
          title: string
        }
        Insert: {
          badge_reward?: string | null
          category: string
          created_at?: string | null
          description: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          mission_type: string
          points_reward?: number | null
          requirements?: Json
          start_date?: string | null
          title: string
        }
        Update: {
          badge_reward?: string | null
          category?: string
          created_at?: string | null
          description?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          mission_type?: string
          points_reward?: number | null
          requirements?: Json
          start_date?: string | null
          title?: string
        }
        Relationships: []
      }
      social_stories: {
        Row: {
          age_max: number | null
          age_min: number | null
          category: Database["public"]["Enums"]["story_category"] | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          age_max?: number | null
          age_min?: number | null
          category?: Database["public"]["Enums"]["story_category"] | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          age_max?: number | null
          age_min?: number | null
          category?: Database["public"]["Enums"]["story_category"] | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      story_assignments: {
        Row: {
          assigned_by: string
          assigned_to: string
          completed_at: string | null
          created_at: string | null
          due_date: string | null
          id: string
          notes: string | null
          routine_id: string | null
          story_id: string | null
        }
        Insert: {
          assigned_by: string
          assigned_to: string
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          routine_id?: string | null
          story_id?: string | null
        }
        Update: {
          assigned_by?: string
          assigned_to?: string
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          routine_id?: string | null
          story_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_assignments_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_assignments_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "social_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          points_earned: number | null
          routine_id: string | null
          story_id: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          points_earned?: number | null
          routine_id?: string | null
          story_id?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          points_earned?: number | null
          routine_id?: string | null
          story_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_progress_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_progress_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "social_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_steps: {
        Row: {
          audio_url: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          order_number: number
          story_id: string | null
          title: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          order_number: number
          story_id?: string | null
          title: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          order_number?: number
          story_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_steps_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "social_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      student_subgroups: {
        Row: {
          class_id: string
          created_at: string | null
          description: string | null
          focus_area: string | null
          id: string
          name: string
        }
        Insert: {
          class_id: string
          created_at?: string | null
          description?: string | null
          focus_area?: string | null
          id?: string
          name: string
        }
        Update: {
          class_id?: string
          created_at?: string | null
          description?: string | null
          focus_area?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_subgroups_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "school_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_subgroups_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "teacher_student_relationships"
            referencedColumns: ["class_id"]
          },
        ]
      }
      subgroup_students: {
        Row: {
          added_at: string | null
          child_id: string
          id: string
          subgroup_id: string
        }
        Insert: {
          added_at?: string | null
          child_id: string
          id?: string
          subgroup_id: string
        }
        Update: {
          added_at?: string | null
          child_id?: string
          id?: string
          subgroup_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subgroup_students_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subgroup_students_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "subgroup_students_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subgroup_students_subgroup_id_fkey"
            columns: ["subgroup_id"]
            isOneToOne: false
            referencedRelation: "student_subgroups"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          currency: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          limits: Json | null
          name: string
          plan_type: Database["public"]["Enums"]["subscription_plan"]
          price_monthly: number | null
          price_yearly: number | null
          slug: string
          sort_order: number | null
          trial_days: number | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          limits?: Json | null
          name: string
          plan_type: Database["public"]["Enums"]["subscription_plan"]
          price_monthly?: number | null
          price_yearly?: number | null
          slug: string
          sort_order?: number | null
          trial_days?: number | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          limits?: Json | null
          name?: string
          plan_type?: Database["public"]["Enums"]["subscription_plan"]
          price_monthly?: number | null
          price_yearly?: number | null
          slug?: string
          sort_order?: number | null
          trial_days?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_cycle: string | null
          cancel_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          external_customer_id: string | null
          external_subscription_id: string | null
          id: string
          institution_id: string | null
          metadata: Json | null
          payment_provider: string | null
          plan_id: string
          status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          billing_cycle?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          external_customer_id?: string | null
          external_subscription_id?: string | null
          id?: string
          institution_id?: string | null
          metadata?: Json | null
          payment_provider?: string | null
          plan_id: string
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          billing_cycle?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          external_customer_id?: string | null
          external_subscription_id?: string | null
          id?: string
          institution_id?: string | null
          metadata?: Json | null
          payment_provider?: string | null
          plan_id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      supported_languages: {
        Row: {
          code: string
          currency_code: string | null
          date_format: string | null
          is_active: boolean | null
          is_default: boolean | null
          name: string
          native_name: string
        }
        Insert: {
          code: string
          currency_code?: string | null
          date_format?: string | null
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          native_name: string
        }
        Update: {
          code?: string
          currency_code?: string | null
          date_format?: string | null
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          native_name?: string
        }
        Relationships: []
      }
      teleconsult_observations: {
        Row: {
          behavioral_impulsivity: string | null
          behavioral_organization: string | null
          behavioral_planning: string | null
          behavioral_score: number | null
          cognitive_attention: string | null
          cognitive_memory: string | null
          cognitive_processing: string | null
          cognitive_score: number | null
          created_at: string | null
          id: string
          observed_traits: Json | null
          professional_id: string
          session_id: string
          socioemotional_anxiety: string | null
          socioemotional_interaction: string | null
          socioemotional_regulation: string | null
          socioemotional_score: number | null
          updated_at: string | null
        }
        Insert: {
          behavioral_impulsivity?: string | null
          behavioral_organization?: string | null
          behavioral_planning?: string | null
          behavioral_score?: number | null
          cognitive_attention?: string | null
          cognitive_memory?: string | null
          cognitive_processing?: string | null
          cognitive_score?: number | null
          created_at?: string | null
          id?: string
          observed_traits?: Json | null
          professional_id: string
          session_id: string
          socioemotional_anxiety?: string | null
          socioemotional_interaction?: string | null
          socioemotional_regulation?: string | null
          socioemotional_score?: number | null
          updated_at?: string | null
        }
        Update: {
          behavioral_impulsivity?: string | null
          behavioral_organization?: string | null
          behavioral_planning?: string | null
          behavioral_score?: number | null
          cognitive_attention?: string | null
          cognitive_memory?: string | null
          cognitive_processing?: string | null
          cognitive_score?: number | null
          created_at?: string | null
          id?: string
          observed_traits?: Json | null
          professional_id?: string
          session_id?: string
          socioemotional_anxiety?: string | null
          socioemotional_interaction?: string | null
          socioemotional_regulation?: string | null
          socioemotional_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teleconsult_observations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "teleorientation_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      telemetry_events: {
        Row: {
          created_at: string | null
          event_type: string
          game_id: string | null
          id: string
          payload: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          game_id?: string | null
          id?: string
          payload?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          game_id?: string | null
          id?: string
          payload?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      teleorientation_notes: {
        Row: {
          created_at: string | null
          follow_up_date: string | null
          follow_up_needed: boolean | null
          id: string
          is_shared_with_parent: boolean | null
          notes: string
          professional_id: string
          recommendations: Json | null
          session_id: string
          suggested_activities: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          follow_up_date?: string | null
          follow_up_needed?: boolean | null
          id?: string
          is_shared_with_parent?: boolean | null
          notes: string
          professional_id: string
          recommendations?: Json | null
          session_id: string
          suggested_activities?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          follow_up_date?: string | null
          follow_up_needed?: boolean | null
          id?: string
          is_shared_with_parent?: boolean | null
          notes?: string
          professional_id?: string
          recommendations?: Json | null
          session_id?: string
          suggested_activities?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teleorientation_notes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "teleorientation_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      teleorientation_sessions: {
        Row: {
          child_id: string | null
          clinical_summary: string | null
          created_at: string | null
          duration_minutes: number | null
          ended_at: string | null
          follow_up_plan: string | null
          id: string
          meeting_url: string | null
          parent_id: string
          professional_id: string
          report_generated_id: string | null
          scheduled_at: string
          session_type: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          child_id?: string | null
          clinical_summary?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          follow_up_plan?: string | null
          id?: string
          meeting_url?: string | null
          parent_id: string
          professional_id: string
          report_generated_id?: string | null
          scheduled_at: string
          session_type?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          child_id?: string | null
          clinical_summary?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          follow_up_plan?: string | null
          id?: string
          meeting_url?: string | null
          parent_id?: string
          professional_id?: string
          report_generated_id?: string | null
          scheduled_at?: string
          session_type?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teleorientation_sessions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teleorientation_sessions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "teleorientation_sessions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teleorientation_sessions_report_generated_id_fkey"
            columns: ["report_generated_id"]
            isOneToOne: false
            referencedRelation: "clinical_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_available_slots: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          professional_id: string
          slot_duration_minutes: number | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          professional_id: string
          slot_duration_minutes?: number | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          professional_id?: string
          slot_duration_minutes?: number | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "therapist_available_slots_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_available_slots_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_completions: {
        Row: {
          completed_at: string | null
          id: string
          tour_name: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          tour_name: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          tour_name?: string
          user_id?: string
        }
        Relationships: []
      }
      trail_progress: {
        Row: {
          child_id: string
          completed_at: string | null
          completed_items: Json | null
          current_item_index: number | null
          id: string
          last_activity_at: string | null
          progress_percentage: number | null
          started_at: string | null
          trail_id: string
        }
        Insert: {
          child_id: string
          completed_at?: string | null
          completed_items?: Json | null
          current_item_index?: number | null
          id?: string
          last_activity_at?: string | null
          progress_percentage?: number | null
          started_at?: string | null
          trail_id: string
        }
        Update: {
          child_id?: string
          completed_at?: string | null
          completed_items?: Json | null
          current_item_index?: number | null
          id?: string
          last_activity_at?: string | null
          progress_percentage?: number | null
          started_at?: string | null
          trail_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trail_progress_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trail_progress_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "trail_progress_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trail_progress_trail_id_fkey"
            columns: ["trail_id"]
            isOneToOne: false
            referencedRelation: "development_trails"
            referencedColumns: ["id"]
          },
        ]
      }
      translations: {
        Row: {
          created_at: string | null
          id: string
          key: string
          language_code: string
          namespace: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          language_code: string
          namespace: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          language_code?: string
          namespace?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "translations_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "supported_languages"
            referencedColumns: ["code"]
          },
        ]
      }
      unlockable_worlds: {
        Row: {
          ambient_sound_url: string | null
          background_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_premium: boolean | null
          name: string
          sort_order: number | null
          theme: string
          unlock_requirement: string
          unlock_value: number | null
        }
        Insert: {
          ambient_sound_url?: string | null
          background_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_premium?: boolean | null
          name: string
          sort_order?: number | null
          theme: string
          unlock_requirement: string
          unlock_value?: number | null
        }
        Update: {
          ambient_sound_url?: string | null
          background_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_premium?: boolean | null
          name?: string
          sort_order?: number | null
          theme?: string
          unlock_requirement?: string
          unlock_value?: number | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_key: string
          completed: boolean | null
          id: string
          progress: number | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_key: string
          completed?: boolean | null
          id?: string
          progress?: number | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_key?: string
          completed?: boolean | null
          id?: string
          progress?: number | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          details: Json | null
          id: string
          topic_name: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          details?: Json | null
          id?: string
          topic_name?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          topic_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_analytics: {
        Row: {
          child_id: string | null
          created_at: string | null
          date: string
          engagement_score: number | null
          games_played: number | null
          id: string
          metrics: Json | null
          routines_completed: number | null
          routines_started: number | null
          session_count: number | null
          stories_completed: number | null
          stories_viewed: number | null
          total_time_minutes: number | null
          user_id: string | null
        }
        Insert: {
          child_id?: string | null
          created_at?: string | null
          date?: string
          engagement_score?: number | null
          games_played?: number | null
          id?: string
          metrics?: Json | null
          routines_completed?: number | null
          routines_started?: number | null
          session_count?: number | null
          stories_completed?: number | null
          stories_viewed?: number | null
          total_time_minutes?: number | null
          user_id?: string | null
        }
        Update: {
          child_id?: string | null
          created_at?: string | null
          date?: string
          engagement_score?: number | null
          games_played?: number | null
          id?: string
          metrics?: Json | null
          routines_completed?: number | null
          routines_started?: number | null
          session_count?: number | null
          stories_completed?: number | null
          stories_viewed?: number | null
          total_time_minutes?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_analytics_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_analytics_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "user_analytics_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_coins: {
        Row: {
          balance: number | null
          id: string
          total_earned: number | null
          total_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          id?: string
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          id?: string
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_consents: {
        Row: {
          child_id: string | null
          consent_given: boolean
          consent_method: string
          consented_at: string | null
          document_id: string
          id: string
          ip_address: unknown
          revocation_reason: string | null
          revoked_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          child_id?: string | null
          consent_given: boolean
          consent_method: string
          consented_at?: string | null
          document_id: string
          id?: string
          ip_address?: unknown
          revocation_reason?: string | null
          revoked_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          child_id?: string | null
          consent_given?: boolean
          consent_method?: string
          consented_at?: string | null
          document_id?: string
          id?: string
          ip_address?: unknown
          revocation_reason?: string | null
          revoked_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_consents_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_consents_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "user_consents_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_consents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gamification: {
        Row: {
          created_at: string | null
          current_streak: number | null
          experience_points: number | null
          id: string
          last_activity_date: string | null
          level: number | null
          longest_streak: number | null
          total_stars: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          experience_points?: number | null
          id?: string
          last_activity_date?: string | null
          level?: number | null
          longest_streak?: number | null
          total_stars?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          experience_points?: number | null
          id?: string
          last_activity_date?: string | null
          level?: number | null
          longest_streak?: number | null
          total_stars?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_mission_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          mission_id: string
          points_earned: number | null
          progress: number | null
          target: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          mission_id: string
          points_earned?: number | null
          progress?: number | null
          target: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          mission_id?: string
          points_earned?: number | null
          progress?: number | null
          target?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_mission_progress_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "social_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          date_of_birth: string | null
          id: string
          name: string | null
          preferences: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          id?: string
          name?: string | null
          preferences?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          id?: string
          name?: string | null
          preferences?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wearable_connections: {
        Row: {
          access_token: string | null
          child_id: string | null
          created_at: string | null
          device_id: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          provider: string
          refresh_token: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          child_id?: string | null
          created_at?: string | null
          device_id?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          provider: string
          refresh_token?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          child_id?: string | null
          created_at?: string | null
          device_id?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          provider?: string
          refresh_token?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wearable_connections_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wearable_connections_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "wearable_connections_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_configurations: {
        Row: {
          created_at: string | null
          events: string[]
          id: string
          institution_id: string | null
          is_active: boolean | null
          last_status: number | null
          last_triggered_at: string | null
          name: string
          retry_count: number | null
          secret: string
          timeout_seconds: number | null
          updated_at: string | null
          url: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          events?: string[]
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          last_status?: number | null
          last_triggered_at?: string | null
          name: string
          retry_count?: number | null
          secret: string
          timeout_seconds?: number | null
          updated_at?: string | null
          url: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          events?: string[]
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          last_status?: number | null
          last_triggered_at?: string | null
          name?: string
          retry_count?: number | null
          secret?: string
          timeout_seconds?: number | null
          updated_at?: string | null
          url?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_configurations_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_deliveries: {
        Row: {
          attempt_number: number | null
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          webhook_id: string
        }
        Insert: {
          attempt_number?: number | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id: string
        }
        Update: {
          attempt_number?: number | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhook_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_feedback: {
        Row: {
          areas_of_improvement: Json | null
          child_id: string
          created_at: string | null
          highlights: Json | null
          id: string
          is_auto_generated: boolean | null
          is_sent: boolean | null
          metrics: Json | null
          recommendations: Json | null
          sent_at: string | null
          summary: string | null
          therapist_id: string | null
          week_end: string
          week_start: string
        }
        Insert: {
          areas_of_improvement?: Json | null
          child_id: string
          created_at?: string | null
          highlights?: Json | null
          id?: string
          is_auto_generated?: boolean | null
          is_sent?: boolean | null
          metrics?: Json | null
          recommendations?: Json | null
          sent_at?: string | null
          summary?: string | null
          therapist_id?: string | null
          week_end: string
          week_start: string
        }
        Update: {
          areas_of_improvement?: Json | null
          child_id?: string
          created_at?: string | null
          highlights?: Json | null
          id?: string
          is_auto_generated?: boolean | null
          is_sent?: boolean | null
          metrics?: Json | null
          recommendations?: Json | null
          sent_at?: string | null
          summary?: string | null
          therapist_id?: string | null
          week_end?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_feedback_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_feedback_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "weekly_feedback_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_feedback_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_feedback_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      parent_child_relationships: {
        Row: {
          birth_date: string | null
          child_id: string | null
          child_name: string | null
          id: string | null
          is_active: boolean | null
          parent_email: string | null
          parent_id: string | null
          parent_name: string | null
          relationship_type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "children_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "children_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      public_profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          role?: string | null
        }
        Relationships: []
      }
      teacher_student_relationships: {
        Row: {
          class_id: string | null
          class_name: string | null
          grade_level: string | null
          id: string | null
          is_active: boolean | null
          student_id: string | null
          student_name: string | null
          teacher_id: string | null
          teacher_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_students_child_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_students_child_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "class_students_child_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_patient_relationships: {
        Row: {
          access_level: string | null
          expires_at: string | null
          granted_at: string | null
          id: string | null
          is_active: boolean | null
          patient_birth_date: string | null
          patient_id: string | null
          patient_name: string | null
          therapist_id: string | null
          therapist_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "child_access_child_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_access_child_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "child_access_child_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "parent_child_relationships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_access_professional_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_access_professional_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      assign_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
      calculate_global_risk_score: {
        Args: {
          p_behavioral: number
          p_cognitive: number
          p_socioemotional: number
        }
        Returns: number
      }
      classify_risk_level: { Args: { p_score: number }; Returns: string }
      generate_api_key: { Args: never; Returns: string }
      get_admin_institution_ids: {
        Args: { _user_id: string }
        Returns: string[]
      }
      get_all_users_with_roles: {
        Args: never
        Returns: {
          created_at: string
          email: string
          id: string
          role: string
        }[]
      }
      get_user_children: {
        Args: { _user_id: string }
        Returns: {
          avatar_url: string
          birth_date: string
          id: string
          is_active: boolean
          name: string
          neurodevelopmental_conditions: Json
          parent_id: string
          source_table: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_child_access: {
        Args: { _child_id: string; _user_id: string }
        Returns: boolean
      }
      has_professional_access: {
        Args: { _child_id: string; _user_id: string }
        Returns: boolean
      }
      has_required_consents: { Args: { p_user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      insert_behavioral_insight: {
        Args: {
          p_child_profile_id?: string
          p_description: string
          p_insight_type: string
          p_severity?: string
          p_supporting_data?: Json
          p_title: string
          p_user_id: string
        }
        Returns: string
      }
      insert_clinical_report: {
        Args: {
          p_alert_flags?: Json
          p_detailed_analysis?: Json
          p_generated_by_ai?: boolean
          p_intervention_recommendations?: Json
          p_progress_indicators?: Json
          p_report_period_end: string
          p_report_period_start: string
          p_report_type: string
          p_summary_insights?: string
          p_user_id: string
        }
        Returns: string
      }
      is_institution_admin: {
        Args: { _institution_id: string; _user_id: string }
        Returns: boolean
      }
      is_parent_of: {
        Args: { _child_id: string; _user_id: string }
        Returns: boolean
      }
      is_parent_of_child: {
        Args: { _child_id: string; _user_id: string }
        Returns: boolean
      }
      is_teacher_of: {
        Args: { _child_id: string; _user_id: string }
        Returns: boolean
      }
      is_therapist_of: {
        Args: { _child_id: string; _user_id: string }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          p_action: string
          p_resource_id?: string
          p_resource_type: string
          p_user_agent?: string
        }
        Returns: undefined
      }
      log_clinical_audit: {
        Args: {
          p_action_details?: Json
          p_action_type: string
          p_child_id?: string
          p_resource_id?: string
          p_resource_type: string
          p_user_agent?: string
        }
        Returns: string
      }
      log_data_access: {
        Args: {
          p_access_reason?: string
          p_access_type?: string
          p_accessed_child_id?: string
          p_accessed_user_id?: string
          p_data_category?: string
          p_user_agent?: string
        }
        Returns: string
      }
      professional_has_child_access: {
        Args: { _child_id: string; _user_id: string }
        Returns: boolean
      }
      record_api_key_usage: {
        Args: {
          p_endpoint: string
          p_key_id: string
          p_method: string
          p_response_time: number
          p_status: number
        }
        Returns: undefined
      }
      search_children_for_linking: {
        Args: { search_name: string }
        Returns: {
          birth_year: number
          id: string
          name: string
        }[]
      }
      validate_api_key: {
        Args: { p_key_hash: string; p_key_prefix: string }
        Returns: {
          institution_id: string
          permissions: string[]
          user_id: string
        }[]
      }
      validate_invitation_code: {
        Args: { p_code: string }
        Returns: {
          expires_at: string
          invite_type: string
          valid: boolean
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "therapist" | "parent" | "user" | "patient"
      message_type: "text" | "feedback" | "recommendation" | "alert"
      story_category:
        | "rotinas"
        | "habilidades_sociais"
        | "emocoes"
        | "sensorial"
      subscription_plan:
        | "free"
        | "pro_family"
        | "pro_therapist"
        | "institutional"
      subscription_status:
        | "active"
        | "trial"
        | "cancelled"
        | "expired"
        | "pending"
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
      app_role: ["admin", "therapist", "parent", "user", "patient"],
      message_type: ["text", "feedback", "recommendation", "alert"],
      story_category: [
        "rotinas",
        "habilidades_sociais",
        "emocoes",
        "sensorial",
      ],
      subscription_plan: [
        "free",
        "pro_family",
        "pro_therapist",
        "institutional",
      ],
      subscription_status: [
        "active",
        "trial",
        "cancelled",
        "expired",
        "pending",
      ],
    },
  },
} as const
