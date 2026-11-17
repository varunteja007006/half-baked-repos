"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Button } from "@fleetio/ui/button";
import { useAppForm } from "@fleetio/ui/hooks";
import { createUserDocumentKindSchema } from "@fleetio/validators";

import { useTRPC } from "~/trpc/react";

const defaultValues: {
  name: string;
} = {
  name: "",
};

export function UserDocumentKindsForm() {
  const trpc = useTRPC();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const kindsQuery = useQuery(
    trpc.meta.listUserDocumentKinds.queryOptions({
      currentPage: 1,
      itemsPerPage: 50,
    }),
  );

  type KindRow = NonNullable<(typeof kindsQuery)["data"]>["data"][number];

  const createKind = useMutation(
    trpc.meta.createUserDocumentKind.mutationOptions(),
  );
  const updateKind = useMutation(
    trpc.meta.updateUserDocumentKind.mutationOptions(),
  );
  const deleteKind = useMutation(
    trpc.meta.deleteUserDocumentKind.mutationOptions(),
  );

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: createUserDocumentKindSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        if (editingId) {
          await updateKind.mutateAsync({
            id: editingId,
            ...value,
          });
        } else {
          await createKind.mutateAsync(value);
        }

        await kindsQuery.refetch();
        setEditingId(null);
        form.reset();
      } catch (error) {
        console.error("Failed to save user document kind", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const kinds: KindRow[] = kindsQuery.data?.data ?? [];

  const handleEdit = (kind: KindRow) => {
    setEditingId(kind.id);
    form.setFieldValue("name", kind.name);
  };

  const handleDelete = async (id: number) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this user document kind? This action cannot be undone.",
    );

    if (!shouldDelete) return;

    try {
      await deleteKind.mutateAsync({ id });
      if (editingId === id) {
        setEditingId(null);
        form.reset();
      }
      await kindsQuery.refetch();
    } catch (error) {
      console.error("Failed to delete user document kind", error);
    }
  };

  const isMutating =
    isSubmitting ||
    createKind.isPending ||
    updateKind.isPending ||
    deleteKind.isPending;

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              User Document Kinds
            </h2>
            <p className="text-muted-foreground text-sm">
              Create, update, and delete user document kinds (e.g., ID, License,
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
                description="Name of the document kind"
                placeholder="Driver's License"
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
                  : "Update kind"
                : isMutating
                  ? "Creating..."
                  : "Create kind"}
            </Button>
          </div>
        </form>

        {(createKind.error ?? updateKind.error) && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
            {(createKind.error ?? updateKind.error)?.message}
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Existing user document kinds
          </h3>
          <span className="text-muted-foreground text-sm">
            {kinds.length} total
          </span>
        </div>

        {kindsQuery.isLoading ? (
          <p className="text-muted-foreground text-sm">
            Loading user document kinds...
          </p>
        ) : kinds.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No user document kinds yet.
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
                {kinds.map((kind) => (
                  <tr key={kind.id} className="[&>td]:py-2 [&>td]:pr-3">
                    <td className="font-semibold">{kind.name}</td>
                    <td className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(kind)}
                        disabled={isMutating}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(kind.id)}
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

        {deleteKind.error && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
            {deleteKind.error.message}
          </div>
        )}
      </div>
    </div>
  );
}
