import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  Users,
  Timer,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  BarChart3,
  Download,
} from "lucide-react";
import { useExampleLogData } from "@/hooks/useExampleLogData";
import { format, parseISO, subDays } from "date-fns";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

interface UserSession {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
  events: UserEvent[];
  status: "success" | "error" | "warning";
  duration: number;
  serviceCount: number;
}

interface UserEvent {
  timestamp: string;
  action: string;
  service: string;
  metadata: Record<string, any>;
  status: "success" | "error" | "warning";
}

export default function UserJourney() {
  const { logs } = useExampleLogData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [durationFilter, setDurationFilter] = useState<[number, number]>([0, 100]);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Group logs into user sessions with enhanced metadata
  const userSessions = useMemo(() => {
    const sessions: UserSession[] = [];
    let currentSession: UserEvent[] = [];
    let lastTimestamp: Date | null = null;
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

    const sortedLogs = [...logs].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    sortedLogs.forEach((log) => {
      const timestamp = new Date(log.timestamp);
      const event: UserEvent = {
        timestamp: log.timestamp,
        action: log.message,
        service: log.service,
        metadata: log.metadata || {},
        status: log.level === "error" ? "error" : 
                log.level === "warn" ? "warning" : "success",
      };

      if (
        !lastTimestamp ||
        timestamp.getTime() - lastTimestamp.getTime() > SESSION_TIMEOUT
      ) {
        if (currentSession.length > 0) {
          const startTime = currentSession[0].timestamp;
          const endTime = currentSession[currentSession.length - 1].timestamp;
          sessions.push({
            id: Math.random().toString(36).substr(2, 9),
            userId: currentSession[0].metadata.user_id || "anonymous",
            startTime,
            endTime,
            events: currentSession,
            status: currentSession.some(e => e.status === "error") ? "error" :
                    currentSession.some(e => e.status === "warning") ? "warning" : "success",
            duration: (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000,
            serviceCount: new Set(currentSession.map(e => e.service)).size,
          });
        }
        currentSession = [event];
      } else {
        currentSession.push(event);
      }
      lastTimestamp = timestamp;
    });

    if (currentSession.length > 0) {
      const startTime = currentSession[0].timestamp;
      const endTime = currentSession[currentSession.length - 1].timestamp;
      sessions.push({
        id: Math.random().toString(36).substr(2, 9),
        userId: currentSession[0].metadata.user_id || "anonymous",
        startTime,
        endTime,
        events: currentSession,
        status: currentSession.some(e => e.status === "error") ? "error" :
                currentSession.some(e => e.status === "warning") ? "warning" : "success",
        duration: (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000,
        serviceCount: new Set(currentSession.map(e => e.service)).size,
      });
    }

    return sessions;
  }, [logs]);

  // Enhanced filtering with multiple criteria
  const filteredSessions = useMemo(() => {
    return userSessions.filter((session) => {
      const matchesSearch = searchTerm === "" ||
        session.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.events.some(event => 
          event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.service.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesStatus = selectedStatus === "all" || session.status === selectedStatus;
      
      const sessionDate = new Date(session.startTime);
      const matchesDate = sessionDate >= dateRange.from && sessionDate <= dateRange.to;
      
      const durationInMinutes = session.duration / 60;
      const matchesDuration = durationInMinutes >= durationFilter[0] && durationInMinutes <= durationFilter[1];

      return matchesSearch && matchesStatus && matchesDate && matchesDuration;
    });
  }, [userSessions, searchTerm, selectedStatus, dateRange, durationFilter]);

  // Analytics data
  const analyticsData = useMemo(() => {
    const statusCount = {
      success: filteredSessions.filter(s => s.status === "success").length,
      warning: filteredSessions.filter(s => s.status === "warning").length,
      error: filteredSessions.filter(s => s.status === "error").length,
    };

    const timeData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: filteredSessions.filter(s => new Date(s.startTime).getHours() === hour).length,
    }));

    return { statusCount, timeData };
  }, [filteredSessions]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "error":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      case "warning":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    }
  };

  // Export session data
  const exportSessionData = () => {
    const data = selectedSession 
      ? [userSessions.find(s => s.id === selectedSession)]
      : filteredSessions;
    
    const csv = [
      ["Session ID", "User ID", "Start Time", "End Time", "Status", "Duration (s)", "Services Used", "Event Count"].join(","),
      ...data.map(s => [
        s.id,
        s.userId,
        s.startTime,
        s.endTime,
        s.status,
        s.duration,
        s.serviceCount,
        s.events.length
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "user-sessions.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Session data exported successfully");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sessions List */}
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-1/3 border-r p-4 flex flex-col"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">User Sessions</h2>
            <div className="flex gap-2">
              <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Session Analytics</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">Session Status Distribution</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={[analyticsData.statusCount]}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="success" fill="#22c55e" />
                          <Bar dataKey="warning" fill="#eab308" />
                          <Bar dataKey="error" fill="#ef4444" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">Sessions by Hour</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={analyticsData.timeData}>
                          <XAxis dataKey="hour" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" />
                        </LineChart>
                      </ResponsiveContainer>
                    </Card>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="icon" onClick={exportSessionData}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Date Range</h4>
                      <div className="grid gap-2">
                        <CalendarComponent
                          mode="range"
                          selected={{
                            from: dateRange.from,
                            to: dateRange.to,
                          }}
                          onSelect={(range) => {
                            if (range?.from && range?.to) {
                              setDateRange({ from: range.from, to: range.to });
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Duration (minutes)</h4>
                      <Slider
                        value={durationFilter}
                        onValueChange={setDurationFilter}
                        max={100}
                        step={1}
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{durationFilter[0]}m</span>
                        <span>{durationFilter[1]}m</span>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 mt-4 -mx-2 px-2">
          <AnimatePresence>
            {filteredSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <div
                  className={`p-4 rounded-lg cursor-pointer transition-all mb-2 ${
                    selectedSession === session.id
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedSession(session.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{session.userId}</span>
                    </div>
                    {getStatusIcon(session.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4" />
                      <span>{Math.round(session.duration / 60)}m</span>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <Activity className="h-4 w-4" />
                      <span>{session.events.length} events</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>
      </motion.div>

      {/* Session Details */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 p-4"
      >
        <AnimatePresence mode="wait">
          {selectedSession ? (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col"
            >
              <div className="mb-4">
                <h2 className="text-2xl font-bold mb-2">Session Details</h2>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>
                      {userSessions.find(s => s.id === selectedSession)?.userId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    <span>
                      {format(
                        parseISO(userSessions.find(s => s.id === selectedSession)?.startTime || ""),
                        "MMM d, yyyy HH:mm:ss"
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 -mx-2 px-2">
                <div className="space-y-4">
                  {userSessions
                    .find(s => s.id === selectedSession)
                    ?.events.map((event, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                      >
                        {index > 0 && (
                          <div className="absolute left-[19px] -top-4 h-4 w-0.5 bg-border" />
                        )}
                        <div className="flex gap-4 items-start">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(event.status)}`}>
                            {getStatusIcon(event.status)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{event.action}</span>
                              <Badge variant="outline" className="text-xs">
                                {event.service}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {format(parseISO(event.timestamp), "HH:mm:ss")}
                            </div>
                            {Object.entries(event.metadata).length > 0 && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Card className="mt-2 p-3">
                                  <div className="text-sm space-y-1">
                                    {Object.entries(event.metadata).map(([key, value]) => (
                                      <div key={key} className="grid grid-cols-3">
                                        <span className="text-muted-foreground">{key}:</span>
                                        <span className="col-span-2">{JSON.stringify(value)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </Card>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </ScrollArea>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex items-center justify-center text-muted-foreground"
            >
              Select a session to view details
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
