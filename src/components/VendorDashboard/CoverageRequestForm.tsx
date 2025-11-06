import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { statesAndCounties } from "@/data/statesAndCounties";

const formSchema = z.object({
  state: z.string().min(1, "State is required"),
  county: z.string().min(1, "County is required"),
  title: z.string().min(5, "Title must be at least 5 characters"),
  details: z.string().min(10, "Details must be at least 10 characters"),
});

type FormData = z.infer<typeof formSchema>;

export function CoverageRequestForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingData, setPendingData] = useState<FormData | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      state: "",
      county: "",
      title: "",
      details: "",
    },
  });

  const selectedState = form.watch("state");
  const counties = selectedState ? statesAndCounties[selectedState] || [] : [];

  const handleFormSubmit = (data: FormData) => {
    setPendingData(data);
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    if (!pendingData || !user) return;

    setIsSubmitting(true);
    setShowConfirmModal(false);

    try {
      // Call the RPC function to atomically spend credit and create request
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "create_coverage_request_with_credit",
        {
          p_user_id: user.id,
          p_state: pendingData.state,
          p_county: pendingData.county,
          p_title: pendingData.title,
          p_details: pendingData.details,
          p_credits_required: 1,
        }
      );

      if (rpcError) {
        // Handle specific error types
        if (rpcError.message.includes("INSUFFICIENT_CREDITS")) {
          toast.error("You don't have enough credits to post. Please purchase credits to continue.");
          // TODO: Open purchase credits dialog
          return;
        } else if (rpcError.message.includes("NO_CREDIT_RECORD")) {
          toast.error("Credit wallet not found. Please contact support or try again.");
          return;
        } else if (rpcError.message.includes("INVALID_CREDIT_AMOUNT")) {
          toast.error("Invalid credit amount requested.");
          return;
        } else {
          throw rpcError;
        }
      }

      if (!rpcData || rpcData.length === 0) {
        throw new Error("No data returned from RPC");
      }

      const { coverage_request_id, new_balance } = rpcData[0];

      // Show success toast
      toast.success(`Coverage request posted! Remaining credits: ${new_balance}`);

      // Fetch user profile for email
      const { data: profileData } = await supabase
        .from("profiles")
        .select("anonymous_username")
        .eq("id", user.id)
        .single();

      const displayName = profileData?.anonymous_username || "User";

      // Send receipt email
      try {
        await supabase.functions.invoke("send-coverage-request-receipt", {
          body: {
            toEmail: user.email,
            displayName,
            state: pendingData.state,
            county: pendingData.county,
            title: pendingData.title,
            creditsUsed: 1,
            newBalance: new_balance,
            coverageRequestId: coverage_request_id,
          },
        });
      } catch (emailError) {
        console.error("Failed to send receipt email:", emailError);
        // Don't fail the whole operation if email fails
      }

      // Navigate to the new posting
      navigate(`/coverage/requests/${coverage_request_id}`);
      
      // Reset form
      form.reset();
    } catch (error: any) {
      console.error("Error creating coverage request:", error);
      toast.error("Something went wrong creating your request. Please try again or contact support.");
    } finally {
      setIsSubmitting(false);
      setPendingData(null);
    }
  };

  return (
    <>
      <Form {...form}>
        <form id="coverage_request_form" onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.keys(statesAndCounties).map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="county"
            render={({ field }) => (
              <FormItem>
                <FormLabel>County</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                  disabled={!selectedState}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedState ? "Select county" : "Select state first"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {counties.map((county) => (
                      <SelectItem key={county} value={county}>
                        {county}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Urgent: Field Rep Needed in Miami-Dade" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="details"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Details</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe the coverage request, requirements, timeline, etc."
                    rows={5}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Request...
              </>
            ) : (
              "Post Coverage Request (1 Credit)"
            )}
          </Button>
        </form>
      </Form>

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Use 1 Credit to Post Coverage Request?</DialogTitle>
            <DialogDescription>
              Posting this coverage request will use 1 ClearMarket Credit from your balance. 
              Credits are non-refundable once the posting is created. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Use 1 Credit & Post"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
