import { useState } from "react";
import { Check, Plus, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useIdentity } from "@/hooks/useIdentity";
import { cn } from "@/lib/utils";

export function IdentitySwitcher() {
  const [open, setOpen] = useState(false);
  const { activeUser, users, isLoading, switchTo, createNewIdentity } = useIdentity();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-dashed border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary"
        title="No login yet — this is a demo identity, not a real account"
      >
        <User className="h-3.5 w-3.5" />
        {isLoading ? (
          <Spinner className="h-3 w-3" />
        ) : (
          <span className="max-w-[110px] truncate sm:max-w-[160px]">
            Demo User: {activeUser?.name ?? "..."}
          </span>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demo User</DialogTitle>
            <DialogDescription>
              ParkEase doesn't have real login yet — this is a placeholder identity your
              verify/report/submit actions are attributed to. Switch to a different Demo User to try
              "another user" verifying a spot.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-64 space-y-1 overflow-y-auto">
            {users.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => {
                  switchTo(user.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  user.id === activeUser?.id
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border text-muted-foreground hover:bg-secondary"
                )}
              >
                <span className="truncate">{user.name}</span>
                {user.id === activeUser?.id && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            className="mt-3 w-full"
            onClick={() => {
              createNewIdentity();
              setOpen(false);
            }}
          >
            <Plus className="h-4 w-4" />
            Create new Demo User
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
