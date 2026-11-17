"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Button } from "@fleetio/ui/button";
import { useAppForm } from "@fleetio/ui/hooks";
import { createTripFileDocumentTypeSchema } from "@fleetio/validators";

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

export function TripFileDocumentTypesForm() {
  const trpc = useTRPC();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const documentTypesQuery = useQuery(
    trpc.meta.listTripFileDocumentTypes.queryOptions({
      currentPage: 1,
      itemsPerPage: 50,
    }),
  );

  type DocumentTypeRow = NonNullable<
    (typeof documentTypesQuery)["data"]
  >["data"][number];

  const createDocumentType = useMutation(
    trpc.meta.createTripFileDocumentType.mutationOptions(),
  );
  const updateDocumentType = useMutation(
    trpc.meta.updateTripFileDocumentType.mutationOptions(),
  );
  const deleteDocumentType = useMutation(
    trpc.meta.deleteTripFileDocumentType.mutationOptions(),
  );

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: createTripFileDocumentTypeSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        if (editingId) {
          await updateDocumentType.mutateAsync({
            id: editingId,
            ...value,
          });
        } else {
          await createDocumentType.mutateAsync({
            ...value,
          });
        }

        await documentTypesQuery.refetch();
        setEditingId(null);
        form.reset();
      } catch (error) {
        console.error("Failed to save trip file document type", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const documentTypes: DocumentTypeRow[] = documentTypesQuery.data?.data ?? [];

  const handleEdit = (documentType: DocumentTypeRow) => {
    setEditingId(documentType.id);
    form.setFieldValue("code", documentType.code);
    form.setFieldValue("name", documentType.name);
    form.setFieldValue("description", documentType.description ?? "");
  };

  const handleDelete = async (id: number) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this trip file document type? This action cannot be undone.",
    );

    if (!shouldDelete) return;

    try {
      await deleteDocumentType.mutateAsync({ id });
      if (editingId === id) {
        setEditingId(null);
        form.reset();
      }
      await documentTypesQuery.refetch();
    } catch (error) {
      console.error("Failed to delete trip file document type", error);
    }
  };

  const isMutating =
    isSubmitting ||
    createDocumentType.isPending ||
    updateDocumentType.isPending ||
    deleteDocumentType.isPending;

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Trip File Document Types
            </h2>
            <p className="text-muted-foreground text-sm">
              Create, update, and delete trip file document types.
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
                  placeholder="invoice"
                />
              )}
            </form.AppField>

            <form.AppField name="name">
              {(field) => (
                <field.Input
                  label="Name"
                  description="Human-friendly name"
                  placeholder="Invoice"
                />
              )}
            </form.AppField>
          </div>

          <form.AppField name="description">
            {(field) => (
              <field.Textarea
                label="Description"
                description="Optional description"
                placeholder="Document type description"
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
                  : "Update document type"
                : isMutating
                  ? "Creating..."
                  : "Create document type"}
            </Button>
          </div>
        </form>

        {(createDocumentType.error ?? updateDocumentType.error) && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
            {(createDocumentType.error ?? updateDocumentType.error)?.message}
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Existing document types</h3>
          <span className="text-muted-foreground text-sm">
            {documentTypes.length} total
          </span>
        </div>

        {documentTypesQuery.isLoading ? (
          <p className="text-muted-foreground text-sm">
            Loading document types...
          </p>
        ) : documentTypes.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No document types yet.
          </p>
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
                {documentTypes.map((documentType) => (
                  <tr key={documentType.id} className="[&>td]:py-2 [&>td]:pr-3">
                    <td className="font-mono text-xs">{documentType.code}</td>
                    <td>{documentType.name}</td>
                    <td className="text-muted-foreground">
                      {documentType.description ?? "—"}
                    </td>
                    <td className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(documentType)}
                        disabled={isMutating}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(documentType.id)}
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

        {deleteDocumentType.error && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
            {deleteDocumentType.error.message}
          </div>
        )}
      </div>
    </div>
  );
}
