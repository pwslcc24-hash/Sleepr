import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Award, Activity, Star } from "lucide-react";
import type { SleepSession } from "@/types";
import { sleeprApi } from "@/api/mockApi";

interface Props {
  session: SleepSession;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditSleepDialog({ session, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const isGarminSource = session.source === "garmin";

  const [formData, setFormData] = useState({
    title: session.title || "",
    description: session.description || "",
    start_time: session.start_time ? new Date(session.start_time).toISOString().slice(0, 16) : "",
    end_time: session.end_time ? new Date(session.end_time).toISOString().slice(0, 16) : "",
    quality: session.quality || "",
    score: session.score?.toString() || "",
    resting_heart_rate: session.resting_heart_rate?.toString() || "",
  });

  const updateSessionMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const start = new Date(data.start_time);
      const end = new Date(data.end_time);
      const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

      const payload: Partial<SleepSession> = {
        title: data.title,
        description: data.description,
        start_time: data.start_time,
        end_time: data.end_time,
        duration_hours: durationHours,
        quality: data.quality || null,
      };

      if (isGarminSource) {
        payload.score = data.score ? parseFloat(data.score) : null;
        payload.resting_heart_rate = data.resting_heart_rate ? parseFloat(data.resting_heart_rate) : null;
      }

      return sleeprApi.sessions.update(session.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedSessions"] });
      queryClient.invalidateQueries({ queryKey: ["userSessions"] });
      onOpenChange(false);
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (formData.title && formData.start_time && formData.end_time) {
      updateSessionMutation.mutate(formData);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Sleep Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title" className="text-sm font-semibold text-slate-700">
                Title *
              </Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(event) => handleChange("title", event.target.value)}
                placeholder="e.g. Solid 8 hours, Rough night..."
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-description" className="text-sm font-semibold text-slate-700">
                Notes
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(event) => handleChange("description", event.target.value)}
                placeholder="How was your sleep? Any dreams or disruptions?"
                className="mt-1 min-h-[100px]"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
            <div>
              <Label htmlFor="edit-start-time" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" /> Bedtime *
              </Label>
              <Input
                id="edit-start-time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(event) => handleChange("start_time", event.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-end-time" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" /> Wake Time *
              </Label>
              <Input
                id="edit-end-time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(event) => handleChange("end_time", event.target.value)}
                required
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-quality" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" /> Sleep Quality
            </Label>
            <Select value={formData.quality} onValueChange={(value) => handleChange("quality", value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="poor">Poor</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isGarminSource && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                <Star className="w-4 h-4 text-purple-600" /> Garmin Metrics
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-score" className="text-sm text-slate-600 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" /> Sleep Score (0–100)
                  </Label>
                  <Input
                    id="edit-score"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.score}
                    onChange={(event) => handleChange("score", event.target.value)}
                    placeholder="0–100"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-rhr" className="text-sm text-slate-600 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-red-500" /> Resting Heart Rate
                  </Label>
                  <Input
                    id="edit-rhr"
                    type="number"
                    value={formData.resting_heart_rate}
                    onChange={(event) => handleChange("resting_heart_rate", event.target.value)}
                    placeholder="bpm"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateSessionMutation.isPending}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
            >
              {updateSessionMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
