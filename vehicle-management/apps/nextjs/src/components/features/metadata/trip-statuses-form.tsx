"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Button } from "@fleetio/ui/button";
import { useAppForm } from "@fleetio/ui/hooks";
import { createTripStatusSchema } from "@fleetio/validators";

import { useTRPC } from "~/trpc/react";

const defaultValues: {
  code: string;
  label: string;
  order?: string | undefined;
  description?: string | undefined;
} = {
  code: "",
  label: "",
  order: undefined,
  description: undefined,
};

export function TripStatusesForm() {
  const trpc = useTRPC();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusesQuery = useQuery(
    trpc.meta.listTripStatuses.queryOptions({
      currentPage: 1,
      itemsPerPage: 50,
    }),
  );

  type StatusRow = NonNullable<(typeof statusesQuery)["data"]>["data"][number];

  const createStatus = useMutation(
    trpc.meta.createTripStatus.mutationOptions(),
  );
  const updateStatus = useMutation(
    trpc.meta.updateTripStatus.mutationOptions(),
  );
  const deleteStatus = useMutation(
    trpc.meta.deleteTripStatus.mutationOptions(),
  );

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: createTripStatusSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        if (editingId) {
          await updateStatus.mutateAsync({
            id: editingId,
            ...value,
          });
        } else {
          await createStatus.mutateAsync({
            ...value,
          });
        }

        await statusesQuery.refetch();
        setEditingId(null);
        form.reset();
      } catch (error) {
        console.error("Failed to save trip status", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const statuses: StatusRow[] = statusesQuery.data?.data ?? [];

  const handleEdit = (status: StatusRow) => {
    setEditingId(status.id);
    form.setFieldValue("code", status.code);
    form.setFieldValue("label", status.label);
    form.setFieldValue("order", (status.order ?? 0).toString());
    form.setFieldValue("description", status.description ?? "");
  };

  const handleDelete = async (id: number) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this trip status? This action cannot be undone.",
    );

    if (!shouldDelete) return;

    try {
      await deleteStatus.mutateAsync({ id });
      if (editingId === id) {
        setEditingId(null);
        form.reset();
      }
      await statusesQuery.refetch();
    } catch (error) {
      console.error("Failed to delete trip status", error);
    }
  };

  const isMutating =
    isSubmitting ||
    createStatus.isPending ||
    updateStatus.isPending ||
    deleteStatus.isPending;

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Trip Statuses</h2>
            <p className="text-muted-foreground text-sm">
              Create, update, and delete trip statuses.
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
          <div className="grid gap-4 sm:grid-cols-2">
            <form.AppField name="code">
              {(field) => (
                <field.Input
                  label="Code"
                  description="Slug-like code (letters, numbers, hyphens, underscores)"
                  placeholder="pending"
                />
              )}
            </form.AppField>

            <form.AppField name="label">
              {(field) => (
                <field.Input
                  label="Label"
                  description="Human-friendly label"
                  placeholder="Pending"
                />
              )}
            </form.AppField>
          </div>

          <form.AppField name="order">
            {(field) => (
              <field.Input
                label="Order"
                description="Display order (lower numbers appear first)"
                placeholder="0"
              />
            )}
          </form.AppField>

          <form.AppField name="description">
            {(field) => (
              <field.Textarea
                label="Description"
                description="Optional description"
                placeholder="Status description"
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
                  : "Update status"
                : isMutating
                  ? "Creating..."
                  : "Create status"}
            </Button>
          </div>
        </form>

        {(createStatus.error ?? updateStatus.error) && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
            {(createStatus.error ?? updateStatus.error)?.message}
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Existing statuses</h3>
          <span className="text-muted-foreground text-sm">
            {statuses.length} total
          </span>
        </div>

        {statusesQuery.isLoading ? (
          <p className="text-muted-foreground text-sm">Loading statuses...</p>
        ) : statuses.length === 0 ? (
          <p className="text-muted-foreground text-sm">No statuses yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted-foreground border-b">
                <tr className="[&>th]:py-2 [&>th]:pr-3">
                  <th>Code</th>
                  <th>Label</th>
                  <th>Order</th>
                  <th>Description</th>
                  <th className="w-0 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {statuses.map((status) => (
                  <tr key={status.id} className="[&>td]:py-2 [&>td]:pr-3">
                    <td className="font-mono text-xs">{status.code}</td>
                    <td>{status.label}</td>
                    <td className="text-muted-foreground text-xs">
                      {status.order ?? "—"}
                    </td>
                    <td className="text-muted-foreground">
                      {status.description ?? "—"}
                    </td>
                    <td className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(status)}
                        disabled={isMutating}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(status.id)}
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

        {deleteStatus.error && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
            {deleteStatus.error.message}
          </div>
        )}
      </div>
    </div>
  );
}
