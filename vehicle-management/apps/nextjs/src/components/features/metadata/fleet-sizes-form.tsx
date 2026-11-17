"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Button } from "@fleetio/ui/button";
import { useAppForm } from "@fleetio/ui/hooks";
import { createFleetSizeSchema } from "@fleetio/validators";

import { useTRPC } from "~/trpc/react";

const defaultValues: {
  code: string;
  size_label: string;
  description?: string | undefined;
} = {
  code: "",
  size_label: "",
  description: undefined,
};

export function FleetSizesForm() {
  const trpc = useTRPC();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fleetSizesQuery = useQuery(
    trpc.meta.listFleetSizes.queryOptions({
      currentPage: 1,
      itemsPerPage: 50,
    }),
  );

  type FleetSizeRow = NonNullable<
    (typeof fleetSizesQuery)["data"]
  >["data"][number];

  const createFleetSize = useMutation(
    trpc.meta.createFleetSize.mutationOptions(),
  );
  const updateFleetSize = useMutation(
    trpc.meta.updateFleetSize.mutationOptions(),
  );
  const deleteFleetSize = useMutation(
    trpc.meta.deleteFleetSize.mutationOptions(),
  );

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: createFleetSizeSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        if (editingId) {
          await updateFleetSize.mutateAsync({
            id: editingId,
            ...value,
            size_label: value.size_label,
          });
        } else {
          await createFleetSize.mutateAsync({
            ...value,
            size_label: value.size_label,
          });
        }

        await fleetSizesQuery.refetch();
        setEditingId(null);
        form.reset();
      } catch (error) {
        console.error("Failed to save fleet size", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const fleetSizes: FleetSizeRow[] = fleetSizesQuery.data?.data ?? [];

  const handleEdit = (fleetSize: FleetSizeRow) => {
    setEditingId(fleetSize.id);
    form.setFieldValue("code", fleetSize.code);
    form.setFieldValue("size_label", (fleetSize.size_label ?? "").toString());
    form.setFieldValue("description", fleetSize.description ?? "");
  };

  const handleDelete = async (id: number) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this fleet size? This action cannot be undone.",
    );

    if (!shouldDelete) return;

    try {
      await deleteFleetSize.mutateAsync({ id });
      if (editingId === id) {
        setEditingId(null);
        form.reset();
      }
      await fleetSizesQuery.refetch();
    } catch (error) {
      console.error("Failed to delete fleet size", error);
    }
  };

  const isMutating =
    isSubmitting ||
    createFleetSize.isPending ||
    updateFleetSize.isPending ||
    deleteFleetSize.isPending;

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Fleet Sizes</h2>
            <p className="text-muted-foreground text-sm">
              Create, update, and delete fleet sizes (cargo capacity).
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
                  placeholder="SIZE_17"
                />
              )}
            </form.AppField>

            <form.AppField name="size_label">
              {(field) => (
                <field.Input
                  // type="number"
                  label="Size Label"
                  description="Numeric size (e.g. 17, 20, 24, 32)"
                  placeholder="17"
                />
              )}
            </form.AppField>
          </div>

          <form.AppField name="description">
            {(field) => (
              <field.Textarea
                label="Description"
                description="Optional description"
                placeholder="Fleet size description"
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
                  : "Update fleet size"
                : isMutating
                  ? "Creating..."
                  : "Create fleet size"}
            </Button>
          </div>
        </form>

        {(createFleetSize.error ?? updateFleetSize.error) && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
            {(createFleetSize.error ?? updateFleetSize.error)?.message}
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Existing fleet sizes</h3>
          <span className="text-muted-foreground text-sm">
            {fleetSizes.length} total
          </span>
        </div>

        {fleetSizesQuery.isLoading ? (
          <p className="text-muted-foreground text-sm">
            Loading fleet sizes...
          </p>
        ) : fleetSizes.length === 0 ? (
          <p className="text-muted-foreground text-sm">No fleet sizes yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted-foreground border-b">
                <tr className="[&>th]:py-2 [&>th]:pr-3">
                  <th>Code</th>
                  <th>Size Label</th>
                  <th>Description</th>
                  <th className="w-0 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {fleetSizes.map((fleetSize) => (
                  <tr key={fleetSize.id} className="[&>td]:py-2 [&>td]:pr-3">
                    <td className="font-mono text-xs">{fleetSize.code}</td>
                    <td className="font-semibold">{fleetSize.size_label}</td>
                    <td className="text-muted-foreground">
                      {fleetSize.description ?? "—"}
                    </td>
                    <td className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(fleetSize)}
                        disabled={isMutating}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(fleetSize.id)}
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

        {deleteFleetSize.error && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
            {deleteFleetSize.error.message}
          </div>
        )}
      </div>
    </div>
  );
}
