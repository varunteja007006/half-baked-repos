"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Button } from "@fleetio/ui/button";
import { useAppForm } from "@fleetio/ui/hooks";
import { createPriorityLevelSchema } from "@fleetio/validators";

import { useTRPC } from "~/trpc/react";

const defaultValues: {
  name: string;
  level?: number | undefined;
} = {
  name: "",
  level: undefined,
};

export function PriorityLevelsForm() {
  const trpc = useTRPC();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const levelsQuery = useQuery(
    trpc.meta.listPriorityLevels.queryOptions({
      currentPage: 1,
      itemsPerPage: 50,
    }),
  );

  type LevelRow = NonNullable<(typeof levelsQuery)["data"]>["data"][number];

  const createLevel = useMutation(
    trpc.meta.createPriorityLevel.mutationOptions(),
  );
  const updateLevel = useMutation(
    trpc.meta.updatePriorityLevel.mutationOptions(),
  );
  const deleteLevel = useMutation(
    trpc.meta.deletePriorityLevel.mutationOptions(),
  );

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: createPriorityLevelSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        if (editingId) {
          await updateLevel.mutateAsync({
            id: editingId,
            ...value,
          });
        } else {
          await createLevel.mutateAsync(value);
        }

        await levelsQuery.refetch();
        setEditingId(null);
        form.reset();
      } catch (error) {
        console.error("Failed to save priority level", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const levels: LevelRow[] = levelsQuery.data?.data ?? [];

  const handleEdit = (level: LevelRow) => {
    setEditingId(level.id);
    form.setFieldValue("name", level.name);
    form.setFieldValue("level", level.level ?? undefined);
  };

  const handleDelete = async (id: number) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this priority level? This action cannot be undone.",
    );

    if (!shouldDelete) return;

    try {
      await deleteLevel.mutateAsync({ id });
      if (editingId === id) {
        setEditingId(null);
        form.reset();
      }
      await levelsQuery.refetch();
    } catch (error) {
      console.error("Failed to delete priority level", error);
    }
  };

  const isMutating =
    isSubmitting ||
    createLevel.isPending ||
    updateLevel.isPending ||
    deleteLevel.isPending;

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Priority Levels
            </h2>
            <p className="text-muted-foreground text-sm">
              Create, update, and delete priority levels (e.g., Low, Medium,
              High, etc.).
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
            <form.AppField name="name">
              {(field) => (
                <field.Input
                  label="Name"
                  description="Name of the priority level"
                  placeholder="High Priority"
                />
              )}
            </form.AppField>

            <form.AppField name="level">
              {(field) => (
                <field.Input
                  type="number"
                  label="Level"
                  description="Numeric level for sorting (optional)"
                  placeholder="1"
                />
              )}
            </form.AppField>
          </div>

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
                  : "Update level"
                : isMutating
                  ? "Creating..."
                  : "Create level"}
            </Button>
          </div>
        </form>

        {(createLevel.error ?? updateLevel.error) && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
            {(createLevel.error ?? updateLevel.error)?.message}
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Existing priority levels</h3>
          <span className="text-muted-foreground text-sm">
            {levels.length} total
          </span>
        </div>

        {levelsQuery.isLoading ? (
          <p className="text-muted-foreground text-sm">
            Loading priority levels...
          </p>
        ) : levels.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No priority levels yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted-foreground border-b">
                <tr className="[&>th]:py-2 [&>th]:pr-3">
                  <th>Name</th>
                  <th>Level</th>
                  <th className="w-0 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {levels.map((level) => (
                  <tr key={level.id} className="[&>td]:py-2 [&>td]:pr-3">
                    <td className="font-semibold">{level.name}</td>
                    <td className="text-muted-foreground">
                      {level.level ?? "—"}
                    </td>
                    <td className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(level)}
                        disabled={isMutating}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(level.id)}
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

        {deleteLevel.error && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
            {deleteLevel.error.message}
          </div>
        )}
      </div>
    </div>
  );
}
