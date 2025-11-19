import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Heart } from "lucide-react";
import { sleeprApi } from "@/api/mockApi";
import { format } from "date-fns";

interface Props {
  sessionId: string;
  currentUserId: string;
  comments: Array<{
    id: string;
    user_id: string;
    session_id: string;
    text: string;
    created_date: string;
  }>;
}

export default function CommentSection({ sessionId, currentUserId, comments }: Props) {
  const [newComment, setNewComment] = useState("");
  const queryClient = useQueryClient();

  const { data: allUsers = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => sleeprApi.users.list(),
  });

  const { data: commentLikes = [] } = useQuery({
    queryKey: ["commentLikes", sessionId],
    queryFn: () => sleeprApi.commentLikes.listForSession(sessionId),
    enabled: comments.length > 0,
  });

  const addCommentMutation = useMutation({
    mutationFn: (text: string) => sleeprApi.comments.create(sessionId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", sessionId] });
      setNewComment("");
    },
  });

  const likeCommentMutation = useMutation({
    mutationFn: (commentId: string) => sleeprApi.commentLikes.toggle(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commentLikes", sessionId] });
    },
  });

  const getUserById = (id: string) => allUsers.find((user) => user.id === id);
  const getCommentLikes = (id: string) => commentLikes.filter((like) => like.comment_id === id);
  const isCommentLiked = (id: string) =>
    commentLikes.some((like) => like.comment_id === id && like.user_id === currentUserId);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment.trim());
    }
  };

  return (
    <div className="w-full space-y-4 pt-3 border-t border-slate-100">
      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {comments.map((comment) => {
          const user = getUserById(comment.user_id);
          const likes = getCommentLikes(comment.id);
          const likedByMe = isCommentLiked(comment.id);

          return (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.profile_photo} />
                <AvatarFallback className="bg-slate-200 text-slate-700 text-xs">
                  {user?.full_name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="font-semibold text-sm text-slate-900">{user?.full_name || "User"}</p>
                  <p className="text-sm text-slate-700 mt-1">{comment.text}</p>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-xs text-slate-400">
                    {format(new Date(comment.created_date), "MMM d, h:mm a")}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => likeCommentMutation.mutate(comment.id)}
                    className={`h-6 px-2 text-xs ${
                      likedByMe ? "text-red-500 hover:text-red-600" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Heart className={`w-3 h-3 mr-1 ${likedByMe ? "fill-current" : ""}`} />
                    {likes.length > 0 && <span>{likes.length}</span>}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={newComment}
          onChange={(event) => setNewComment(event.target.value)}
          placeholder="Add a comment..."
          className="min-h-[60px] resize-none"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!newComment.trim() || addCommentMutation.isPending}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
