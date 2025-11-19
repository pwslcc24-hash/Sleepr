import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { sleeprApi } from "@/api/mockApi";
import SleepSessionCard from "@/components/sleep/SleepSessionCard";
import { Card, CardContent } from "@/components/ui/card";

export default function Feed() {
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => sleeprApi.auth.me(),
  });

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["feedSessions"],
    queryFn: () => sleeprApi.sessions.list(),
  });

  const { data: follows = [] } = useQuery({
    queryKey: ["follows"],
    queryFn: () => sleeprApi.follows.list(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => sleeprApi.users.list(),
  });

  if (!currentUser || isLoading || !sessions) {
    return (
      <div className="flex justify-center pt-20">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const followingIds = follows
    .filter((follow) => follow.follower_id === currentUser.id)
    .map((follow) => follow.following_id);

  const feedSessions = sessions.filter(
    (session) => session.user_id === currentUser.id || followingIds.includes(session.user_id)
  );

  const getUser = (userId: string) => users.find((user) => user.id === userId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Your Sleep Feed</h1>
        <p className="text-slate-600">See your nights and the friends you follow.</p>
      </div>

      {feedSessions.length === 0 ? (
        <Card className="bg-white/70">
          <CardContent>
            <p className="text-center text-slate-500 py-10">
              No sessions yet. Log your first night or follow friends from your profile.
            </p>
          </CardContent>
        </Card>
      ) : (
        feedSessions.map((session) => (
          <SleepSessionCard
            key={session.id}
            session={session}
            sessionUser={getUser(session.user_id)}
            currentUserId={currentUser.id}
          />
        ))
      )}
    </div>
  );
}
