"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Button } from "@fleetio/ui/button";
import { useAppForm } from "@fleetio/ui/hooks";
import { createOrganizationTierSchema } from "@fleetio/validators";

import { useTRPC } from "~/trpc/react";

const defaultValues: {
  code: string;
  label: string;
  description?: string | undefined;
} = {
  code: "",
  label: "",
  description: undefined,
};

export function OrganizationTiersForm() {
  const trpc = useTRPC();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tiersQuery = useQuery(
    trpc.meta.listOrganizationTiers.queryOptions({
      currentPage: 1,
      itemsPerPage: 50,
    }),
  );

  type TierRow = NonNullable<(typeof tiersQuery)["data"]>["data"][number];

  const createTier = useMutation(
    trpc.meta.createOrganizationTier.mutationOptions(),
  );
  const updateTier = useMutation(
    trpc.meta.updateOrganizationTier.mutationOptions(),
  );
  const deleteTier = useMutation(
    trpc.meta.deleteOrganizationTier.mutationOptions(),
  );

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: createOrganizationTierSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        if (editingId) {
          await updateTier.mutateAsync({
            id: editingId,
            ...value,
          });
        } else {
          await createTier.mutateAsync(value);
        }

        await tiersQuery.refetch();
        setEditingId(null);
        form.reset();
      } catch (error) {
        console.error("Failed to save organization tier", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const tiers: TierRow[] = tiersQuery.data?.data ?? [];

  const handleEdit = (tier: TierRow) => {
    setEditingId(tier.id);
    form.setFieldValue("code", tier.code);
    form.setFieldValue("label", tier.label);
    form.setFieldValue("description", tier.description ?? "");
  };

  const handleDelete = async (id: number) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this organization tier? This action cannot be undone.",
    );

    if (!shouldDelete) return;

    try {
      await deleteTier.mutateAsync({ id });
      if (editingId === id) {
        setEditingId(null);
        form.reset();
      }
      await tiersQuery.refetch();
    } catch (error) {
      console.error("Failed to delete organization tier", error);
    }
  };

  const isMutating =
    isSubmitting ||
    createTier.isPending ||
    updateTier.isPending ||
    deleteTier.isPending;

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Organization Tiers
            </h2>
            <p className="text-muted-foreground text-sm">
              Create, update, and delete organization tiers (subscription
              levels).
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
                  placeholder="TIER_FREE"
                />
              )}
            </form.AppField>

            <form.AppField name="label">
              {(field) => (
                <field.Input
                  label="Label"
                  description="Display name for the tier"
                  placeholder="Free Tier"
                />
              )}
            </form.AppField>
          </div>

          <form.AppField name="description">
            {(field) => (
              <field.Textarea
                label="Description"
                description="Optional description"
                placeholder="Organization tier description"
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
                  : "Update tier"
                : isMutating
                  ? "Creating..."
                  : "Create tier"}
            </Button>
          </div>
        </form>

        {(createTier.error ?? updateTier.error) && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
            {(createTier.error ?? updateTier.error)?.message}
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Existing organization tiers</h3>
          <span className="text-muted-foreground text-sm">
            {tiers.length} total
          </span>
        </div>

        {tiersQuery.isLoading ? (
          <p className="text-muted-foreground text-sm">
            Loading organization tiers...
          </p>
        ) : tiers.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No organization tiers yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted-foreground border-b">
                <tr className="[&>th]:py-2 [&>th]:pr-3">
                  <th>Code</th>
                  <th>Label</th>
                  <th>Description</th>
                  <th className="w-0 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tiers.map((tier) => (
                  <tr key={tier.id} className="[&>td]:py-2 [&>td]:pr-3">
                    <td className="font-mono text-xs">{tier.code}</td>
                    <td className="font-semibold">{tier.label}</td>
                    <td className="text-muted-foreground">
                      {tier.description ?? "—"}
                    </td>
                    <td className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(tier)}
                        disabled={isMutating}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(tier.id)}
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

        {deleteTier.error && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
            {deleteTier.error.message}
          </div>
        )}
      </div>
    </div>
  );
}
