import type { Activity, Customer } from "@/types";

/**
 * In-memory mock data store.
 *
 * This module owns the seed data and exposes simple, synchronous helper
 * functions so pages and components can read and mutate the data without
 * dealing with persistence. It is intentionally framework-agnostic so it
 * can be swapped for a real API client in a later step without touching the
 * UI layer.
 *
 * All arrays live in module scope, so every importer shares the same state
 * for the lifetime of the browser session.
 */

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const seedCustomers: Customer[] = [
  {
    id: "c-1",
    name: "Giulia Romano",
    company: "Acme Srl",
    email: "giulia.romano@acme.example",
    phone: "+39 333 1122334",
    notes: "Decision maker for the renewal contract.",
  },
  {
    id: "c-2",
    name: "Marco Bianchi",
    company: "Beta Industries",
    email: "marco.bianchi@beta.example",
    phone: "+39 348 9988776",
    notes: "Prefers to be contacted in the morning.",
  },
  {
    id: "c-3",
    name: "Sofia Conti",
    company: "Conti Studio",
    email: "sofia@contistudio.example",
    phone: "+39 320 4455667",
  },
  {
    id: "c-4",
    name: "Luca Greco",
    company: "Delta Logistics",
    email: "luca.greco@delta.example",
    phone: "+39 392 5566778",
    notes: "Asked for a follow-up about the new pricing plan.",
  },
];

const seedActivities: Activity[] = [
  {
    id: "a-1",
    customerId: "c-1",
    title: "Send renewal proposal",
    description: "Prepare and send the annual renewal proposal.",
    dueDate: "2025-09-02",
    completed: false,
  },
  {
    id: "a-2",
    customerId: "c-2",
    title: "Discovery call",
    description: "First discovery call to understand requirements.",
    dueDate: "2025-08-28",
    completed: false,
  },
  {
    id: "a-3",
    customerId: "c-3",
    title: "Demo of the new dashboard",
    dueDate: "2025-09-05",
    completed: false,
  },
  {
    id: "a-4",
    customerId: "c-1",
    title: "Follow up on quote",
    description: "Check if the quote sent last week needs adjustments.",
    dueDate: "2025-08-21",
    completed: true,
  },
  {
    id: "a-5",
    customerId: "c-4",
    title: "Pricing plan follow-up",
    dueDate: "2025-09-10",
    completed: false,
  },
];

// ---------------------------------------------------------------------------
// In-memory state (mutable, shared across importers)
// ---------------------------------------------------------------------------

let customers: Customer[] = [...seedCustomers];
let activities: Activity[] = [...seedActivities];

// Simple monotonic counters so generated ids stay unique after mutations.
let customerCounter = customers.length;
let activityCounter = activities.length;

const nextId = (prefix: string, counter: number) => `${prefix}-${counter + 1}`;

// ---------------------------------------------------------------------------
// Customer helpers
// ---------------------------------------------------------------------------

export const getCustomers = (): Customer[] => [...customers];

export const getCustomer = (id: string): Customer | undefined =>
  customers.find((c) => c.id === id);

export const addCustomer = (data: Omit<Customer, "id">): Customer => {
  const customer: Customer = { id: nextId("c", customerCounter), ...data };
  customerCounter += 1;
  customers = [...customers, customer];
  return customer;
};

export const updateCustomer = (
  id: string,
  data: Partial<Omit<Customer, "id">>,
): Customer | undefined => {
  customers = customers.map((c) => (c.id === id ? { ...c, ...data } : c));
  return getCustomer(id);
};

export const deleteCustomer = (id: string): void => {
  customers = customers.filter((c) => c.id !== id);
};

// ---------------------------------------------------------------------------
// Activity helpers
// ---------------------------------------------------------------------------

export const getActivities = (): Activity[] => [...activities];

export const getActivitiesByCustomer = (customerId: string): Activity[] =>
  activities.filter((a) => a.customerId === customerId);

export const addActivity = (data: Omit<Activity, "id">): Activity => {
  const activity: Activity = { id: nextId("a", activityCounter), ...data };
  activityCounter += 1;
  activities = [...activities, activity];
  return activity;
};

export const updateActivity = (
  id: string,
  data: Partial<Omit<Activity, "id">>,
): Activity | undefined => {
  activities = activities.map((a) => (a.id === id ? { ...a, ...data } : a));
  return activities.find((a) => a.id === id);
};

export const deleteActivity = (id: string): void => {
  activities = activities.filter((a) => a.id !== id);
};