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
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
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
      [_ in never]: never
    }
    Functions: {
      assign_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "therapist" | "parent" | "user"
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
      app_role: ["admin", "therapist", "parent", "user"],
    },
  },
} as const
