import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "./components/profile-form";
import { NotificationsForm } from "./components/notifications-form";
import { DisplayForm } from "./components/display-form";
import { ApiKeysForm } from "./components/api-keys-form";
import { BillingForm } from "./components/billing-form";

export default function SettingsPage() {
  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Separator />
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-4">
          <ProfileForm />
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <NotificationsForm />
        </TabsContent>
        <TabsContent value="display" className="space-y-4">
          <DisplayForm />
        </TabsContent>
        <TabsContent value="api-keys" className="space-y-4">
          <ApiKeysForm />
        </TabsContent>
        <TabsContent value="billing" className="space-y-4">
          <BillingForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
