import { useWebhookStore } from "@/store/useWebhookStore";
import { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle2, PlayCircle, XCircle } from "lucide-react";

interface WebhookDeliveriesProps {
  webhookId: string;
}

export function WebhookDeliveries({ webhookId }: WebhookDeliveriesProps) {
  const { deliveries, fetchDeliveries, retryDelivery, isLoading } =
    useWebhookStore();

  useEffect(() => {
    fetchDeliveries(webhookId);
  }, [webhookId, fetchDeliveries]);

  const webhookDeliveries = deliveries[webhookId] || [];

  return (
    <div className="p-4 bg-muted/50">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Recent Deliveries</h3>
        <p className="text-sm text-muted-foreground">
          View and manage webhook delivery attempts
        </p>
      </div>

      <ScrollArea className="h-[300px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Event Type</TableHead>
              <TableHead>Response</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading deliveries...
                </TableCell>
              </TableRow>
            ) : webhookDeliveries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No deliveries found
                </TableCell>
              </TableRow>
            ) : (
              webhookDeliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {delivery.status === "success" ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : delivery.status === "failed" ? (
                        <XCircle className="h-4 w-4 text-destructive" />
                      ) : (
                        <div className="h-4 w-4 rounded-full bg-yellow-500" />
                      )}
                      {/* <Badge
                        variant={
                          delivery.status === "success"
                            ? "success"
                            : delivery.status === "failed"
                            ? "destructive"
                            : "warning"
                        }
                      >
                        {delivery.status}
                      </Badge> */}
                    </div>
                  </TableCell>
                  <TableCell>
                    {/* <Badge variant="outline">{delivery.event_type}</Badge> */}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          {delivery.response_status || "View Details"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Delivery Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Request Body</h4>
                            <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[200px]">
                              {JSON.stringify(
                                JSON.parse(delivery.request_body),
                                null,
                                2
                              )}
                            </pre>
                          </div>
                          {delivery.response_body && (
                            <div>
                              <h4 className="font-medium mb-2">
                                Response Body
                              </h4>
                              <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[200px]">
                                {JSON.stringify(
                                  JSON.parse(delivery.response_body),
                                  null,
                                  2
                                )}
                              </pre>
                            </div>
                          )}
                          {delivery.error && (
                            <div>
                              <h4 className="font-medium mb-2">Error</h4>
                              <pre className="bg-destructive/10 text-destructive p-4 rounded-lg overflow-auto max-h-[200px]">
                                {delivery.error}
                              </pre>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                  <TableCell>
                    {/* {formatDistanceToNow(new Date(delivery.created_at), {
                      addSuffix: true,
                    })} */}
                  </TableCell>
                  <TableCell className="text-right">
                    {delivery.status === "failed" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => retryDelivery(webhookId, delivery.id)}
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Retry
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
