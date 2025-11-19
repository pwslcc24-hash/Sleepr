import { seedData, type SleeprSeedData } from "@/api/seedData";
import type { Comment, CommentLike, Follow, Like, SleepSession, User } from "@/types";

const STORAGE_KEY = "sleepr-data";

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const hasLocalStorage = () => typeof window !== "undefined" && !!window.localStorage;

const loadInitialData = (): SleeprSeedData => {
  if (hasLocalStorage()) {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw) as SleeprSeedData;
      } catch (error) {
        console.warn("Failed to parse Sleepr data, seeding again", error);
      }
    }
  }
  return deepClone(seedData);
};

let store: SleeprSeedData = loadInitialData();

const persist = () => {
  if (hasLocalStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }
};

const simulateLatency = async <T>(result: T, wait = 200): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(deepClone(result)), wait));

const generateId = (prefix: string) => `${prefix}-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 10)}`;

const getCurrentUser = (): User => {
  return store.users.find((user) => user.id === store.currentUserId) ?? store.users[0];
};

const removeDependentRecords = (sessionId: string) => {
  store.likes = store.likes.filter((like) => like.session_id !== sessionId);
  const commentsToRemove = store.comments.filter((c) => c.session_id === sessionId).map((c) => c.id);
  store.comments = store.comments.filter((c) => c.session_id !== sessionId);
  store.commentLikes = store.commentLikes.filter((like) => !commentsToRemove.includes(like.comment_id));
};

export const sleeprApi = {
  auth: {
    async me() {
      return simulateLatency(getCurrentUser());
    },
    async logout() {
      return simulateLatency(true);
    },
  },
  users: {
    async list() {
      return simulateLatency(store.users);
    },
  },
  sessions: {
    async list() {
      const sessions = [...store.sessions].sort((a, b) =>
        new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
      );
      return simulateLatency(sessions);
    },
    async listByUser(userId: string) {
      const sessions = store.sessions.filter((session) => session.user_id === userId);
      return simulateLatency(
        sessions.sort(
          (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
        )
      );
    },
    async create(payload: Omit<SleepSession, "id" | "created_date">) {
      const session: SleepSession = {
        ...payload,
        id: generateId("session"),
        created_date: new Date().toISOString(),
      };
      store.sessions.push(session);
      persist();
      return simulateLatency(session);
    },
    async update(id: string, payload: Partial<SleepSession>) {
      const index = store.sessions.findIndex((session) => session.id === id);
      if (index === -1) throw new Error("Session not found");
      store.sessions[index] = { ...store.sessions[index], ...payload };
      persist();
      return simulateLatency(store.sessions[index]);
    },
    async delete(id: string) {
      store.sessions = store.sessions.filter((session) => session.id !== id);
      removeDependentRecords(id);
      persist();
      return simulateLatency(true);
    },
    async bulkCreate(payloads: Array<Omit<SleepSession, "id" | "created_date">>) {
      const created = payloads.map((payload) => ({
        ...payload,
        id: generateId("session"),
        created_date: new Date().toISOString(),
      }));
      store.sessions.push(...created);
      persist();
      return simulateLatency(created);
    },
  },
  follows: {
    async list() {
      return simulateLatency(store.follows);
    },
    async create(followingId: string) {
      const newFollow: Follow = {
        id: generateId("follow"),
        follower_id: getCurrentUser().id,
        following_id: followingId,
      };
      store.follows.push(newFollow);
      persist();
      return simulateLatency(newFollow);
    },
    async delete(followingId: string) {
      const currentUserId = getCurrentUser().id;
      const follow = store.follows.find(
        (f) => f.following_id === followingId && f.follower_id === currentUserId
      );
      if (follow) {
        store.follows = store.follows.filter((f) => f.id !== follow.id);
        persist();
      }
      return simulateLatency(true);
    },
  },
  likes: {
    async listBySession(sessionId: string) {
      return simulateLatency(store.likes.filter((like) => like.session_id === sessionId));
    },
    async toggle(sessionId: string) {
      const currentUser = getCurrentUser();
      const existing = store.likes.find(
        (like) => like.session_id === sessionId && like.user_id === currentUser.id
      );
      if (existing) {
        store.likes = store.likes.filter((like) => like.id !== existing.id);
      } else {
        store.likes.push({
          id: generateId("like"),
          session_id: sessionId,
          user_id: currentUser.id,
        });
      }
      persist();
      return simulateLatency(true);
    },
  },
  comments: {
    async listBySession(sessionId: string) {
      const comments = store.comments
        .filter((comment) => comment.session_id === sessionId)
        .sort(
          (a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
        );
      return simulateLatency(comments);
    },
    async create(sessionId: string, text: string) {
      const comment: Comment = {
        id: generateId("comment"),
        user_id: getCurrentUser().id,
        session_id: sessionId,
        text,
        created_date: new Date().toISOString(),
      };
      store.comments.push(comment);
      persist();
      return simulateLatency(comment);
    },
    async delete(id: string) {
      store.comments = store.comments.filter((comment) => comment.id !== id);
      store.commentLikes = store.commentLikes.filter((like) => like.comment_id !== id);
      persist();
      return simulateLatency(true);
    },
  },
  commentLikes: {
    async listForSession(sessionId: string) {
      const commentIds = store.comments
        .filter((comment) => comment.session_id === sessionId)
        .map((comment) => comment.id);
      return simulateLatency(store.commentLikes.filter((like) => commentIds.includes(like.comment_id)));
    },
    async toggle(commentId: string) {
      const currentUser = getCurrentUser();
      const existing = store.commentLikes.find(
        (like) => like.comment_id === commentId && like.user_id === currentUser.id
      );
      if (existing) {
        store.commentLikes = store.commentLikes.filter((like) => like.id !== existing.id);
      } else {
        store.commentLikes.push({
          id: generateId("comment-like"),
          comment_id: commentId,
          user_id: currentUser.id,
        });
      }
      persist();
      return simulateLatency(true);
    },
  },
};

export type SleeprApi = typeof sleeprApi;
