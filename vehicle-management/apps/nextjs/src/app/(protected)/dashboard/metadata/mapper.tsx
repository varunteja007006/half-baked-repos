import { FleetSizesForm } from "~/components/features/metadata/fleet-sizes-form";
import { OrganizationStatusesForm } from "~/components/features/metadata/organization-statuses-form";
import { OrganizationTiersForm } from "~/components/features/metadata/organization-tiers-form";
import { TripFileDocumentTypesForm } from "~/components/features/metadata/trip-file-document-types-form";
import { TripStatusesForm } from "~/components/features/metadata/trip-statuses-form";
import { TripTypesForm } from "~/components/features/metadata/trip-types-form";

export const metadataPageMapper = {
  "org-statuses": {
    label: "Organization Statuses",
    href: "/dashboard/metadata/org-statuses",
    component: <OrganizationStatusesForm />,
    description: "Manage organization statuses used across the platform.",
  },
  "org-tiers": {
    label: "Organization Tiers",
    href: "/dashboard/metadata/org-tiers",
    component: <OrganizationTiersForm />,
    description: "Manage organization tiers (subscription levels).",
  },
  "trip-statuses": {
    label: "Trip Statuses",
    href: "/dashboard/metadata/trip-statuses",
    component: <TripStatusesForm />,
    description: "Manage trip lifecycle statuses and their workflow order.",
  },
  "trip-file-document-types": {
    label: "Trip File Document Types",
    href: "/dashboard/metadata/trip-file-document-types",
    component: <TripFileDocumentTypesForm />,
    description: "Manage document types for trip file attachments.",
  },
  "trip-types": {
    label: "Trip Types",
    href: "/dashboard/metadata/trip-types",
    component: <TripTypesForm />,
    description: "Manage trip types used across trips.",
  },
  "fleet-sizes": {
    label: "Fleet Sizes",
    href: "/dashboard/metadata/fleet-sizes",
    component: <FleetSizesForm />,
    description: "Manage fleet size categories for organizations.",
  },
};
