import { useEffect, useState } from "react";
import { useBillingStore } from "@/store/useBillingStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
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
import {
  CreditCard,
  Download,
  FileText,
  HardDrive,
  Package,
  Users,
  Clock,
  Check,
  X,
} from "lucide-react";
import { PlanCard } from "./components/plan-card";
import { InvoiceList } from "./components/invoice-list";
import { PaymentMethodDialog } from "./components/payment-method-dialog";

export default function BillingPage() {
  const {
    currentPlan,
    availablePlans,
    usage,
    fetchCurrentPlan,
    fetchAvailablePlans,
    fetchUsage,
    updateSubscription,
    cancelSubscription,
  } = useBillingStore();

  const [selectedInterval, setSelectedInterval] = useState<"monthly" | "yearly">("monthly");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  useEffect(() => {
    fetchCurrentPlan();
    fetchAvailablePlans();
    fetchUsage();
  }, [fetchCurrentPlan, fetchAvailablePlans, fetchUsage]);

  const filteredPlans = availablePlans.filter(
    (plan) => plan.interval === selectedInterval
  );

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Usage</h1>
        <p className="text-muted-foreground">
          Manage your subscription and monitor resource usage
        </p>
      </div>

      {/* Current Plan & Usage */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              Your current subscription and billing details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentPlan ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{currentPlan.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentPlan.description}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    ${currentPlan.price}/{currentPlan.interval}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowPaymentDialog(true)}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Update Payment Method
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-destructive"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel Subscription
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 font-semibold">No Active Subscription</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a plan to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Usage</CardTitle>
            <CardDescription>
              Monitor your current resource consumption
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {usage && currentPlan && (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <HardDrive className="mr-2 h-4 w-4" />
                        Storage
                      </div>
                      <span>
                        {usage.storage_used_gb} / {currentPlan.limits.storage_gb} GB
                      </span>
                    </div>
                    <Progress
                      value={
                        (usage.storage_used_gb / currentPlan.limits.storage_gb) *
                        100
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        Projects
                      </div>
                      <span>
                        {usage.projects_count} / {currentPlan.limits.projects}
                      </span>
                    </div>
                    <Progress
                      value={
                        (usage.projects_count / currentPlan.limits.projects) * 100
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        Team Members
                      </div>
                      <span>
                        {usage.team_members_count} /{" "}
                        {currentPlan.limits.team_members}
                      </span>
                    </div>
                    <Progress
                      value={
                        (usage.team_members_count /
                          currentPlan.limits.team_members) *
                        100
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        Log Retention
                      </div>
                      <span>
                        {usage.current_retention_days} /{" "}
                        {currentPlan.limits.retention_days} days
                      </span>
                    </div>
                    <Progress
                      value={
                        (usage.current_retention_days /
                          currentPlan.limits.retention_days) *
                        100
                      }
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Available Plans</CardTitle>
              <CardDescription>
                Choose the best plan for your needs
              </CardDescription>
            </div>
            <Select
              value={selectedInterval}
              onValueChange={(value) =>
                setSelectedInterval(value as "monthly" | "yearly")
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Billing interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly Billing</SelectItem>
                <SelectItem value="yearly">Yearly Billing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {filteredPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={currentPlan?.id === plan.id}
                onSelect={() => updateSubscription(plan.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View and download past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <InvoiceList />
        </CardContent>
      </Card>

      {/* Cancel Subscription Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your subscription? You'll lose access
              to premium features at the end of your current billing period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await cancelSubscription();
                setShowCancelDialog(false);
              }}
              className="bg-destructive text-destructive-foreground"
            >
              Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Method Dialog */}
      <PaymentMethodDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
      />
    </div>
  );
}
