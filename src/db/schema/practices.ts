import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

// Practice-level accounts — each GP practice is a tenant
export const practices = pgTable("practices", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 200 }).notNull(),
  // Clerk organization ID for linking auth to practice
  clerkOrgId: text("clerk_org_id").unique(),
  ownerClerkUserId: text("owner_clerk_user_id").notNull(),
  // Practice metadata
  address: text("address"),
  gpCount: varchar("gp_count", { length: 10 }),
  subscriptionStatus: varchar("subscription_status", { length: 20 })
    .notNull()
    .default("trial"),
  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
