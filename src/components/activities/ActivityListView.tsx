import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import {
  deleteActivity,
  getActivities,
  getCustomers,
  updateActivity,
} from "@/data/mockData";
import type { Activity } from "@/types";
import { Input } from "@/components/ui/input";
import { ActivityItem } from "@/components/activities/ActivityItem";
import { PostponeDialog } from "@/components/activities/PostponeDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

type Mode = "all" | "pending" | "completed";

interface ActivityListViewProps {
  mode: Mode;
  title: string;
  description?: string;
}

const matches = (q: string, ...fields: (string | undefined)[]) =>
  fields.some((f) => f?.toLowerCase().includes(q));

/**
 * Reusable activity list view used by the dashboard's clickable stat cards.
 * It filters by status (all / pending / completed), keeps activities ordered
 * by due date ascending, supports instant search, and exposes only the
 * actions relevant to the given mode. All mutations re-read the in-memory
 * store so the view updates reactively without a page reload.
 */
export const ActivityListView = ({ mode, title, description }: ActivityListViewProps) => {
  const [version, setVersion] = useState(0);
  const [query, setQuery] = useState("");
  const [postponeId, setPostponeId] = useState<string | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | undefined>(undefined);

  void version;
  const reload = () => setVersion((v) => v + 1);

  const customers = getCustomers();
  const activities = getActivities();

  const customerById = useMemo(() => {
    const map: Record<string, (typeof customers)[number]> = {};
    for (const c of customers) map[c.id] = c;
    return map;
  }, [customers]);

  const visible = useMemo(() => {
    const byMode = activities.filter((a) =>
      mode === "all" ? true : mode === "pending" ? !a.completed : a.completed,
    );
    const q = query.trim().toLowerCase();
    const filtered = q
      ? byMode.filter((a) => {
          const c = customerById[a.customerId];
          return matches(q, a.title, a.description, c?.name, c?.company);
        })
      : byMode;
    return [...filtered].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [activities, customerById, mode, query]);

  const postponeTarget = postponeId
    ? activities.find((a) => a.id === postponeId)
    : undefined;
  const deleteTarget = deleteId ? activities.find((a) => a.id === deleteId) : undefined;

  const handleToggleComplete = (id: string) => {
    const current = activities.find((a) => a.id === id);
    if (current) {
      updateActivity(id, { completed: !current.completed });
      reload();
    }
  };

  const handlePostpone = (id: string, newDate: string) => {
    updateActivity(id, { dueDate: newDate });
    reload();
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteActivity(deleteId);
      setDeleteId(undefined);
      reload();
    }
  };

  // Expose only the actions allowed for this mode.
  const actionProps =
    mode === "pending"
      ? {
          onToggleComplete: handleToggleComplete,
          onPostpone: (id: string) => setPostponeId(id),
          onDelete: (id: string) => setDeleteId(id),
        }
      : mode === "completed"
        ? {
            onToggleComplete: handleToggleComplete,
            onDelete: (id: string) => setDeleteId(id),
          }
        : {};

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">{title}</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="activity-search"
          name="activity-search"
          placeholder="Search by title, description or customer…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
          aria-label="Search activities"
        />
      </div>

      <section className="rounded-xl border bg-card shadow-sm">
        {visible.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">
            {query ? "No activities match your search." : "No activities in this view."}
          </p>
        ) : (
          <ul className="divide-y">
            {visible.map((activity: Activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                customer={customerById[activity.customerId]}
                {...actionProps}
              />
            ))}
          </ul>
        )}
      </section>

      <PostponeDialog
        open={!!postponeId}
        onOpenChange={(o) => !o && setPostponeId(undefined)}
        currentDate={postponeTarget?.dueDate ?? ""}
        onConfirm={(newDate) => postponeId && handlePostpone(postponeId, newDate)}
      />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(undefined)}
        title="Delete activity"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
};