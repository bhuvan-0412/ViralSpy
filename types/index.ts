export type NicheType =
  | 'fitness'
  | 'food'
  | 'finance'
  | 'fashion'
  | 'beauty'
  | 'tech'
  | 'gaming'
  | 'travel'
  | 'education'
  | 'comedy'
  | 'lifestyle'
  | 'music'
  | 'sports'
  | 'business'
  | 'other';

export type PlatformType = 'YOUTUBE' | 'INSTAGRAM' | 'REDDIT' | 'X';

export type MomentumStatusType = 'RISING' | 'EXPLODING' | 'PEAKED' | 'DEAD';

export type BriefFormatType =
  | 'TALKING_HEAD'
  | 'POV'
  | 'DUET'
  | 'TUTORIAL'
  | 'STORYTIME'
  | 'TRANSITION';

export interface Trend {
  id: string;
  name: string;
  niche: NicheType;
  platform: PlatformType;
  post_count: number;
  posts_per_hour: number;
  avg_posts_24h: number;
  velocity_score: number;
  peak_velocity?: number | null;
  momentum_status: MomentumStatusType;
  confidence_score: number;
  raw_data?: any;
  detected_at: string;
  peaked_at?: string | null;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrendSnapshot {
  id: string;
  trend_id: string;
  post_count: number;
  posts_per_hour: number;
  velocity_score: number;
  snapped_at: string;
}

export interface Angle {
  title: string;
  description: string;
}

export interface Brief {
  id: string;
  trend_id: string;
  user_id: string;
  hook: string;
  angles: Angle[];
  format: BriefFormatType;
  hashtags: string[];
  best_post_time: string;
  estimated_reach: string;
  script_outline: string;
  model_used?: string | null;
  prompt_version?: number | null;
  rating?: number | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  display_name?: string | null;
  avatar_url?: string | null;
  niches: NicheType[];
  platforms: string[];
  subscriber_count?: number | null;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedTrend {
  id: string;
  user_id: string;
  trend_id: string;
  saved_at: string;
}
