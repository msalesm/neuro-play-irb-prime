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
        ]
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
            foreignKeyName: "child_access_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
        ]
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
      social_stories: {
        Row: {
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
        ]
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
          {
            foreignKeyName: "class_students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "school_classes"
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_parent_of: {
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
      professional_has_child_access: {
        Args: { _child_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "therapist" | "parent" | "user" | "patient"
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
    },
  },
} as const
