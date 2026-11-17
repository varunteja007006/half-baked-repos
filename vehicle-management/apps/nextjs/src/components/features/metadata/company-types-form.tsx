"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Button } from "@fleetio/ui/button";
import { useAppForm } from "@fleetio/ui/hooks";
import { createCompanyTypeSchema } from "@fleetio/validators";

import { useTRPC } from "~/trpc/react";

const defaultValues: {
  name: string;
} = {
  name: "",
};

export function CompanyTypesForm() {
  const trpc = useTRPC();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const typesQuery = useQuery(
    trpc.meta.listCompanyTypes.queryOptions({
      currentPage: 1,
      itemsPerPage: 50,
    }),
  );

  type TypeRow = NonNullable<(typeof typesQuery)["data"]>["data"][number];

  const createType = useMutation(trpc.meta.createCompanyType.mutationOptions());
  const updateType = useMutation(trpc.meta.updateCompanyType.mutationOptions());
  const deleteType = useMutation(trpc.meta.deleteCompanyType.mutationOptions());

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: createCompanyTypeSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        if (editingId) {
          await updateType.mutateAsync({
            id: editingId,
            ...value,
          });
        } else {
          await createType.mutateAsync(value);
        }

        await typesQuery.refetch();
        setEditingId(null);
        form.reset();
      } catch (error) {
        console.error("Failed to save company type", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const types: TypeRow[] = typesQuery.data?.data ?? [];

  const handleEdit = (type: TypeRow) => {
    setEditingId(type.id);
    form.setFieldValue("name", type.name);
  };

  const handleDelete = async (id: number) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this company type? This action cannot be undone.",
    );

    if (!shouldDelete) return;

    try {
      await deleteType.mutateAsync({ id });
      if (editingId === id) {
        setEditingId(null);
        form.reset();
      }
      await typesQuery.refetch();
    } catch (error) {
      console.error("Failed to delete company type", error);
    }
  };

  const isMutating =
    isSubmitting ||
    createType.isPending ||
    updateType.isPending ||
    deleteType.isPending;

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Company Types</h2>
            <p className="text-muted-foreground text-sm">
              Create, update, and delete company types (e.g., Carrier, Broker,
              etc.).
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
                description="Name of the company type"
                placeholder="Carrier"
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
                  : "Update type"
                : isMutating
                  ? "Creating..."
                  : "Create type"}
            </Button>
          </div>
        </form>

        {(createType.error ?? updateType.error) && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
            {(createType.error ?? updateType.error)?.message}
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Existing company types</h3>
          <span className="text-muted-foreground text-sm">
            {types.length} total
          </span>
        </div>

        {typesQuery.isLoading ? (
          <p className="text-muted-foreground text-sm">
            Loading company types...
          </p>
        ) : types.length === 0 ? (
          <p className="text-muted-foreground text-sm">No company types yet.</p>
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
                {types.map((type) => (
                  <tr key={type.id} className="[&>td]:py-2 [&>td]:pr-3">
                    <td className="font-semibold">{type.name}</td>
                    <td className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(type)}
                        disabled={isMutating}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(type.id)}
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

        {deleteType.error && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
            {deleteType.error.message}
          </div>
        )}
      </div>
    </div>
  );
}
