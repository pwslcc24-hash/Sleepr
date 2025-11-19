import type {
  Comment,
  CommentLike,
  Follow,
  Like,
  SleepSession,
  User,
} from "@/types";

export interface SleeprSeedData {
  users: User[];
  sessions: SleepSession[];
  follows: Follow[];
  likes: Like[];
  comments: Comment[];
  commentLikes: CommentLike[];
  currentUserId: string;
}

const now = new Date();

const createDate = (offset: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - offset);
  return d.toISOString();
};

export const seedData: SleeprSeedData = {
  currentUserId: "user-1",
  users: [
    {
      id: "user-1",
      full_name: "Ava Thompson",
      bio: "Runner, coffee lover, sleep enthusiast",
      profile_photo:
        "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: "user-2",
      full_name: "Leo Brooks",
      bio: "Cyclist chasing REM goals",
      profile_photo:
        "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: "user-3",
      full_name: "Maya Patel",
      bio: "Product designer + new mom",
      profile_photo:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    },
  ],
  sessions: [
    {
      id: "session-1",
      user_id: "user-1",
      title: "Solid 8 hours",
      description: "Best sleep this week. Minimal wake-ups!",
      start_time: createDate(1),
      end_time: createDate(0.8),
      duration_hours: 8.2,
      source: "garmin",
      score: 88,
      resting_heart_rate: 52,
      quality: "excellent",
      created_date: createDate(1),
      sleep_stages: JSON.stringify([
        {
          start_time: createDate(1),
          end_time: createDate(0.95),
          stage_type: "light",
        },
      ]),
    },
    {
      id: "session-2",
      user_id: "user-2",
      title: "Late night debugging",
      description: "Too much caffeine but still ok",
      start_time: createDate(2.5),
      end_time: createDate(2.2),
      duration_hours: 6.1,
      source: "manual",
      quality: "fair",
      created_date: createDate(2.5),
      sleep_stages: null,
    },
    {
      id: "session-3",
      user_id: "user-3",
      title: "Newborn schedule",
      description: "Three wake-ups but feeling hopeful",
      start_time: createDate(3.2),
      end_time: createDate(3),
      duration_hours: 5.5,
      source: "manual",
      quality: "poor",
      created_date: createDate(3.2),
      sleep_stages: null,
    },
  ],
  follows: [
    { id: "follow-1", follower_id: "user-1", following_id: "user-2" },
    { id: "follow-2", follower_id: "user-1", following_id: "user-3" },
  ],
  likes: [
    { id: "like-1", user_id: "user-1", session_id: "session-2" },
    { id: "like-2", user_id: "user-2", session_id: "session-1" },
  ],
  comments: [
    {
      id: "comment-1",
      user_id: "user-2",
      session_id: "session-1",
      text: "Crushing it!",
      created_date: createDate(0.9),
    },
    {
      id: "comment-2",
      user_id: "user-3",
      session_id: "session-1",
      text: "Teach me your wind-down routine",
      created_date: createDate(0.85),
    },
  ],
  commentLikes: [
    { id: "cl-1", user_id: "user-1", comment_id: "comment-1" },
  ],
};
