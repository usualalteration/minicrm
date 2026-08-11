import { useMemo, useState } from "react";
import { Check, Plus, Search, X } from "lucide-react";
import { addActivity, getCustomers } from "@/data/mockData";
import type { Customer } from "@/types";
import { cn } from "@/lib/utils";
import { todayISO } from "@/lib/date";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface QuickActivityFormProps {
  /** Called after a new activity is saved so the parent can refresh. */
  onCreated: () => void;
}

const emptyForm = {
  query: "",
  customerId: "",
  title: "",
  description: "",
  dueDate: todayISO(),
};

/**
 * Fast inline panel to create a new activity:
 *  - instant customer search with a selectable list
 *  - title (required), optional description, due date (required)
 *  - on save it persists the activity and clears the form
 *
 * Selected vs. unselected customers use clearly distinct colors so the
 * selection state is always legible.
 */
export const QuickActivityForm = ({ onCreated }: QuickActivityFormProps) => {
  const [query, setQuery] = useState(emptyForm.query);
  const [customerId, setCustomerId] = useState(emptyForm.customerId);
  const [title, setTitle] = useState(emptyForm.title);
  const [description, setDescription] = useState(emptyForm.description);
  const [dueDate, setDueDate] = useState(emptyForm.dueDate);
  const [touched, setTouched] = useState(false);

  const customers = getCustomers();

  const selectedCustomer = customers.find((c) => c.id === customerId);

  const filteredCustomers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      [c.name, c.company, c.email, c.phone].some((v) =>
        v?.toLowerCase().includes(q),
      ),
    );
  }, [customers, query]);

  const titleError = touched && !title.trim() ? "Title is required." : "";
  const dateError = touched && !dueDate ? "Due date is required." : "";
  const canSave = !!customerId && !!title.trim() && !!dueDate;

  const reset = () => {
    setQuery(emptyForm.query);
    setCustomerId(emptyForm.customerId);
    setTitle(emptyForm.title);
    setDescription(emptyForm.description);
    setDueDate(emptyForm.dueDate);
    setTouched(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSave) return;
    addActivity({
      customerId,
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate,
      completed: false,
    });
    reset();
    onCreated();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-card p-5 shadow-sm"
      aria-label="Quick activity creation"
    >
      <div className="mb-4 flex items-center gap-2">
        <Plus className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Quick add activity</h2>
      </div>

      {/* Customer search + selection */}
      <div className="space-y-2">
        <Label htmlFor="quick-customer-search">Customer</Label>

        {selectedCustomer ? (
          <div className="flex items-center justify-between rounded-md border bg-primary/10 px-3 py-2">
            <span className="flex items-center gap-2 text-sm font-medium text-primary">
              <Check className="h-4 w-4" />
              {selectedCustomer.name}
              {selectedCustomer.company && (
                <span className="font-normal text-muted-foreground">
                  · {selectedCustomer.company}
                </span>
              )}
            </span>
            <button
              type="button"
              aria-label="Clear selected customer"
              onClick={() => setCustomerId("")}
              className="rounded-sm p-1 text-primary hover:bg-primary/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="quick-customer-search"
              name="customer-search"
              placeholder="Search customers…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              aria-label="Search customers"
              aria-autocomplete="list"
            />
          </div>
        )}

        {!selectedCustomer && (
          <ul
            className="max-h-44 overflow-auto rounded-md border bg-background"
            role="listbox"
            aria-label="Customer results"
          >
            {filteredCustomers.length === 0 ? (
              <li className="px-3 py-3 text-sm text-muted-foreground">
                No customers found.
              </li>
            ) : (
              filteredCustomers.slice(0, 6).map((c: Customer) => {
                const selected = c.id === customerId;
                return (
                  <li key={c.id} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      onClick={() => setCustomerId(c.id)}
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors",
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-accent",
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="truncate font-medium">{c.name}</span>
                        {c.company && (
                          <span
                            className={cn(
                              "truncate text-xs",
                              selected ? "text-primary-foreground/80" : "text-muted-foreground",
                            )}
                          >
                            · {c.company}
                          </span>
                        )}
                      </span>
                      {selected && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        )}
        {touched && !customerId && (
          <p className="text-sm text-destructive">Select a customer.</p>
        )}
      </div>

      {/* Title */}
      <div className="mt-4 space-y-2">
        <Label htmlFor="quick-title">Title</Label>
        <Input
          id="quick-title"
          name="title"
          placeholder="e.g. Follow-up call"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={!!titleError}
          aria-describedby={titleError ? "quick-title-error" : undefined}
        />
        {titleError && (
          <p id="quick-title-error" className="text-sm text-destructive">
            {titleError}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="mt-4 space-y-2">
        <Label htmlFor="quick-description">Description (optional)</Label>
        <Textarea
          id="quick-description"
          name="description"
          rows={2}
          placeholder="Add a few details…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Due date */}
      <div className="mt-4 space-y-2">
        <Label htmlFor="quick-due-date">Due date</Label>
        <Input
          id="quick-due-date"
          name="dueDate"
          type="date"
          value={dueDate}
          min={todayISO()}
          onChange={(e) => setDueDate(e.target.value)}
          aria-invalid={!!dateError}
          aria-describedby={dateError ? "quick-due-date-error" : undefined}
        />
        {dateError && (
          <p id="quick-due-date-error" className="text-sm text-destructive">
            {dateError}
          </p>
        )}
      </div>

      <div className="mt-5 flex justify-end">
        <Button type="submit" disabled={!canSave}>
          <Plus className="h-4 w-4" />
          Add activity
        </Button>
      </div>
    </form>
  );
};