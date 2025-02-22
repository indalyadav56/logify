import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Download,
  RefreshCw,
  AlertCircle,
  Info,
  AlertTriangle,
  Bug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import LogSection from "./LogSection";
import { useLogStore } from "@/store/useLogStore";

const levelOptions = ["ERROR", "WARNING", "INFO", "DEBUG", "TRACE"];

const getLevelIcon = (level: string) => {
  switch (level) {
    case "ERROR":
      return <AlertCircle className="h-4 w-4" />;
    case "WARNING":
      return <AlertTriangle className="h-4 w-4" />;
    case "INFO":
      return <Info className="h-4 w-4" />;
    case "DEBUG":
      return <Bug className="h-4 w-4" />;
    case "TRACE":
      return <Bug className="h-4 w-4" />;
    default:
      return null;
  }
};

const getLevelColor = (level: string) => {
  switch (level) {
    case "ERROR":
      return "text-red-500";
    case "WARNING":
      return "text-yellow-500";
    case "INFO":
      return "text-blue-500";
    case "TRACE":
      return "text-blue-500";
    case "DEBUG":
      return "text-gray-500";
    default:
      return "";
  }
};

export default function LogExplorer() {
  const { logs, fetchLogs, setFilter } = useLogStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [projects, setProjects] = useState([
    { id: "1", name: "Project A" },
    { id: "2", name: "Project B" },
  ]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Reset page to 1 and clear logs before fetching
    setFilter("page", 1);
    setFilter("selectedService", selectedProject);
    await fetchLogs();
    setIsRefreshing(false);
    // Scroll to top after refresh
    window.scrollTo(0, 0);
  };

  // Calculate log statistics
  const stats = {
    total: logs.length,
    errors: logs.filter(log => log.level === "ERROR").length,
    warnings: logs.filter(log => log.level === "WARNING").length,
    info: logs.filter(log => log.level === "INFO").length,
    debug: logs.filter(log => log.level === "DEBUG").length,
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header Section */}
      <header className="flex-none bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="px-6 py-4 space-y-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-semibold tracking-tight mb-1">Log Explorer</h1>
                <p className="text-sm text-muted-foreground">Monitor and analyze your application logs</p>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-5 gap-4">
            <Card>
              <CardHeader className="p-4">
                <CardDescription>Total Logs</CardDescription>
                <CardTitle>{stats.total.toLocaleString()}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-red-100">
              <CardHeader className="p-4">
                <CardDescription className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Errors
                </CardDescription>
                <CardTitle className="text-red-500">{stats.errors}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-yellow-100">
              <CardHeader className="p-4">
                <CardDescription className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Warnings
                </CardDescription>
                <CardTitle className="text-yellow-500">{stats.warnings}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-blue-100">
              <CardHeader className="p-4">
                <CardDescription className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-500" />
                  Info
                </CardDescription>
                <CardTitle className="text-blue-500">{stats.info}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-gray-100">
              <CardHeader className="p-4">
                <CardDescription className="flex items-center gap-2">
                  <Bug className="h-4 w-4 text-gray-500" />
                  Debug
                </CardDescription>
                <CardTitle className="text-gray-500">{stats.debug}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs by message, service, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {levelOptions.map((level) => (
                <Button
                  key={level}
                  variant={selectedLevels.includes(level) ? "default" : "outline"}
                  size="sm"
                  className={`flex items-center gap-2 ${
                    selectedLevels.includes(level) ? "" : getLevelColor(level)
                  }`}
                  onClick={() =>
                    setSelectedLevels(
                      selectedLevels.includes(level)
                        ? selectedLevels.filter((l) => l !== level)
                        : [...selectedLevels, level]
                    )
                  }
                >
                  {getLevelIcon(level)}
                  {level}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <LogSection
          logs={logs}
          selectedProject={selectedProject}
          isRefreshing={isRefreshing}
        />
      </main>
    </div>
  );
}
