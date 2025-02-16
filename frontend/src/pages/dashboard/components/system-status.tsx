import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const services = [
  {
    name: "API Server",
    status: "operational",
    health: 98,
    responseTime: "45ms",
  },
  {
    name: "Database",
    status: "operational",
    health: 99,
    responseTime: "35ms",
  },
  {
    name: "Cache",
    status: "operational",
    health: 100,
    responseTime: "12ms",
  },
  {
    name: "Worker",
    status: "degraded",
    health: 85,
    responseTime: "150ms",
  },
  {
    name: "Storage",
    status: "operational",
    health: 97,
    responseTime: "55ms",
  },
];

export function SystemStatus() {
  return (
    <div className="space-y-4">
      {services.map((service) => (
        <div key={service.name} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{service.name}</span>
                <Badge
                  variant={service.status === "operational" ? "default" : "secondary"}
                >
                  {service.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Response Time: {service.responseTime}
              </p>
            </div>
            <span className="text-sm font-medium">{service.health}%</span>
          </div>
          <Progress
            value={service.health}
            className={service.health >= 90 ? "bg-green-100" : "bg-yellow-100"}
          />
        </div>
      ))}
    </div>
  );
}
