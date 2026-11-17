"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@fleetio/ui/button";
import { useAppForm } from "@fleetio/ui/hooks";
import { SelectItem } from "@fleetio/ui/select";
import { organizationInsertSchema } from "@fleetio/validators";

import { useTRPC } from "~/trpc/react";

export function OrganizationRegistrationForm() {
  const router = useRouter();
  const trpc = useTRPC();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createOrganization = useMutation(
    trpc.organization.create.mutationOptions(),
  );

  const form = useAppForm({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      gstin: "",
      pan: "",
      incorporation_name: "",
      incorporation_address: "",
      state_code: "",
      hsn_code: "",
      logoUrl: "",
      tierId: 1, // Default tier
      statusId: 1, // Default active status
      ownerId: "XXXXX",
    },
    validators: {
      onSubmit: organizationInsertSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      console.log(value);
      try {
        //   await createOrganization.mutateAsync({
        //     ...value,
        //     // Remove empty optional fields
        //     description: value.description || undefined,
        //     gstin: value.gstin || undefined,
        //     pan: value.pan || undefined,
        //     incorporation_name: value.incorporation_name || undefined,
        //     incorporation_address: value.incorporation_address || undefined,
        //     state_code: value.state_code || undefined,
        //     hsn_code: value.hsn_code || undefined,
        //     logoUrl: value.logoUrl || undefined,
        // });
      } catch (error) {
        console.error("Failed to create organization:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  console.log(form.getAllErrors());
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Register Organization
        </h2>
        <p className="text-muted-foreground">
          Create a new organization to manage your fleet
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        {/* Basic Information */}
        <div className="space-y-4 rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Basic Information</h3>

          <form.AppField name="name">
            {(field) => (
              <field.Input
                label="Organization Name"
                description="The full name of your organization"
              />
            )}
          </form.AppField>

          <form.AppField name="slug">
            {(field) => (
              <field.Input
                label="Slug"
                description="A unique identifier for your organization (lowercase, hyphens allowed)"
              />
            )}
          </form.AppField>

          <form.AppField name="description">
            {(field) => (
              <field.Textarea
                label="Description"
                description="Brief description of your organization (optional)"
              />
            )}
          </form.AppField>

          <form.AppField name="logoUrl">
            {(field) => (
              <field.Input
                label="Logo URL"
                description="URL to your organization's logo (optional)"
              />
            )}
          </form.AppField>
        </div>

        {/* Company Registration Details */}
        <div className="space-y-4 rounded-lg border p-6">
          <h3 className="text-lg font-semibold">
            Company Registration Details (Optional)
          </h3>

          <form.AppField name="incorporation_name">
            {(field) => (
              <field.Input
                label="Legal Name"
                description="The legal name of incorporation"
              />
            )}
          </form.AppField>

          <form.AppField name="incorporation_address">
            {(field) => (
              <field.Textarea
                label="Registered Address"
                description="The registered address of your company"
              />
            )}
          </form.AppField>

          <div className="grid gap-4 sm:grid-cols-2">
            <form.AppField name="gstin">
              {(field) => (
                <field.Input
                  label="GSTIN"
                  description="GST Identification Number"
                />
              )}
            </form.AppField>

            <form.AppField name="pan">
              {(field) => (
                <field.Input
                  label="PAN"
                  description="Permanent Account Number"
                />
              )}
            </form.AppField>

            <form.AppField name="state_code">
              {(field) => (
                <field.Input label="State Code" description="State code" />
              )}
            </form.AppField>

            <form.AppField name="hsn_code">
              {(field) => (
                <field.Input
                  label="HSN Code"
                  description="Harmonized System Nomenclature code"
                />
              )}
            </form.AppField>
          </div>
        </div>

        {/* Tier and Status Selection */}
        <div className="space-y-4 rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Organization Settings</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <form.AppField name="tierId">
              {(field) => (
                <field.Select
                  label="Tier"
                  description="Select organization tier"
                >
                  <SelectItem value="1">Free</SelectItem>
                  <SelectItem value="2">Basic</SelectItem>
                  <SelectItem value="3">Premium</SelectItem>
                  <SelectItem value="4">Enterprise</SelectItem>
                </field.Select>
              )}
            </form.AppField>

            <form.AppField name="statusId">
              {(field) => (
                <field.Select
                  label="Status"
                  description="Initial status of organization"
                >
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="2">Inactive</SelectItem>
                  <SelectItem value="3">Suspended</SelectItem>
                </field.Select>
              )}
            </form.AppField>
          </div>
        </div>

        {/* Error Display */}
        {createOrganization.error && (
          <div className="border-destructive bg-destructive/10 rounded-lg border p-4">
            <p className="text-destructive text-sm">
              {createOrganization.error.message}
            </p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Organization"}
          </Button>
        </div>
      </form>
    </div>
  );
}
