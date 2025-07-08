import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PrivacySettings from "@/components/privacy/PrivacySettings";
import NotificationsSettings from "@/components/privacy/NotificationsSettings";
import AccountSettings from "@/components/privacy/AccountSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Bell, User } from "lucide-react";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("privacy");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-8">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Account Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your privacy preferences and notification settings
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="privacy">
              <PrivacySettings />
            </TabsContent>

            <TabsContent value="notifications">
              <NotificationsSettings />
            </TabsContent>

            <TabsContent value="account">
              <AccountSettings />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SettingsPage;