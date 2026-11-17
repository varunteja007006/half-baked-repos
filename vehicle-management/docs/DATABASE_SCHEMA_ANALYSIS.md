# Fleetio Database Schema

---

## Table Reference Guide

### Core Tables

| Table             | Purpose                  | Key Fields                                                                               |
| ----------------- | ------------------------ | ---------------------------------------------------------------------------------------- |
| **organizations** | Company/tenant workspace | organization_id, owner_id, name, tier_id, max_users, max_vehicles                        |
| **vehicles**      | Fleet vehicles           | vehicle_id, organization_id, vehicle_no, mileage, vehicle_type_id, manufacturer_id       |
| **trips**         | Trip records             | trip_id, organization_id, vehicle_id, driver_id, trip_ref, trip_date, status             |
| **routes**        | Trip routes              | route_id, organization_id, start_location, end_location, distance_meters                 |
| **companies**     | Client companies         | company_id, organization_id, name, gstin, type_id                                        |
| **payments**      | Payment transactions     | payment_id, organization_id, trip_id, amount, currency, status_id, transaction_reference |

### Tracking & Documentation

| Table                | Purpose                     | Key Fields                                                                   |
| -------------------- | --------------------------- | ---------------------------------------------------------------------------- |
| **gps_pings**        | Real-time location tracking | ping_id, trip_id, vehicle_id, latitude, longitude, speed_kph, ping_at        |
| **diesel_logs**      | Fuel consumption records    | log_id, vehicle_id, trip_id, liters, cost, odometer, fuel_type_id, filled_at |
| **vehicle_docs**     | Vehicle documents           | doc_id, vehicle_id, doc_kind_id, file_id, expiry_date, valid_from, valid_to  |
| **user_docs**        | User/driver documents       | doc_id, user_id, doc_kind_id, file_id, expiry_date, valid_to                 |
| **trip_pass_photos** | Trip photos/evidence        | photo_id, trip_id, file_id, taken_at                                         |
| **trip_events**      | Trip state changes          | event_id, trip_id, event_type, event_at                                      |

### User & Access Control

| Table                         | Purpose                   | Key Fields                                                             |
| ----------------------------- | ------------------------- | ---------------------------------------------------------------------- |
| **app_users**                 | User profiles             | user_id, phone, avatar_url, driver_license_no, emp_id                  |
| **user_bank_details**         | Bank information          | id, user_id, account_holder, account_number, ifsc, bank_name           |
| **organization_members**      | User-organization mapping | member_id, organization_id, user_id, designation, joined_at, is_active |
| **organization_member_roles** | Role assignment           | id, organization_member_id, role_id                                    |

### Lookup/Configuration

| Table                     | Purpose              | Key Fields                                          |
| ------------------------- | -------------------- | --------------------------------------------------- |
| **trip_statuses**         | Trip workflow states | DRAFT → ASSIGNED → IN_TRANSIT → COMPLETED/CANCELLED |
| **vehicle_types**         | Vehicle categories   | Car, Truck, Van, Bike, etc.                         |
| **fuel_types**            | Fuel options         | Petrol, Diesel, CNG, Electric, etc.                 |
| **vehicle_manufacturers** | Brand information    | name, country                                       |
| **company_types**         | Client company types | Retail, Logistics, e-Commerce, etc.                 |
| **payment_methods**       | Payment options      | Credit Card, Bank Transfer, UPI, etc.               |

---

## Field Usage by Purpose

### Identification & References

- **organization_id**: Multi-tenant isolation (every table)
- **vehicle_no**: Vehicle registration number (unique per org)
- **trip_ref**: Trip reference code (unique per org)
- **gstin**: Tax registration (companies)
- **vin**: Vehicle identification number

### Geospatial Data

- **latitude/longitude** (DECIMAL): GPS coordinates with 8 decimal places (~1.1mm precision)
- **start_location/end_location**: Route origin/destination
- **distance_meters**: Route distance

### Financial Data

- **amount**: Payment value
- **currency**: Currency code (default: INR)
- **cost**: Transaction cost
- **liters**: Fuel quantity
- **transaction_reference**: Bank/processor ID for reconciliation

### Temporal Data

- **created_at**: Record creation timestamp (auto)
- **updated_at**: Last update timestamp (auto-updating)
- **deleted_at**: Soft delete marker
- **trip_date**: Trip occurrence date
- **filled_at**: Fuel fill timestamp
- **ping_at**: GPS ping timestamp
- **expiry_date**: Document expiry date

### Status & Workflow

- **status_id**: Payment/approval state
- **is_active**: Member active status
- **trip_sheet**: Boolean trip documentation flag
- **trip_ref**: Unique trip identifier

### Document Management

- **file_id**: Reference to files table
- **doc_kind_id**: Document type
- **valid_from/valid_to**: Document validity period

**Last Updated**: December 20, 2025  
**Project Status**: 🎉 COMPLETE
