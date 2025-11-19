import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Users, UserPlus, Watch, Calendar as CalendarIcon, Activity, Moon, Zap } from "lucide-react";
import { format } from "date-fns";
import { sleeprApi } from "@/api/mockApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import StatsCard from "@/components/profile/StatsCard";
import SleepSessionCard from "@/components/sleep/SleepSessionCard";
import SleepCalendar from "@/components/profile/SleepCalendar";
import WeeklySleepGraph from "@/components/profile/WeeklySleepGraph";
import DailySleepTimeline from "@/components/profile/DailySleepTimeline";
import type { SleepSession } from "@/types";

export default function Profile() {
  const [showUserList, setShowUserList] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => sleeprApi.auth.me(),
  });

  const { data: sessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ["userSessions", currentUser?.id],
    queryFn: () => (currentUser ? sleeprApi.sessions.listByUser(currentUser.id) : []),
    enabled: !!currentUser?.id,
  });

  const { data: allFollows = [] } = useQuery({
    queryKey: ["follows"],
    queryFn: () => sleeprApi.follows.list(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => sleeprApi.users.list(),
  });

  const follows = allFollows.filter((follow) => follow.follower_id === currentUser?.id);

  const syncGarminMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) return;
      const now = new Date();
      const lastNight = new Date(now);
      lastNight.setHours(22, 30, 0, 0);
      lastNight.setDate(lastNight.getDate() - 1);
      const wakeTime = new Date(now);
      wakeTime.setHours(6, 45, 0, 0);
      const durationHours = (wakeTime.getTime() - lastNight.getTime()) / (1000 * 60 * 60);
      const score = Math.floor(Math.random() * 20) + 75;
      const quality = score >= 85 ? "excellent" : score >= 70 ? "good" : "fair";

      await sleeprApi.sessions.create({
        user_id: currentUser.id,
        title: "Garmin Auto-Sync",
        description: "Sleep data automatically synced from Garmin device",
        start_time: lastNight.toISOString(),
        end_time: wakeTime.toISOString(),
        duration_hours: durationHours,
        source: "garmin",
        quality,
        score,
        resting_heart_rate: 50 + Math.random() * 10,
        sleep_stages: JSON.stringify([
          {
            start_time: lastNight.toISOString(),
            end_time: new Date(lastNight.getTime() + 2 * 60 * 60 * 1000).toISOString(),
            stage_type: "deep",
          },
          {
            start_time: new Date(lastNight.getTime() + 2 * 60 * 60 * 1000).toISOString(),
            end_time: new Date(lastNight.getTime() + 5 * 60 * 60 * 1000).toISOString(),
            stage_type: "light",
          },
          {
            start_time: new Date(lastNight.getTime() + 5 * 60 * 60 * 1000).toISOString(),
            end_time: wakeTime.toISOString(),
            stage_type: "rem",
          },
        ]),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSessions"] });
      queryClient.invalidateQueries({ queryKey: ["feedSessions"] });
    },
  });

  const followMutation = useMutation({
    mutationFn: (userId: string) => sleeprApi.follows.create(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follows"] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: (userId: string) => sleeprApi.follows.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follows"] });
    },
  });

  const isFollowing = (userId: string) => follows.some((follow) => follow.following_id === userId);

  const calculateStats = () => {
    if (!sessions.length) {
      return { avg7: "0", avg30: "0", total: 0 };
    }
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const last7 = sessions.filter((session) => new Date(session.start_time) >= sevenDaysAgo);
    const last30 = sessions.filter((session) => new Date(session.start_time) >= thirtyDaysAgo);

    const avg7 =
      last7.length > 0
        ? last7.reduce((sum, session) => sum + session.duration_hours, 0) / last7.length
        : 0;
    const avg30 =
      last30.length > 0
        ? last30.reduce((sum, session) => sum + session.duration_hours, 0) / last30.length
        : 0;

    return {
      avg7: avg7.toFixed(1),
      avg30: avg30.toFixed(1),
      total: sessions.length,
    };
  };

  const stats = calculateStats();
  const otherUsers = users.filter((user) => user.id !== currentUser?.id);

  const sleepData = sessions.map((session) => ({
    date: format(new Date(session.start_time), "yyyy-MM-dd"),
    sessionId: session.id,
    total_hours: session.duration_hours,
    sleep_score: session.score,
    resting_hr: session.resting_heart_rate ?? null,
    quality: session.quality ?? "fair",
    notes: session.description ?? session.title,
    stages: session.sleep_stages ? JSON.parse(session.sleep_stages) : [],
  }));

  const handleDaySelect = (dayData: any) => {
    const match = sessions.find((session) => session.id === dayData.sessionId);
    if (match) {
      setSelectedDayData(dayData);
    }
  };

  if (loadingSessions || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Card className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-0 shadow-xl">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-24 h-24 ring-4 ring-white/30">
              <AvatarImage src={currentUser.profile_photo} />
              <AvatarFallback className="bg-white/20 text-white text-3xl font-bold">
                {currentUser.full_name[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{currentUser.full_name}</h1>
              <p className="text-white/90 mb-4">{currentUser.bio || "No bio yet"}</p>

              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Users className="w-4 h-4 mr-1" />
                  {follows.length} Following
                </Badge>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  onClick={() => syncGarminMutation.mutate()}
                  disabled={syncGarminMutation.isPending}
                >
                  <Watch className="w-4 h-4 mr-2" />
                  {syncGarminMutation.isPending ? "Syncing..." : "Garmin Test Sync"}
                </Button>
                <Dialog open={showUserList} onOpenChange={setShowUserList}>
                  <DialogTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Find Friends
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Find Friends on Sleepr</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 max-h-96 overflow-y-auto p-1">
                      {otherUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.profile_photo} />
                              <AvatarFallback>{user.full_name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-slate-900">{user.full_name}</p>
                              <p className="text-xs text-slate-500">{user.bio}</p>
                            </div>
                          </div>
                          {isFollowing(user.id) ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => unfollowMutation.mutate(user.id)}
                            >
                              Unfollow
                            </Button>
                          ) : (
                            <Button size="sm" onClick={() => followMutation.mutate(user.id)}>
                              Follow
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <StatsCard
          title="7-day average"
          value={`${stats.avg7}h`}
          subtitle="Target 8h"
          icon={Moon}
          gradient="from-indigo-500 to-purple-500"
        />
        <StatsCard
          title="30-day average"
          value={`${stats.avg30}h`}
          subtitle="Trend"
          icon={Activity}
          gradient="from-purple-500 to-pink-500"
        />
        <StatsCard
          title="Total sessions"
          value={stats.total}
          subtitle="Lifetime"
          icon={Zap}
          gradient="from-amber-500 to-orange-500"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <SleepCalendar sleepData={sleepData} onDaySelect={handleDaySelect} />
        <WeeklySleepGraph sleepData={sleepData} />
      </div>

      <DailySleepTimeline selectedDayData={selectedDayData} />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Sleep History</h2>
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            {sessions.length} entries
          </div>
        </div>
        {sessions.length === 0 ? (
          <Card className="bg-white/70">
            <CardContent>
              <p className="text-center text-slate-500 py-10">No sessions yet. Start logging to see insights.</p>
            </CardContent>
          </Card>
        ) : (
          sessions.map((session: SleepSession) => (
            <SleepSessionCard
              key={session.id}
              session={session}
              sessionUser={currentUser}
              currentUserId={currentUser.id}
            />
          ))
        )}
      </section>
    </div>
  );
}
