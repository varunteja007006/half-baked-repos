"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Button } from "@fleetio/ui/button";
import { useAppForm } from "@fleetio/ui/hooks";
import { createTripTypeSchema } from "@fleetio/validators";

import { useTRPC } from "~/trpc/react";

const defaultValues: {
  code: string;
  name: string;
  description?: string | undefined;
} = {
  code: "",
  name: "",
  description: undefined,
};

export function TripTypesForm() {
  const trpc = useTRPC();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tripTypesQuery = useQuery(
    trpc.meta.listTripTypes.queryOptions({
      currentPage: 1,
      itemsPerPage: 50,
    }),
  );

  type TripTypeRow = NonNullable<
    (typeof tripTypesQuery)["data"]
  >["data"][number];

  const createTripType = useMutation(
    trpc.meta.createTripType.mutationOptions(),
  );
  const updateTripType = useMutation(
    trpc.meta.updateTripType.mutationOptions(),
  );
  const deleteTripType = useMutation(
    trpc.meta.deleteTripType.mutationOptions(),
  );

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: createTripTypeSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        if (editingId) {
          await updateTripType.mutateAsync({
            id: editingId,
            ...value,
          });
        } else {
          await createTripType.mutateAsync({
            ...value,
          });
        }

        await tripTypesQuery.refetch();
        setEditingId(null);
        form.reset();
      } catch (error) {
        console.error("Failed to save trip type", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const tripTypes: TripTypeRow[] = tripTypesQuery.data?.data ?? [];

  const handleEdit = (tripType: TripTypeRow) => {
    setEditingId(tripType.id);
    form.setFieldValue("code", tripType.code);
    form.setFieldValue("name", tripType.name);
    form.setFieldValue("description", tripType.description ?? "");
  };

  const handleDelete = async (id: number) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this trip type? This action cannot be undone.",
    );

    if (!shouldDelete) return;

    try {
      await deleteTripType.mutateAsync({ id });
      if (editingId === id) {
        setEditingId(null);
        form.reset();
      }
      await tripTypesQuery.refetch();
    } catch (error) {
      console.error("Failed to delete trip type", error);
    }
  };

  const isMutating =
    isSubmitting ||
    createTripType.isPending ||
    updateTripType.isPending ||
    deleteTripType.isPending;

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Trip Types</h2>
            <p className="text-muted-foreground text-sm">
              Create, update, and delete trip types.
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
                  placeholder="regular"
                />
              )}
            </form.AppField>

            <form.AppField name="name">
              {(field) => (
                <field.Input
                  label="Name"
                  description="Human-friendly name"
                  placeholder="Regular Trip"
                />
              )}
            </form.AppField>
          </div>

          <form.AppField name="description">
            {(field) => (
              <field.Textarea
                label="Description"
                description="Optional description"
                placeholder="Trip type description"
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
                  : "Update trip type"
                : isMutating
                  ? "Creating..."
                  : "Create trip type"}
            </Button>
          </div>
        </form>

        {(createTripType.error ?? updateTripType.error) && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
            {(createTripType.error ?? updateTripType.error)?.message}
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Existing trip types</h3>
          <span className="text-muted-foreground text-sm">
            {tripTypes.length} total
          </span>
        </div>

        {tripTypesQuery.isLoading ? (
          <p className="text-muted-foreground text-sm">Loading trip types...</p>
        ) : tripTypes.length === 0 ? (
          <p className="text-muted-foreground text-sm">No trip types yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted-foreground border-b">
                <tr className="[&>th]:py-2 [&>th]:pr-3">
                  <th>Code</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th className="w-0 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tripTypes.map((tripType) => (
                  <tr key={tripType.id} className="[&>td]:py-2 [&>td]:pr-3">
                    <td className="font-mono text-xs">{tripType.code}</td>
                    <td>{tripType.name}</td>
                    <td className="text-muted-foreground">
                      {tripType.description ?? "—"}
                    </td>
                    <td className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(tripType)}
                        disabled={isMutating}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(tripType.id)}
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

        {deleteTripType.error && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
            {deleteTripType.error.message}
          </div>
        )}
      </div>
    </div>
  );
}
