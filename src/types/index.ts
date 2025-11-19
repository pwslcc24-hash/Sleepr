export type SleepQuality = "poor" | "fair" | "good" | "excellent";

export interface User {
  id: string;
  full_name: string;
  bio?: string;
  profile_photo?: string;
}

export interface SleepSession {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  source: "manual" | "garmin";
  quality?: SleepQuality | null;
  score?: number | null;
  resting_heart_rate?: number | null;
  sleep_stages?: string | null;
  created_date: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
}

export interface Like {
  id: string;
  user_id: string;
  session_id: string;
}

export interface Comment {
  id: string;
  user_id: string;
  session_id: string;
  text: string;
  created_date: string;
}

export interface CommentLike {
  id: string;
  user_id: string;
  comment_id: string;
}

export interface SleepStage {
  start_time: string;
  end_time: string;
  stage_type: "light" | "deep" | "rem" | "awake" | string;
}
