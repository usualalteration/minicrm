import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { todayISO } from "@/lib/date";

interface PostponeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Current due date (ISO) used as the default selection. */
  currentDate: string;
  onConfirm: (newDate: string) => void;
}

/**
 * Small reusable dialog that lets the user pick a new due date for an
 * activity (the "Postpone" action).
 */
export const PostponeDialog = ({
  open,
  onOpenChange,
  currentDate,
  onConfirm,
}: PostponeDialogProps) => {
  const [date, setDate] = useState(currentDate || todayISO());
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (open) {
      setDate(currentDate || todayISO());
      setError(undefined);
    }
  }, [open, currentDate]);

  const handleConfirm = () => {
    if (!date) {
      setError("Please choose a date.");
      return;
    }
    onConfirm(date);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Postpone activity</DialogTitle>
          <DialogDescription>
            Choose a new due date for this activity.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="postpone-date">New due date</Label>
          <Input
            id="postpone-date"
            name="dueDate"
            type="date"
            value={date}
            min={todayISO()}
            onChange={(e) => {
              setDate(e.target.value);
              setError(undefined);
            }}
            aria-invalid={!!error}
            aria-describedby={error ? "postpone-date-error" : undefined}
          />
          {error && (
            <p id="postpone-date-error" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm}>
            Confirm new date
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};