import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import {
  addCustomer,
  getActivities,
  getCustomers,
  deleteCustomer,
  updateCustomer,
} from "@/data/mockData";
import type { Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  CustomerFormDialog,
} from "@/components/customers/CustomerFormDialog";
import type { CustomerFormValues } from "@/components/customers/CustomerForm";

const Customers = () => {
  const [query, setQuery] = useState("");
  // Bump on every mutation to re-read from the in-memory store.
  const [version, setVersion] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | undefined>(undefined);
  const [deleting, setDeleting] = useState<Customer | undefined>(undefined);

  void version; // re-render trigger

  const customers = getCustomers();
  const activities = getActivities();

  const activityCountByCustomer = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of activities) counts[a.customerId] = (counts[a.customerId] ?? 0) + 1;
    return counts;
  }, [activities]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      [c.name, c.company, c.email, c.phone].some((v) =>
        v?.toLowerCase().includes(q),
      ),
    );
  }, [customers, query]);

  const reload = () => setVersion((v) => v + 1);

  const openAdd = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditing(customer);
    setFormOpen(true);
  };

  const handleSave = (values: CustomerFormValues, id?: string) => {
    if (id) updateCustomer(id, values);
    else addCustomer(values);
    reload();
  };

  const handleDelete = () => {
    if (deleting) {
      deleteCustomer(deleting.id);
      reload();
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Customers</h1>
          <p className="mt-1 text-muted-foreground">
            Browse, search and manage your customer base.
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Add customer
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="customer-search"
          name="customer-search"
          placeholder="Search by name, company, email or phone…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
          aria-label="Search customers"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <Users className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {query ? "No customers match your search." : "No customers yet."}
          </p>
          {!query && (
            <Button variant="outline" onClick={openAdd}>
              <Plus className="h-4 w-4" />
              Add your first customer
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border shadow-sm md:block">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 text-right font-medium">Activities</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((c) => (
                  <tr key={c.id} className="group hover:bg-accent/40">
                    <td className="px-4 py-3">
                      <Link
                        to={`/customers/${c.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.company ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.email ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {activityCountByCustomer[c.id] ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${c.name}`}
                          onClick={() => openEdit(c)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${c.name}`}
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleting(c)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {filtered.map((c) => (
              <li key={c.id} className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/customers/${c.id}`}
                    className="min-w-0 flex-1 hover:text-primary"
                  >
                    <p className="font-medium">{c.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {c.company ?? "No company"}
                    </p>
                  </Link>
                  <span className="shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                    {activityCountByCustomer[c.id] ?? 0} activities
                  </span>
                </div>
                {(c.email || c.phone) && (
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {c.email && <p className="truncate">{c.email}</p>}
                    {c.phone && <p>{c.phone}</p>}
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleting(c)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <CustomerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        customer={editing}
        onSaved={handleSave}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(undefined)}
        title="Delete customer"
        description={
          deleting
            ? `Are you sure you want to delete ${deleting.name}? This action cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Customers;