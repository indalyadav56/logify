import { useWebhookStore } from "@/store/useWebhookStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { WebhookList } from "./components/webhook-list";
import { CreateWebhook } from "./components/create-webhook";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function WebhooksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Webhooks</h2>
          <p className="text-muted-foreground">
            Manage your webhook endpoints and monitor their deliveries.
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Webhook
        </Button>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="space-y-0 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>All Webhooks</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative w-60">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search webhooks..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active" className="space-y-4">
              <TabsList>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-4">
                <WebhookList
                  showActive={true}
                  searchQuery={searchQuery}
                />
              </TabsContent>

              <TabsContent value="inactive" className="space-y-4">
                <WebhookList
                  showActive={false}
                  searchQuery={searchQuery}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <CreateWebhook
        open={isCreating}
        onOpenChange={setIsCreating}
      />
    </div>
  );
}
