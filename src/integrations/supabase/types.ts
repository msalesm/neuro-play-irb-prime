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
    Enums: {},
  },
} as const
