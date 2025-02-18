import { BillingPlan } from "@/store/useBillingStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface PlanCardProps {
  plan: BillingPlan;
  isCurrentPlan: boolean;
  onSelect: () => void;
}

export function PlanCard({ plan, isCurrentPlan, onSelect }: PlanCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className={isCurrentPlan ? "border-primary" : undefined}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </div>
          {isCurrentPlan && (
            <Badge variant="default">Current Plan</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">
              {formatPrice(plan.price)}
            </span>
            <span className="text-muted-foreground">
              /{plan.interval}
            </span>
          </div>
          {plan.interval === "yearly" && (
            <p className="text-sm text-muted-foreground mt-1">
              Save 20% with yearly billing
            </p>
          )}
        </div>

        <div className="space-y-2">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center">
              <Check className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t pt-4">
          <div className="flex items-center justify-between text-sm">
            <span>Storage</span>
            <span className="font-medium">{plan.limits.storage_gb} GB</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Projects</span>
            <span className="font-medium">
              {plan.limits.projects === -1
                ? "Unlimited"
                : plan.limits.projects}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Team Members</span>
            <span className="font-medium">
              {plan.limits.team_members === -1
                ? "Unlimited"
                : plan.limits.team_members}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Log Retention</span>
            <span className="font-medium">
              {plan.limits.retention_days} days
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={isCurrentPlan ? "outline" : "default"}
          onClick={onSelect}
          disabled={isCurrentPlan}
        >
          {isCurrentPlan ? "Current Plan" : "Select Plan"}
        </Button>
      </CardFooter>
    </Card>
  );
}
