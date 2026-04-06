import type { PostStatus } from "@/lib/post-statuses";
import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export type FeatureFlags = {
  tagsEnabled: boolean;
  usersEnabled: boolean;
  approvalEnabled: boolean;
};

export type Tag = {
  id: number;
  tag: string;
  color: string;
};

export type User = {
  id: number;
  username: string;
  email: string;
  profileImageUrl: string;
  role: "ADMIN" | "MODERATOR" | "USER";
};

export type MarkerLocation = {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude: number;
  longitude: number;
};

export type Post = {
  id: number;
  title: string;
  slug: string;
  body: string;
  created: Date;
  tags: Tag[];
  author: number;
  location: MarkerLocation;
  status: PostStatus;
  moderator: number;
  reason: string;
};

export type TypedSupabaseClient = SupabaseClient<Database>;
