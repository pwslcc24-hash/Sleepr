import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircle,
  Clock,
  Activity,
  Smartphone,
  Watch,
  Edit2,
  Trash2,
  MoreVertical,
  Award,
  Star,
  Moon,
  Sun,
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CommentSection from "./CommentSection";
import EditSleepDialog from "./EditSleepDialog";
import type { SleepSession, User } from "@/types";
import { sleeprApi } from "@/api/mockApi";

interface Props {
  session: SleepSession;
  sessionUser?: User;
  currentUserId: string;
}

export default function SleepSessionCard({ session, sessionUser, currentUserId }: Props) {
  const [showComments, setShowComments] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();

  const isOwner = session.user_id === currentUserId;

  const { data: likes = [] } = useQuery({
    queryKey: ["likes", session.id],
    queryFn: () => sleeprApi.likes.listBySession(session.id),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", session.id],
    queryFn: () => sleeprApi.comments.listBySession(session.id),
  });

  const likeMutation = useMutation({
    mutationFn: () => sleeprApi.likes.toggle(session.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["likes", session.id] });
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: () => sleeprApi.sessions.delete(session.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedSessions"] });
      queryClient.invalidateQueries({ queryKey: ["userSessions"] });
      setShowDeleteDialog(false);
    },
  });

  const getSourceIcon = () => (session.source === "garmin" ? <Watch className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />);

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getQualityColor = (quality?: string | null) => {
    const colors: Record<string, string> = {
      excellent: "bg-green-100 text-green-800 border-green-200",
      good: "bg-blue-100 text-blue-800 border-blue-200",
      fair: "bg-yellow-100 text-yellow-800 border-yellow-200",
      poor: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[quality ?? ""] || "bg-slate-100 text-slate-800 border-slate-200";
  };

  const hasGarminMetrics =
    session.source === "garmin" &&
    (session.score !== undefined || session.resting_heart_rate !== undefined);

  const isLiked = likes.some((like) => like.user_id === currentUserId);

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 ring-2 ring-indigo-100">
                <AvatarImage src={sessionUser?.profile_photo} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white font-semibold">
                  {sessionUser?.full_name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-slate-900">{sessionUser?.full_name || "User"}</p>
                <p className="text-sm text-slate-500">{format(new Date(session.start_time), "MMM d, yyyy")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={
                  session.source === "garmin"
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }
              >
                {getSourceIcon()}
                <span className="ml-1 capitalize">{session.source}</span>
              </Badge>

              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                      <Edit2 className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{session.title}</h3>
            {session.description && <p className="text-slate-600 leading-relaxed mt-1">{session.description}</p>}
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <Moon className="w-4 h-4 text-indigo-600" />
              <span className="font-medium">Bedtime:</span>
              <span>{format(new Date(session.start_time), "h:mm a")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Sun className="w-4 h-4 text-amber-600" />
              <span className="font-medium">Wake:</span>
              <span>{format(new Date(session.end_time), "h:mm a")}</span>
            </div>
          </div>

          {hasGarminMetrics ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Duration</p>
                </div>
                <p className="text-2xl font-bold text-slate-900">{formatDuration(session.duration_hours)}</p>
              </div>
              {session.score !== undefined && session.score !== null && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-amber-600" />
                    <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">Score</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{session.score}/100</p>
                </div>
              )}
              {session.resting_heart_rate !== undefined && session.resting_heart_rate !== null && (
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border border-red-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-red-600" />
                    <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Resting HR</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{Math.round(session.resting_heart_rate)}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-indigo-600" />
                <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Duration</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">{formatDuration(session.duration_hours)}</p>
            </div>
          )}

          {session.quality && (
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-slate-500" />
              <Badge variant="outline" className={getQualityColor(session.quality)}>
                {session.quality.charAt(0).toUpperCase() + session.quality.slice(1)} Quality
              </Badge>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-4 w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => likeMutation.mutate()}
              className={`flex items-center gap-2 ${
                isLiked ? "text-red-500 hover:text-red-600" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              <span className="font-medium">{likes.length}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">{comments.length}</span>
            </Button>
          </div>

          {showComments && (
            <CommentSection sessionId={session.id} currentUserId={currentUserId} comments={comments} />
          )}
        </CardFooter>
      </Card>

      {isOwner && (
        <EditSleepDialog session={session} open={showEditDialog} onOpenChange={setShowEditDialog} />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sleep Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this session and all likes & comments. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteSessionMutation.mutate()}
              disabled={deleteSessionMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteSessionMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
