"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Button } from "@fleetio/ui/button";
import { useAppForm } from "@fleetio/ui/hooks";
import { createPaymentMethodSchema } from "@fleetio/validators";

import { useTRPC } from "~/trpc/react";

const defaultValues: {
  name: string;
} = {
  name: "",
};

export function PaymentMethodsForm() {
  const trpc = useTRPC();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methodsQuery = useQuery(
    trpc.meta.listPaymentMethods.queryOptions({
      currentPage: 1,
      itemsPerPage: 50,
    }),
  );

  type MethodRow = NonNullable<(typeof methodsQuery)["data"]>["data"][number];

  const createMethod = useMutation(
    trpc.meta.createPaymentMethod.mutationOptions(),
  );
  const updateMethod = useMutation(
    trpc.meta.updatePaymentMethod.mutationOptions(),
  );
  const deleteMethod = useMutation(
    trpc.meta.deletePaymentMethod.mutationOptions(),
  );

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: createPaymentMethodSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        if (editingId) {
          await updateMethod.mutateAsync({
            id: editingId,
            ...value,
          });
        } else {
          await createMethod.mutateAsync(value);
        }

        await methodsQuery.refetch();
        setEditingId(null);
        form.reset();
      } catch (error) {
        console.error("Failed to save payment method", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const methods: MethodRow[] = methodsQuery.data?.data ?? [];

  const handleEdit = (method: MethodRow) => {
    setEditingId(method.id);
    form.setFieldValue("name", method.name);
  };

  const handleDelete = async (id: number) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this payment method? This action cannot be undone.",
    );

    if (!shouldDelete) return;

    try {
      await deleteMethod.mutateAsync({ id });
      if (editingId === id) {
        setEditingId(null);
        form.reset();
      }
      await methodsQuery.refetch();
    } catch (error) {
      console.error("Failed to delete payment method", error);
    }
  };

  const isMutating =
    isSubmitting ||
    createMethod.isPending ||
    updateMethod.isPending ||
    deleteMethod.isPending;

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Payment Methods
            </h2>
            <p className="text-muted-foreground text-sm">
              Create, update, and delete payment methods (e.g., Cash, Bank
              Transfer, etc.).
            </p>
          </div>
          {editingId ? (
            <Button
              variant="ghost"
              onClick={() => {
                setEditingId(null);
                form.reset();
              }}
              disabled={isMutating}
            >
              Cancel edit
            </Button>
          ) : null}
        </div>

        <form
          onSubmit={async (event) => {
            event.preventDefault();
            await form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.AppField name="name">
            {(field) => (
              <field.Input
                label="Name"
                description="Name of the payment method"
                placeholder="Bank Transfer"
              />
            )}
          </form.AppField>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingId(null);
                form.reset();
              }}
              disabled={isMutating}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isMutating}>
              {editingId
                ? isMutating
                  ? "Updating..."
                  : "Update method"
                : isMutating
                  ? "Creating..."
                  : "Create method"}
            </Button>
          </div>
        </form>

        {(createMethod.error ?? updateMethod.error) && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
            {(createMethod.error ?? updateMethod.error)?.message}
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Existing payment methods</h3>
          <span className="text-muted-foreground text-sm">
            {methods.length} total
          </span>
        </div>

        {methodsQuery.isLoading ? (
          <p className="text-muted-foreground text-sm">
            Loading payment methods...
          </p>
        ) : methods.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No payment methods yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted-foreground border-b">
                <tr className="[&>th]:py-2 [&>th]:pr-3">
                  <th>Name</th>
                  <th className="w-0 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {methods.map((method) => (
                  <tr key={method.id} className="[&>td]:py-2 [&>td]:pr-3">
                    <td className="font-semibold">{method.name}</td>
                    <td className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(method)}
                        disabled={isMutating}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(method.id)}
                        disabled={isMutating}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {deleteMethod.error && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
            {deleteMethod.error.message}
          </div>
        )}
      </div>
    </div>
  );
}
