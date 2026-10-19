import { useState } from "react";
import { CheckCircle2, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useIdentity } from "@/hooks/useIdentity";
import { useVerifyParkingSpot, useReportParkingSpot, reportReasons, reportReasonLabels, type ReportReason } from "@/hooks/useVerifyParking";
import { getApiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ParkingSpot } from "@/types/parking";

export function VerifyReportActions({ spot }: { spot: ParkingSpot }) {
  const { activeUser } = useIdentity();
  const verifyMutation = useVerifyParkingSpot(spot.id);
  const reportMutation = useReportParkingSpot(spot.id);

  const [reportOpen, setReportOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [comment, setComment] = useState("");

  function handleVerify() {
    if (!activeUser) return;
    verifyMutation.mutate({ userId: activeUser.id });
  }

  function handleSubmitReport() {
    if (!activeUser || !selectedReason) return;
    reportMutation.mutate(
      { userId: activeUser.id, reason: selectedReason, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          setReportOpen(false);
          setSelectedReason(null);
          setComment("");
        },
      }
    );
  }

  const alreadyDone = spot.verificationStatus === "COMMUNITY_VERIFIED" || spot.verificationStatus === "REJECTED";

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          className="flex-1"
          variant="accent"
          onClick={handleVerify}
          isLoading={verifyMutation.isPending}
          disabled={!activeUser || alreadyDone}
        >
          <CheckCircle2 className="h-4 w-4" />
          Verify This Parking
        </Button>
        <Button variant="outline" onClick={() => setReportOpen(true)} disabled={!activeUser}>
          <Flag className="h-4 w-4" />
          Report
        </Button>
      </div>

      {verifyMutation.isError && (
        <p className="text-xs text-destructive">{getApiErrorMessage(verifyMutation.error, "Couldn't verify this spot.")}</p>
      )}
      {verifyMutation.isSuccess && (
        <p className="text-xs text-success">
          Thanks — {verifyMutation.data.verifyCount} verification{verifyMutation.data.verifyCount === 1 ? "" : "s"} so far.
        </p>
      )}

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report a problem</DialogTitle>
            <DialogDescription>Let us know what's wrong with this parking spot.</DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            {reportReasons.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => setSelectedReason(reason)}
                className={cn(
                  "block w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  selectedReason === reason
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border text-muted-foreground hover:bg-secondary"
                )}
              >
                {reportReasonLabels[reason]}
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add details (optional)"
            rows={3}
            className="mt-3 w-full rounded-lg border border-input bg-background p-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />

          {reportMutation.isError && (
            <p className="mt-1 text-xs text-destructive">
              {getApiErrorMessage(reportMutation.error, "Couldn't submit this report.")}
            </p>
          )}

          <Button className="mt-3 w-full" onClick={handleSubmitReport} isLoading={reportMutation.isPending} disabled={!selectedReason}>
            Submit report
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
