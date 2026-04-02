import { pgTable, text, timestamp, integer, varchar } from "drizzle-orm/pg-core";
import { practices } from "./practices";

// Processing state machine: uploaded → parsing → analysing → enriching → complete | failed
export const uploads = pgTable("uploads", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  practiceId: text("practice_id")
    .notNull()
    .references(() => practices.id, { onDelete: "cascade" }),
  // Vercel Blob reference — UUID key, never user-supplied filename
  blobUrl: text("blob_url").notNull(),
  originalFilename: varchar("original_filename", { length: 255 }).notNull(),
  fileSizeBytes: integer("file_size_bytes"),
  // Processing status FSM
  status: varchar("status", { length: 20 })
    .notNull()
    .default("uploaded"),
  statusMessage: text("status_message"),
  // Data range for deduplication
  dataStartDate: timestamp("data_start_date", { withTimezone: true }),
  dataEndDate: timestamp("data_end_date", { withTimezone: true }),
  // Parsing results
  totalRecords: integer("total_records"),
  validRecords: integer("valid_records"),
  invalidRecords: integer("invalid_records"),
  // Who uploaded
  uploadedByClerkUserId: text("uploaded_by_clerk_user_id").notNull(),
  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});
