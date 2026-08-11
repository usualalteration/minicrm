// Domain models for the Mini CRM application.
// These interfaces are the single source of truth for the shape of data
// used across pages, components, and the in-memory mock store.

export interface Customer {
  id: string;
  name: string;
  /** Optional company the customer belongs to. */
  company?: string;
  /** Optional contact email. */
  email?: string;
  /** Optional contact phone number. */
  phone?: string;
  /** Optional free-form notes about the customer. */
  notes?: string;
}

export interface Activity {
  id: string;
  /** Id of the {@link Customer} this activity is scheduled for. */
  customerId: string;
  title: string;
  /** Optional longer description of the activity. */
  description?: string;
  /** ISO 8601 date string (e.g. "2025-01-31"). */
  dueDate: string;
  completed: boolean;
}