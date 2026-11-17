"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Button } from "@fleetio/ui/button";
import { useAppForm } from "@fleetio/ui/hooks";
import { createApprovalStatusSchema } from "@fleetio/validators";

import { useTRPC } from "~/trpc/react";

const defaultValues: {
  name: string;
} = {
  name: "",
};

export function ApprovalStatusesForm() {
  const trpc = useTRPC();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusesQuery = useQuery(
    trpc.meta.listApprovalStatuses.queryOptions({
      currentPage: 1,
      itemsPerPage: 50,
    }),
  );

  type StatusRow = NonNullable<(typeof statusesQuery)["data"]>["data"][number];

  const createStatus = useMutation(
    trpc.meta.createApprovalStatus.mutationOptions(),
  );
  const updateStatus = useMutation(
    trpc.meta.updateApprovalStatus.mutationOptions(),
  );
  const deleteStatus = useMutation(
    trpc.meta.deleteApprovalStatus.mutationOptions(),
  );

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: createApprovalStatusSchema,
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
          await createStatus.mutateAsync(value);
        }

        await statusesQuery.refetch();
        setEditingId(null);
        form.reset();
      } catch (error) {
        console.error("Failed to save approval status", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const statuses: StatusRow[] = statusesQuery.data?.data ?? [];

  const handleEdit = (status: StatusRow) => {
    setEditingId(status.id);
    form.setFieldValue("name", status.name);
  };

  const handleDelete = async (id: number) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this approval status? This action cannot be undone.",
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
      console.error("Failed to delete approval status", error);
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
            <h2 className="text-2xl font-bold tracking-tight">
              Approval Statuses
            </h2>
            <p className="text-muted-foreground text-sm">
              Create, update, and delete approval statuses (e.g., Pending,
              Approved, Rejected, etc.).
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
                description="Name of the approval status"
                placeholder="Approved"
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
          <h3 className="text-lg font-semibold">Existing approval statuses</h3>
          <span className="text-muted-foreground text-sm">
            {statuses.length} total
          </span>
        </div>

        {statusesQuery.isLoading ? (
          <p className="text-muted-foreground text-sm">
            Loading approval statuses...
          </p>
        ) : statuses.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No approval statuses yet.
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
                {statuses.map((status) => (
                  <tr key={status.id} className="[&>td]:py-2 [&>td]:pr-3">
                    <td className="font-semibold">{status.name}</td>
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
