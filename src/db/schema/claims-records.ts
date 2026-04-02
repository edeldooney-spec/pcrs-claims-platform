import { pgTable, text, timestamp, numeric, varchar, integer, date } from "drizzle-orm/pg-core";
import { practices } from "./practices";
import { uploads } from "./uploads";

// Individual claim records parsed from PCRS exports
// Field names are preliminary — will be finalised after reviewing sample PCRS data
export const claimsRecords = pgTable("claims_records", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  practiceId: text("practice_id")
    .notNull()
    .references(() => practices.id, { onDelete: "cascade" }),
  uploadId: text("upload_id")
    .notNull()
    .references(() => uploads.id, { onDelete: "cascade" }),
  // Claim identifiers (TBD pending sample data)
  claimCode: varchar("claim_code", { length: 50 }),
  claimCategory: varchar("claim_category", { length: 100 }),
  claimDate: date("claim_date"),
  // Clinician identifier — conditional on PCRS export containing this
  clinicianId: varchar("clinician_id", { length: 100 }),
  // Financial
  claimAmount: numeric("claim_amount", { precision: 10, scale: 2 }),
  // Patient reference (hashed/anonymised for storage)
  patientRef: varchar("patient_ref", { length: 100 }),
  // Raw row data for debugging/audit
  rawData: text("raw_data"),
  rowNumber: integer("row_number"),
  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
