import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Customer } from "@/types";
import {
  CustomerForm,
  type CustomerFormValues,
} from "@/components/customers/CustomerForm";

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Existing customer when editing; omitted when creating. */
  customer?: Customer;
  onSaved: (values: CustomerFormValues, id?: string) => void;
}

/**
 * Dialog wrapper around the reusable CustomerForm.
 * Handles create (no `customer`) and edit (with `customer`) flows.
 */
export const CustomerFormDialog = ({
  open,
  onOpenChange,
  customer,
  onSaved,
}: CustomerFormDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{customer ? "Edit customer" : "Add customer"}</DialogTitle>
        <DialogDescription>
          {customer
            ? "Update the customer details below."
            : "Fill in the details to create a new customer."}
        </DialogDescription>
      </DialogHeader>
      <CustomerForm
        key={customer?.id ?? "new"}
        customer={customer}
        submitLabel={customer ? "Save changes" : "Create customer"}
        onCancel={() => onOpenChange(false)}
        onSubmit={(values) => {
          onSaved(values, customer?.id);
          onOpenChange(false);
        }}
      />
    </DialogContent>
  </Dialog>
);