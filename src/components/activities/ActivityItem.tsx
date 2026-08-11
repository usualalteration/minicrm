import { Check, CheckCircle2, Clock, RotateCcw, CalendarClock, Trash2 } from "lucide-react";
import type { Activity, Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date";

interface ActivityItemProps {
  activity: Activity;
  customer?: Customer;
  /** Toggle completed (mark complete / reopen). Omit to hide the button. */
  onToggleComplete?: (id: string) => void;
  /** Postpone to a new date. Omit to hide the button. */
  onPostpone?: (id: string) => void;
  /** Delete the activity. Omit to hide the button. */
  onDelete?: (id: string) => void;
}

/**
 * Renders a single activity with its customer and optional actions:
 * mark as completed / reopen, postpone, and delete. Buttons appear only
 * when the matching handler is supplied, so each view can expose exactly
 * the actions it needs. Completed activities are visually distinguished
 * (muted background + strike-through title).
 */
export const ActivityItem = ({
  activity,
  customer,
  onToggleComplete,
  onPostpone,
  onDelete,
}: ActivityItemProps) => {
  const { completed } = activity;

  return (
    <li
      className={cn(
        "flex flex-col gap-3 px-4 py-3 transition-colors sm:flex-row sm:items-center sm:justify-between",
        completed && "bg-muted/40",
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
            completed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700",
          )}
        >
          {completed ? <Check className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
        </span>

        <div className="min-w-0">
          <p
            className={cn(
              "font-medium",
              completed && "text-muted-foreground line-through",
            )}
          >
            {activity.title}
          </p>
          {activity.description && !completed && (
            <p className="truncate text-sm text-muted-foreground">
              {activity.description}
            </p>
          )}
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground/80">
              {customer?.name ?? "Unknown customer"}
            </span>
            {customer?.company && <span>· {customer.company}</span>}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:justify-end">
        <span className="hidden items-center gap-1 text-sm text-muted-foreground sm:flex">
          <CalendarClock className="h-4 w-4" />
          {formatDate(activity.dueDate)}
        </span>
        <span className="text-sm text-muted-foreground sm:hidden">
          {formatDate(activity.dueDate)}
        </span>

        {onToggleComplete &&
          (completed ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Reopen activity"
              title="Reopen"
              onClick={() => onToggleComplete(activity.id)}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Mark as completed"
              title="Mark as completed"
              onClick={() => onToggleComplete(activity.id)}
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          ))}
        {onPostpone && !completed && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Postpone activity"
            title="Postpone"
            onClick={() => onPostpone(activity.id)}
          >
            <CalendarClock className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete activity"
            title="Delete"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(activity.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </li>
  );
};