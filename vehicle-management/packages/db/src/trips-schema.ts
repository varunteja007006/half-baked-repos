// schema.ts
import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";
import { AUDIT } from "./common-schema";
import { companies } from "./company-schema";
import { files } from "./files-schema";
import { fuel_types, lane_types, trip_types } from "./meta-schema";
import { organizations } from "./organization-schema";
import { vehicles } from "./vehicles-schema";

// Local, Chennai, Pune
export const routes = pgTable(
  "routes",
  {
    id: serial("id").primaryKey(),

    // Organization/Tenant
    organization_id: integer("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }), // FK -> organizations

    // Client company (nullable - route may not be tied to specific company)
    company_id: integer("company_id").references(() => companies.id, {
      onDelete: "set null",
    }),

    name: varchar("name", { length: 256 }),
    type_id: integer("type_id").references(() => lane_types.id, {
      onDelete: "set null",
    }),
    start_location: varchar("start_location", { length: 256 }),
    end_location: varchar("end_location", { length: 256 }),
    distance_meters: integer("distance_meters"),
    ...AUDIT,
  },
  (table) => [index("routes_organization_id_idx").on(table.organization_id)],
);

export const trips = pgTable(
  "trips",
  {
    id: serial("id").primaryKey(),

    // Organization/Tenant
    organization_id: integer("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }), // FK -> organizations

    // Client company (nullable - trip may not be tied to specific company)
    company_id: integer("company_id").references(() => companies.id, {
      onDelete: "set null",
    }),

    // user-provided TripID (text field)
    trip_ref: varchar("trip_ref", { length: 128 }).notNull(),
    // Date of trip (store as date) and optional timestamped start/end
    trip_date: timestamp("trip_date"), // use date-only if you prefer date()
    planned_start: timestamp("planned_start"),
    planned_end: timestamp("planned_end"),

    // Relationships
    route_id: integer("route_id").references(() => routes.id, {
      onDelete: "set null",
    }),
    type_id: integer("type_id").references(() => trip_types.id, {
      onDelete: "set null",
    }),
    lane_type_id: integer("lane_type_id").references(() => lane_types.id, {
      onDelete: "set null",
    }),
    vehicle_id: integer("vehicle_id").references(() => vehicles.id, {
      onDelete: "set null",
    }),

    // Driver: keep reference + snapshot of name in case user changes
    driver_id: text("driver_id").references(() => user.id, {
      onDelete: "set null",
    }),
    driver_first_name: varchar("driver_first_name", { length: 128 }),
    driver_last_name: varchar("driver_last_name", { length: 128 }),

    // Metadata fields from your list
    touchpoint: text("touchpoint"),
    trip_sheet: boolean("trip_sheet").default(false).notNull(), // checkbox

    // Cost (integer for minor unit; currency text)
    cost_amount: integer("cost_amount"), // store in smallest unit (e.g. paise) or full rupees as per your choice
    cost_currency: varchar("cost_currency", { length: 8 }).default("INR"),

    // optional: an overall status or notes
    notes: text("notes"),
    // audit columns
    ...AUDIT,
  },
  (table) => [
    unique().on(table.organization_id, table.trip_ref),
    index("trips_organization_id_trip_date_idx").on(
      table.organization_id,
      table.trip_date,
    ),
    index("trips_vehicle_id_idx").on(table.vehicle_id),
    index("trips_driver_id_idx").on(table.driver_id),
  ],
);

export const trip_pass_photos = pgTable("trip_pass_photos", {
  id: serial("id").primaryKey(),
  trip_id: integer("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  file_id: integer("file_id")
    .notNull()
    .references(() => files.id, { onDelete: "cascade" }),
  taken_at: timestamp("taken_at"),
  note: text("note"),
  ...AUDIT,
});

export const gps_pings = pgTable(
  "gps_pings",
  {
    id: serial("id").primaryKey(),
    trip_id: integer("trip_id").references(() => trips.id, {
      onDelete: "set null",
    }),
    vehicle_id: integer("vehicle_id").references(() => vehicles.id, {
      onDelete: "set null",
    }),
    latitude: decimal("latitude", { precision: 10, scale: 8 }),
    longitude: decimal("longitude", { precision: 11, scale: 8 }),
    speed_kph: integer("speed_kph"),
    ping_at: timestamp("ping_at").defaultNow().notNull(),
    ...AUDIT,
  },
  (table) => [
    index("gps_pings_vehicle_id_ping_at_idx").on(
      table.vehicle_id,
      table.ping_at,
    ),
    index("gps_pings_trip_id_idx").on(table.trip_id),
  ],
);

export const diesel_logs = pgTable(
  "diesel_logs",
  {
    id: serial("id").primaryKey(),
    vehicle_id: integer("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "cascade" }),
    trip_id: integer("trip_id").references(() => trips.id, {
      onDelete: "set null",
    }),
    liters: integer("liters"),
    cost: integer("cost"),
    odometer: integer("odometer"),
    filled_at: timestamp("filled_at"),
    fuel_type_id: integer("fuel_type_id")
      .notNull()
      .references(() => fuel_types.id, { onDelete: "restrict" }),
    receipt_file_id: integer("receipt_file_id").references(() => files.id, {
      onDelete: "set null",
    }),
    ...AUDIT,
  },
  (table) => [
    index("diesel_logs_vehicle_id_filled_at_idx").on(
      table.vehicle_id,
      table.filled_at,
    ),
  ],
);

export const trip_events = pgTable("trip_events", {
  id: serial("id").primaryKey(),
  trip_id: integer("trip_id").references(() => trips.id, {
    onDelete: "set null",
  }),
  event_type: varchar("event_type", { length: 128 }),
  event_at: timestamp("event_at").defaultNow().notNull(),
  ...AUDIT,
});

export const trip_exports = pgTable("trip_exports", {
  id: serial("id").primaryKey(),
  trip_id: integer("trip_id").references(() => trips.id, {
    onDelete: "set null",
  }),
  exported_by: text("exported_by").references(() => user.id, {
    onDelete: "set null",
  }),
  export_format: varchar("export_format", { length: 64 }),
  file_id: integer("file_id")
    .notNull()
    .references(() => files.id),
  exported_at: timestamp("exported_at").defaultNow(),
  ...AUDIT,
});

export const routesRelations = relations(routes, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [routes.organization_id],
    references: [organizations.id],
  }),
  company: one(companies, {
    fields: [routes.company_id],
    references: [companies.id],
  }),
  laneType: one(lane_types, {
    fields: [routes.type_id],
    references: [lane_types.id],
  }),
  trips: many(trips),
}));

export const tripsRelations = relations(trips, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [trips.organization_id],
    references: [organizations.id],
  }),
  company: one(companies, {
    fields: [trips.company_id],
    references: [companies.id],
  }),
  route: one(routes, {
    fields: [trips.route_id],
    references: [routes.id],
  }),
  tripType: one(trip_types, {
    fields: [trips.type_id],
    references: [trip_types.id],
  }),
  laneType: one(lane_types, {
    fields: [trips.lane_type_id],
    references: [lane_types.id],
  }),
  vehicle: one(vehicles, {
    fields: [trips.vehicle_id],
    references: [vehicles.id],
  }),
  driver: one(user, {
    fields: [trips.driver_id],
    references: [user.id],
  }),
  passPhotos: many(trip_pass_photos),
  gpsPings: many(gps_pings),
  dieselLogs: many(diesel_logs),
  events: many(trip_events),
  exports: many(trip_exports),
}));

export const tripPassPhotosRelations = relations(
  trip_pass_photos,
  ({ one }) => ({
    trip: one(trips, {
      fields: [trip_pass_photos.trip_id],
      references: [trips.id],
    }),
    file: one(files, {
      fields: [trip_pass_photos.file_id],
      references: [files.id],
    }),
  }),
);

export const gpsPingsRelations = relations(gps_pings, ({ one }) => ({
  trip: one(trips, {
    fields: [gps_pings.trip_id],
    references: [trips.id],
  }),
  vehicle: one(vehicles, {
    fields: [gps_pings.vehicle_id],
    references: [vehicles.id],
  }),
}));

export const dieselLogsRelations = relations(diesel_logs, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [diesel_logs.vehicle_id],
    references: [vehicles.id],
  }),
  trip: one(trips, {
    fields: [diesel_logs.trip_id],
    references: [trips.id],
  }),
  receiptFile: one(files, {
    fields: [diesel_logs.receipt_file_id],
    references: [files.id],
  }),
}));

export const tripEventsRelations = relations(trip_events, ({ one }) => ({
  trip: one(trips, {
    fields: [trip_events.trip_id],
    references: [trips.id],
  }),
}));

export const tripExportsRelations = relations(trip_exports, ({ one }) => ({
  trip: one(trips, {
    fields: [trip_exports.trip_id],
    references: [trips.id],
  }),
  file: one(files, {
    fields: [trip_exports.file_id],
    references: [files.id],
  }),
  exportedByUser: one(user, {
    fields: [trip_exports.exported_by],
    references: [user.id],
  }),
}));
