import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, CreditCard } from "lucide-react";

const billingInfo = {
  plan: "Pro",
  status: "Active",
  nextBilling: "March 1, 2024",
  amount: "$49.00",
  usage: {
    logs: {
      used: 850000,
      total: 1000000,
      percentage: 85,
    },
    storage: {
      used: 75,
      total: 100,
      percentage: 75,
    },
  },
};

const invoices = [
  {
    id: "INV-001",
    date: "Feb 1, 2024",
    amount: "$49.00",
    status: "Paid",
  },
  {
    id: "INV-002",
    date: "Jan 1, 2024",
    amount: "$49.00",
    status: "Paid",
  },
  {
    id: "INV-003",
    date: "Dec 1, 2023",
    amount: "$49.00",
    status: "Paid",
  },
];

export function BillingForm() {
  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                Manage your plan and billing information.
              </CardDescription>
            </div>
            <Badge>{billingInfo.plan}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Status</p>
              <p className="text-sm text-muted-foreground">{billingInfo.status}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Next Billing</p>
              <p className="text-sm text-muted-foreground">
                {billingInfo.nextBilling}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Amount</p>
              <p className="text-sm text-muted-foreground">
                {billingInfo.amount}/month
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Log Events</p>
                <p className="text-sm text-muted-foreground">
                  {billingInfo.usage.logs.used.toLocaleString()} /{" "}
                  {billingInfo.usage.logs.total.toLocaleString()}
                </p>
              </div>
              <Progress value={billingInfo.usage.logs.percentage} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Storage</p>
                <p className="text-sm text-muted-foreground">
                  {billingInfo.usage.storage.used}GB /{" "}
                  {billingInfo.usage.storage.total}GB
                </p>
              </div>
              <Progress value={billingInfo.usage.storage.percentage} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-between space-x-2">
          <Button variant="outline">Change Plan</Button>
          <Button variant="default">
            <CreditCard className="mr-2 h-4 w-4" />
            Update Payment Method
          </Button>
        </CardFooter>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View and download your invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{invoice.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle>Pro Plan Features</CardTitle>
          <CardDescription>
            Your current plan includes the following features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-4 sm:grid-cols-2">
            <li className="flex items-center space-x-2">
              <Badge variant="secondary">Included</Badge>
              <span className="text-sm">1M log events per month</span>
            </li>
            <li className="flex items-center space-x-2">
              <Badge variant="secondary">Included</Badge>
              <span className="text-sm">100GB storage</span>
            </li>
            <li className="flex items-center space-x-2">
              <Badge variant="secondary">Included</Badge>
              <span className="text-sm">Advanced analytics</span>
            </li>
            <li className="flex items-center space-x-2">
              <Badge variant="secondary">Included</Badge>
              <span className="text-sm">24/7 support</span>
            </li>
            <li className="flex items-center space-x-2">
              <Badge variant="secondary">Included</Badge>
              <span className="text-sm">Custom dashboards</span>
            </li>
            <li className="flex items-center space-x-2">
              <Badge variant="secondary">Included</Badge>
              <span className="text-sm">Team collaboration</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
