import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { sleeprApi } from "@/api/mockApi";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, parse } from "date-fns";

export default function CSVImport() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [overwriteMode, setOverwriteMode] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => sleeprApi.auth.me(),
  });

  const { data: existingSessions = [] } = useQuery({
    queryKey: ["userSessions", currentUser?.id],
    queryFn: () => (currentUser ? sleeprApi.sessions.listByUser(currentUser.id) : []),
    enabled: !!currentUser?.id,
  });

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    if (lines.length < 2) {
      setErrors(["CSV file is empty or invalid"]);
      return [];
    }

    const headers = lines[0].split(",").map((header) => header.trim());

    const dateIdx = headers.findIndex((header) => header === "Sleep Score 4 Weeks");
    const scoreIdx = headers.findIndex((header) => header === "Score");
    const hrIdx = headers.findIndex((header) => header === "Resting Heart Rate");
    const qualityIdx = headers.findIndex((header) => header === "Quality");
    const durationIdx = headers.findIndex((header) => header === "Duration");
    const bedtimeIdx = headers.findIndex((header) => header === "Bedtime");
    const wakeTimeIdx = headers.findIndex((header) => header === "Wake Time");

    if (dateIdx === -1 || scoreIdx === -1 || durationIdx === -1 || bedtimeIdx === -1 || wakeTimeIdx === -1) {
      setErrors(["CSV must include: Sleep Score 4 Weeks, Score, Duration, Bedtime, Wake Time"]);
      return [];
    }

    const parseDuration = (durationStr: string) => {
      if (!durationStr || durationStr === "--") return null;
      const hourMatch = durationStr.match(/(\d+)h/);
      const minMatch = durationStr.match(/(\d+)min/);
      const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
      const minutes = minMatch ? parseInt(minMatch[1]) : 0;
      return hours + minutes / 60;
    };

    const parsed: any[] = [];
    const rowErrors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((value) => value.trim());
      if (values.length === 0 || !values[0]) continue;

      try {
        const dateStr = values[dateIdx];
        const scoreStr = values[scoreIdx];
        const durationStr = values[durationIdx];
        const bedtime = values[bedtimeIdx];
        const wakeTime = values[wakeTimeIdx];

        if (!scoreStr || scoreStr === "--") {
          continue;
        }

        if (!dateStr || !durationStr || !bedtime || !wakeTime) {
          rowErrors.push(`Row ${i}: Missing required fields`);
          continue;
        }

        const parsedDate = parse(dateStr, "yyyy-MM-dd", new Date());
        if (!parsedDate || isNaN(parsedDate.getTime())) {
          rowErrors.push(`Row ${i}: Invalid date format`);
          continue;
        }

        const duration = parseDuration(durationStr);
        if (!duration) {
          rowErrors.push(`Row ${i}: Invalid duration format`);
          continue;
        }

        const parseTime12Hour = (timeStr: string) => {
          const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (!match) return null;
          let hours = parseInt(match[1]);
          const minutes = parseInt(match[2]);
          const period = match[3].toUpperCase();
          if (period === "PM" && hours !== 12) hours += 12;
          if (period === "AM" && hours === 12) hours = 0;
          return { hours, minutes };
        };

        const bedtimeParsed = parseTime12Hour(bedtime);
        const wakeTimeParsed = parseTime12Hour(wakeTime);
        if (!bedtimeParsed || !wakeTimeParsed) {
          rowErrors.push(`Row ${i}: Invalid time format`);
          continue;
        }

        const bedtimeDateTime = new Date(parsedDate);
        bedtimeDateTime.setHours(bedtimeParsed.hours, bedtimeParsed.minutes, 0, 0);

        const wakeTimeDateTime = new Date(parsedDate);
        wakeTimeDateTime.setHours(wakeTimeParsed.hours, wakeTimeParsed.minutes, 0, 0);
        if (wakeTimeDateTime <= bedtimeDateTime) {
          wakeTimeDateTime.setDate(wakeTimeDateTime.getDate() + 1);
        }

        const rowData = {
          date: format(parsedDate, "yyyy-MM-dd"),
          start_time: bedtimeDateTime.toISOString(),
          end_time: wakeTimeDateTime.toISOString(),
          duration_hours: duration,
          score: scoreStr && scoreStr !== "--" ? parseFloat(scoreStr) : null,
          resting_heart_rate:
            hrIdx !== -1 && values[hrIdx] && values[hrIdx] !== "--" ? parseFloat(values[hrIdx]) : null,
          quality:
            qualityIdx !== -1 && values[qualityIdx] && values[qualityIdx] !== "--"
              ? values[qualityIdx].toLowerCase()
              : null,
        };

        const existingSession = existingSessions.find(
          (session) => format(new Date(session.start_time), "yyyy-MM-dd") === rowData.date
        );

        parsed.push({
          ...rowData,
          hasConflict: !!existingSession,
          existingSessionId: existingSession?.id,
        });
      } catch (error) {
        rowErrors.push(`Row ${i}: ${(error as Error).message}`);
      }
    }

    setErrors(rowErrors);
    return parsed;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    setParsedData([]);
    setErrors([]);

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const text = String(loadEvent.target?.result ?? "");
      const data = parseCSV(text);
      setParsedData(data);
    };
    reader.readAsText(file);
  };

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) return 0;
      const sessionsToCreate = parsedData.filter((row) => overwriteMode || !row.hasConflict);

      if (overwriteMode) {
        const toDelete = sessionsToCreate
          .filter((row) => row.existingSessionId)
          .map((row) => row.existingSessionId);
        await Promise.all(toDelete.map((id: string) => sleeprApi.sessions.delete(id)));
      }

      const payload = sessionsToCreate.map((row) => ({
        user_id: currentUser.id,
        title: `Imported Sleep - ${row.date}`,
        description: "Imported from CSV",
        start_time: row.start_time,
        end_time: row.end_time,
        duration_hours: row.duration_hours,
        source: "garmin",
        score: row.score,
        resting_heart_rate: row.resting_heart_rate,
        quality: row.quality,
        sleep_stages: null,
      }));

      await sleeprApi.sessions.bulkCreate(payload);
      return sessionsToCreate.length;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedSessions"] });
      queryClient.invalidateQueries({ queryKey: ["userSessions"] });
      navigate(createPageUrl("Profile"));
    },
  });

  const handleImport = () => {
    importMutation.mutate();
  };

  const canImport = parsedData.length > 0 && (overwriteMode || parsedData.some((row) => !row.hasConflict));
  const conflictCount = parsedData.filter((row) => row.hasConflict).length;
  const importCount = overwriteMode
    ? parsedData.length
    : parsedData.filter((row) => !row.hasConflict).length;

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" /> Upload CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="csv-file" className="text-sm font-semibold text-slate-700">
              Select CSV File
            </Label>
            <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} className="mt-1" />
          </div>
          {csvFile && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-900 font-medium">{csvFile.name}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription>
            <p className="font-semibold text-red-900 mb-2">Issues found:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {parsedData.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Preview Import ({parsedData.length} rows)</span>
              {conflictCount > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-amber-600">{conflictCount} conflicts</span>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="overwrite"
                      checked={overwriteMode}
                      onChange={(event) => setOverwriteMode(event.target.checked)}
                    />
                    <Label htmlFor="overwrite" className="text-sm font-normal cursor-pointer">
                      Overwrite existing
                    </Label>
                  </div>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Bedtime</TableHead>
                    <TableHead>Wake Time</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Rest HR</TableHead>
                    <TableHead>Quality</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.map((row, index) => {
                    const willImport = overwriteMode || !row.hasConflict;
                    return (
                      <TableRow key={index} className={!willImport ? "opacity-50" : ""}>
                        <TableCell>
                          {row.hasConflict ? (
                            <div className="flex items-center gap-1 text-amber-600">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-xs">{overwriteMode ? "Overwrite" : "Skip"}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="w-4 h-4" />
                              <span className="text-xs">New</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{row.date}</TableCell>
                        <TableCell>{row.duration_hours}h</TableCell>
                        <TableCell>{format(new Date(row.start_time), "h:mm a")}</TableCell>
                        <TableCell>{format(new Date(row.end_time), "h:mm a")}</TableCell>
                        <TableCell>{row.score || "-"}</TableCell>
                        <TableCell>{row.resting_heart_rate || "-"}</TableCell>
                        <TableCell className="capitalize">{row.quality || "-"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setCsvFile(null);
                  setParsedData([]);
                  setErrors([]);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={!canImport || importMutation.isPending}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing...
                  </>
                ) : (
                  `Import ${importCount} Entries`
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
