// schema.ts
import { relations } from "drizzle-orm";
import {
  bigint,
  index,
  integer,
  pgTable,
  serial,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

import { AUDIT } from "./common-schema";
import { files } from "./files-schema";
import {
  fleet_sizes,
  vehicle_document_kinds,
  vehicle_types,
} from "./meta-schema";
import { organizations } from "./organization-schema";

export const vehicle_manufacturers = pgTable("vehicle_manufacturers", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 256 }).notNull(),
  country: varchar("country", { length: 128 }),
  ...AUDIT,
});

export const vehicle_models = pgTable("vehicle_models", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  manufacturer_id: integer("manufacturer_id")
    .notNull()
    .references(() => vehicle_manufacturers.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 256 }).notNull(),
  variant: varchar("variant", { length: 128 }),
  release_year: integer("release_year"),
  ...AUDIT,
});

export const vehicles = pgTable(
  "vehicles",
  {
    id: serial("id").primaryKey(),

    // Organization/Tenant
    organization_id: integer("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }), // FK -> organizations

    // NEW / renamed
    vehicle_no: varchar("vehicle_no", { length: 64 }).notNull(), // required registration/plate
    chassis_no: varchar("chassis_no", { length: 128 }),
    engine_no: varchar("engine_no", { length: 128 }),

    // existing relations made explicit
    model_id: integer("model_id").references(() => vehicle_models.id, {
      onDelete: "set null",
    }),

    // fleet size FK -> fleet_sizes
    fleet_size_id: integer("fleet_size_id").references(() => fleet_sizes.id, {
      onDelete: "set null",
    }),

    mileage: bigint("mileage", { mode: "number" }), // use bigint to support high mileage vehicles
    insurance_no: varchar("insurance_no", { length: 128 }),
    vin: varchar("vin", { length: 128 }),

    vehicle_type_id: integer("vehicle_type_id").references(
      () => vehicle_types.id,
      {
        onDelete: "set null",
      },
    ),
    capacity: integer("capacity"),
    ...AUDIT,
  },
  (table) => [
    unique().on(table.organization_id, table.vehicle_no),
    index("vehicles_organization_id_idx").on(table.organization_id),
  ],
);

export const vehicle_docs = pgTable(
  "vehicle_docs",
  {
    id: serial("id").primaryKey(),
    vehicle_id: integer("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "cascade" }),
    doc_kind_id: integer("doc_kind_id")
      .notNull()
      .references(() => vehicle_document_kinds.id, { onDelete: "restrict" }),
    file_id: integer("file_id").references(() => files.id, {
      onDelete: "set null",
    }),
    valid_from: timestamp("valid_from"),
    valid_to: timestamp("valid_to"),
    expiry_date: timestamp("expiry_date"),
    ...AUDIT,
  },
  (table) => [
    index("vehicle_docs_vehicle_id_expiry_date_idx").on(
      table.vehicle_id,
      table.expiry_date,
    ),
  ],
);

export const vehicleManufacturersRelations = relations(
  vehicle_manufacturers,
  ({ many }) => ({
    models: many(vehicle_models),
    vehicles: many(vehicles),
  }),
);

export const vehicleModelsRelations = relations(
  vehicle_models,
  ({ one, many }) => ({
    manufacturer: one(vehicle_manufacturers, {
      fields: [vehicle_models.manufacturer_id],
      references: [vehicle_manufacturers.id],
    }),
    vehicles: many(vehicles),
  }),
);

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [vehicles.organization_id],
    references: [organizations.id],
  }),
  model: one(vehicle_models, {
    fields: [vehicles.model_id],
    references: [vehicle_models.id],
  }),
  fleetSize: one(fleet_sizes, {
    fields: [vehicles.fleet_size_id],
    references: [fleet_sizes.id],
  }),
  vehicleType: one(vehicle_types, {
    fields: [vehicles.vehicle_type_id],
    references: [vehicle_types.id],
  }),
  documents: many(vehicle_docs),
}));

export const vehicleDocsRelations = relations(vehicle_docs, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [vehicle_docs.vehicle_id],
    references: [vehicles.id],
  }),
  docKind: one(vehicle_document_kinds, {
    fields: [vehicle_docs.doc_kind_id],
    references: [vehicle_document_kinds.id],
  }),
  file: one(files, {
    fields: [vehicle_docs.file_id],
    references: [files.id],
  }),
}));
