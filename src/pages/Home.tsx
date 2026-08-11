import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Users, CalendarClock, CheckCircle2, Clock } from "lucide-react";
import { getActivities, getCustomers, updateActivity, deleteActivity } from "@/data/mockData";
import type { Activity } from "@/types";
import { cn } from "@/lib/utils";
import { ActivityItem } from "@/components/activities/ActivityItem";
import { PostponeDialog } from "@/components/activities/PostponeDialog";
import { QuickActivityForm } from "@/components/activities/QuickActivityForm";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

const StatCard = ({
  to,
  label,
  value,
  icon: Icon,
  accent,
}: {
  to: string;
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) => (
  <Link
    to={to}
    aria-label={`${label}: ${value}`}
    className="group flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
  >
    <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg transition-transform group-hover:scale-105", accent)}>
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  </Link>
);

const Home = () => {
  // Bump on every mutation to re-read from the in-memory store.
  const [version, setVersion] = useState(0);
  const [postponeId, setPostponeId] = useState<string | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | undefined>(undefined);

  void version;
  const reload = () => setVersion((v) => v + 1);

  const customers = getCustomers();
  const activities = getActivities();

  const completedCount = activities.filter((a) => a.completed).length;
  const pendingCount = activities.length - completedCount;

  // All activities, ordered by due date ascending. The list re-sorts
  // automatically after every modification because we re-read the store
  // and re-sort on each render.
  const ordered = useMemo(
    () => [...activities].sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [activities],
  );

  const customerById = useMemo(() => {
    const map: Record<string, (typeof customers)[number]> = {};
    for (const c of customers) map[c.id] = c;
    return map;
  }, [customers]);

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

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          All scheduled activities, sorted by due date.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          to="/customers"
          label="Customers"
          value={customers.length}
          icon={Users}
          accent="bg-primary/10 text-primary"
        />
        <StatCard
          to="/activities"
          label="Total activities"
          value={activities.length}
          icon={CalendarClock}
          accent="bg-secondary text-secondary-foreground"
        />
        <StatCard
          to="/activities/pending"
          label="Pending"
          value={pendingCount}
          icon={Clock}
          accent="bg-amber-100 text-amber-700"
        />
        <StatCard
          to="/activities/completed"
          label="Completed"
          value={completedCount}
          icon={CheckCircle2}
          accent="bg-emerald-100 text-emerald-700"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <QuickActivityForm onCreated={reload} />

        <section className="rounded-xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold">Activities</h2>
              <p className="text-sm text-muted-foreground">
                {ordered.length} total · {pendingCount} pending · {completedCount} completed
              </p>
            </div>
          </div>

          {ordered.length === 0 ? (
            <p className="px-5 py-8 text-sm text-muted-foreground">
              No activities yet. Add one from the panel on the left.
            </p>
          ) : (
            <ul className="divide-y">
              {ordered.map((activity: Activity) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  customer={customerById[activity.customerId]}
                  onToggleComplete={handleToggleComplete}
                  onPostpone={(id) => setPostponeId(id)}
                  onDelete={(id) => setDeleteId(id)}
                />
              ))}
            </ul>
          )}
        </section>
      </div>

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

export default Home;