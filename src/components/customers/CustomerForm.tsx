import { useState } from "react";
import type { Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type CustomerFormValues = Omit<Customer, "id">;

interface CustomerFormProps {
  /** Existing customer when editing; omitted when creating. */
  customer?: Customer;
  /** Called with the validated form values. */
  onSubmit: (values: CustomerFormValues) => void;
  /** Called when the user cancels. */
  onCancel: () => void;
  /** Submit button label. */
  submitLabel?: string;
}

const emptyValues: CustomerFormValues = {
  name: "",
  company: "",
  email: "",
  phone: "",
  notes: "",
};

type Errors = Partial<Record<keyof CustomerFormValues, string>>;

const validate = (values: CustomerFormValues): Errors => {
  const errors: Errors = {};
  if (!values.name.trim()) {
    errors.name = "Name is required.";
  }
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  return errors;
};

/**
 * Reusable customer form used for both creating and editing a customer.
 * It is a controlled, framework-agnostic component: the parent owns the
 * dialog and persistence, this component only owns field state + validation.
 */
export const CustomerForm = ({
  customer,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: CustomerFormProps) => {
  const [values, setValues] = useState<CustomerFormValues>(() => {
    if (!customer) return { ...emptyValues };
    const { id: _id, ...rest } = customer;
    return {
      name: rest.name ?? "",
      company: rest.company ?? "",
      email: rest.email ?? "",
      phone: rest.phone ?? "",
      notes: rest.notes ?? "",
    };
  });
  const [errors, setErrors] = useState<Errors>({});

  const setField = (field: keyof CustomerFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate(values);
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    onSubmit({
      name: values.name.trim(),
      company: values.company.trim() || undefined,
      email: values.email.trim() || undefined,
      phone: values.phone.trim() || undefined,
      notes: values.notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="customer-name">Name</Label>
        <Input
          id="customer-name"
          name="name"
          autoComplete="name"
          value={values.name}
          onChange={(e) => setField("name", e.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "customer-name-error" : undefined}
        />
        {errors.name && (
          <p id="customer-name-error" className="text-sm text-destructive">
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer-company">Company</Label>
        <Input
          id="customer-company"
          name="company"
          autoComplete="organization"
          value={values.company}
          onChange={(e) => setField("company", e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customer-email">Email</Label>
          <Input
            id="customer-email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "customer-email-error" : undefined}
          />
          {errors.email && (
            <p id="customer-email-error" className="text-sm text-destructive">
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer-phone">Phone</Label>
          <Input
            id="customer-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => setField("phone", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer-notes">Notes</Label>
        <Textarea
          id="customer-notes"
          name="notes"
          value={values.notes}
          onChange={(e) => setField("notes", e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
};