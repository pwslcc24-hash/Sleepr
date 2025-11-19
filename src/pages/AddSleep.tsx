import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Moon, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CSVImport from "@/components/sleep/CSVImport";
import { sleeprApi } from "@/api/mockApi";
import { createPageUrl } from "@/utils";

export default function AddSleep() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => sleeprApi.auth.me(),
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    quality: "",
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!currentUser) throw new Error("Missing user");
      const start = new Date(data.start_time);
      const end = new Date(data.end_time);
      const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

      return sleeprApi.sessions.create({
        user_id: currentUser.id,
        title: data.title,
        description: data.description,
        start_time: data.start_time,
        end_time: data.end_time,
        duration_hours: durationHours,
        source: "manual",
        quality: data.quality || null,
        score: null,
        resting_heart_rate: null,
        sleep_stages: null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedSessions"] });
      queryClient.invalidateQueries({ queryKey: ["userSessions"] });
      setFormData({ title: "", description: "", start_time: "", end_time: "", quality: "" });
      navigate(createPageUrl("Feed"));
    },
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.title || !formData.start_time || !formData.end_time) return;
    createSessionMutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Moon className="w-7 h-7 text-white" />
          </div>
          Log Sleep Session
        </h1>
        <p className="text-slate-600">Manually track your sleep or import from CSV</p>
      </div>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Moon className="w-4 h-4" /> Manual Entry
          </TabsTrigger>
          <TabsTrigger value="csv" className="flex items-center gap-2">
            <Upload className="w-4 h-4" /> CSV Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle>Sleep Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="sleep-title">Title *</Label>
                  <Input
                    id="sleep-title"
                    value={formData.title}
                    onChange={(event) => handleChange("title", event.target.value)}
                    placeholder="e.g. Solid 8 hours"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="sleep-notes">Notes</Label>
                  <Textarea
                    id="sleep-notes"
                    value={formData.description}
                    onChange={(event) => handleChange("description", event.target.value)}
                    placeholder="Dreams, disruptions, what helped you wind down"
                    className="mt-1 min-h-[100px]"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-time">Bedtime *</Label>
                    <Input
                      id="start-time"
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(event) => handleChange("start_time", event.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-time">Wake time *</Label>
                    <Input
                      id="end-time"
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(event) => handleChange("end_time", event.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Sleep quality</Label>
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

                <Button
                  type="submit"
                  disabled={createSessionMutation.isPending}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                >
                  {createSessionMutation.isPending ? "Saving..." : "Save Session"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="csv">
          <CSVImport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
