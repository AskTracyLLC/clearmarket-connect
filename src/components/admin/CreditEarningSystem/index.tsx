import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditRulesManager } from "./CreditRulesManager";
import { CreditAuditLog } from "./CreditAuditLog";
import { Settings, History } from "lucide-react";

export const CreditEarningSystem = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Credit Earning System Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="rules" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Credit Rules
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Audit Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="mt-6">
            <CreditRulesManager />
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            <CreditAuditLog />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};