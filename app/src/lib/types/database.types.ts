export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      feature_flags: {
        Row: {
          approvalEnabled: boolean;
          id: boolean;
          tagsEnabled: boolean;
          usersEnabled: boolean;
        };
        Insert: {
          approvalEnabled?: boolean;
          id?: boolean;
          tagsEnabled?: boolean;
          usersEnabled?: boolean;
        };
        Update: {
          approvalEnabled?: boolean;
          id?: boolean;
          tagsEnabled?: boolean;
          usersEnabled?: boolean;
        };
        Relationships: [];
      };
      locations: {
        Row: {
          address: string | null;
          city: string | null;
          country: string | null;
          id: number;
          location: unknown;
          state: string | null;
        };
        Insert: {
          address?: string | null;
          city?: string | null;
          country?: string | null;
          id: number;
          location: unknown;
          state?: string | null;
        };
        Update: {
          address?: string | null;
          city?: string | null;
          country?: string | null;
          id?: number;
          location?: unknown;
          state?: string | null;
        };
        Relationships: [];
      };
      pages: {
        Row: {
          body: string | null;
          created_at: string;
          id: number;
          slug: string | null;
          title: string | null;
        };
        Insert: {
          body?: string | null;
          created_at: string;
          id?: number;
          slug?: string | null;
          title?: string | null;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          id?: number;
          slug?: string | null;
          title?: string | null;
        };
        Relationships: [];
      };
      post_tags: {
        Row: {
          post_id: number;
          tag_id: number;
        };
        Insert: {
          post_id: number;
          tag_id: number;
        };
        Update: {
          post_id?: number;
          tag_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: {
          author_id: string | null;
          body: string;
          created_at: string;
          id: number;
          image_path: string | null;
          location_id: number | null;
          moderator_id: string | null;
          status: string;
          title: string;
        };
        Insert: {
          author_id?: string | null;
          body?: string;
          created_at?: string;
          id?: number;
          image_path?: string | null;
          location_id?: number | null;
          moderator_id?: string | null;
          status?: string;
          title?: string;
        };
        Update: {
          author_id?: string | null;
          body?: string;
          created_at?: string;
          id?: number;
          image_path?: string | null;
          location_id?: number | null;
          moderator_id?: string | null;
          status?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations_expanded";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          app_role: string;
          created_at: string | null;
          id: string;
        };
        Insert: {
          app_role?: string;
          created_at?: string | null;
          id: string;
        };
        Update: {
          app_role?: string;
          created_at?: string | null;
          id?: string;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          color: string | null;
          created_at: string;
          id: number;
          value: string;
        };
        Insert: {
          color?: string | null;
          created_at?: string;
          id?: number;
          value: string;
        };
        Update: {
          color?: string | null;
          created_at?: string;
          id?: number;
          value?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      locations_expanded: {
        Row: {
          address: string | null;
          city: string | null;
          country: string | null;
          id: number | null;
          latitude: number | null;
          longitude: number | null;
          state: string | null;
        };
        Insert: {
          address?: string | null;
          city?: string | null;
          country?: string | null;
          id?: number | null;
          latitude?: never;
          longitude?: never;
          state?: string | null;
        };
        Update: {
          address?: string | null;
          city?: string | null;
          country?: string | null;
          id?: number | null;
          latitude?: never;
          longitude?: never;
          state?: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      app_role_for_user: { Args: { user_id: string }; Returns: string };
      approval_enabled: { Args: never; Returns: boolean };
      can_create_posts: { Args: never; Returns: boolean };
      can_moderate_post: { Args: { post_author_id: string }; Returns: boolean };
      can_view_post: {
        Args: { post_author_id: string; post_status: string };
        Returns: boolean;
      };
      current_app_role: { Args: never; Returns: string };
      get_post_markers_in_bounds: {
        Args: {
          east_bound: number;
          north_bound: number;
          south_bound: number;
          tag_ids?: number[];
          west_bound: number;
        };
        Returns: {
          id: number;
          latitude: number;
          longitude: number;
        }[];
      };
      insert_location: {
        Args: {
          lat: number;
          lng: number;
          p_address?: string;
          p_city?: string;
          p_country?: string;
          p_state?: string;
        };
        Returns: number;
      };
      is_admin: { Args: never; Returns: boolean };
      is_moderator: { Args: never; Returns: boolean };
      list_manageable_users: {
        Args: never;
        Returns: {
          app_role: string;
          created_at: string;
          display_name: string;
          email: string;
          id: string;
        }[];
      };
      tags_enabled: { Args: never; Returns: boolean };
      update_location: {
        Args: {
          lat: number;
          lng: number;
          p_address?: string;
          p_city?: string;
          p_country?: string;
          p_location_id: number;
          p_state?: string;
        };
        Returns: undefined;
      };
      users_enabled: { Args: never; Returns: boolean };
    };
    Enums: {
      status: "PENDING" | "PUBLISHED" | "REJECTED";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      status: ["PENDING", "PUBLISHED", "REJECTED"],
    },
  },
} as const;
