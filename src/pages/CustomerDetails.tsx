import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CheckCircle2,
  Mail,
  Pencil,
  Phone,
  Trash2,
  User,
} from "lucide-react";
import {
  getActivitiesByCustomer,
  getCustomer,
  deleteCustomer,
  updateCustomer,
  addCustomer,
} from "@/data/mockData";
import type { Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { CustomerFormDialog } from "@/components/customers/CustomerFormDialog";
import type { CustomerFormValues } from "@/components/customers/CustomerForm";
import { formatDate } from "@/lib/date";

const DetailRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
}) => (
  <div className="flex items-start gap-3">
    <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="break-words text-sm font-medium">{value || "—"}</p>
    </div>
  </div>
);

const CustomerDetails = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  // Local version counter so edits re-render this view from the in-memory store.
  const [version, setVersion] = useState(0);

  const customer = getCustomer(id);

  if (!customer) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-16 text-center">
        <p className="text-lg font-medium">Customer not found.</p>
        <Link to="/customers" className="text-primary hover:underline">
          Back to customers
        </Link>
      </div>
    );
  }

  const activities = getActivitiesByCustomer(customer.id);
  const pending = activities.filter((a) => !a.completed).length;

  const handleSave = (values: CustomerFormValues, existingId?: string) => {
    if (existingId) {
      updateCustomer(existingId, values);
      setVersion((v) => v + 1);
    } else {
      addCustomer(values);
    }
  };

  const handleDelete = () => {
    deleteCustomer(customer.id);
    navigate("/customers");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/customers"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to customers
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl">{customer.name}</h1>
            {customer.company && (
              <p className="text-sm text-muted-foreground">{customer.company}</p>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <DetailRow icon={Building2} label="Company" value={customer.company} />
          <DetailRow icon={Mail} label="Email" value={customer.email} />
          <DetailRow icon={Phone} label="Phone" value={customer.phone} />
        </div>

        {customer.notes && (
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{customer.notes}</p>
          </div>
        )}
      </section>

      <section className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">Activities</h2>
            <p className="text-sm text-muted-foreground">
              {activities.length} total · {pending} pending
            </p>
          </div>
          <CalendarClock className="h-5 w-5 text-muted-foreground" />
        </div>
        {activities.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">
            No activities scheduled for this customer.
          </p>
        ) : (
          <ul className="divide-y">
            {activities.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className={`font-medium ${a.completed ? "text-muted-foreground line-through" : ""}`}>
                    {a.title}
                  </p>
                  {a.description && (
                    <p className="truncate text-sm text-muted-foreground">{a.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
                  <span>{formatDate(a.dueDate)}</span>
                  {a.completed && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <CustomerFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        customer={customer as Customer}
        onSaved={handleSave}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete customer"
        description={`Are you sure you want to delete ${customer.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default CustomerDetails;