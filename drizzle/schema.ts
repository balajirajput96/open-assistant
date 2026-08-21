import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const maintenanceRuns = mysqlTable("maintenanceRuns", {
  id: int("id").autoincrement().primaryKey(),
  status: mysqlEnum("status", ["success", "blocked", "error"]).notNull(),
  repositoriesChecked: int("repositoriesChecked").notNull(),
  failedRepositories: int("failedRepositories").notNull(),
  summary: text("summary").notNull(),
  details: text("details").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MaintenanceRun = typeof maintenanceRuns.$inferSelect;
export type InsertMaintenanceRun = typeof maintenanceRuns.$inferInsert;

/**
 * A restart-safe ledger for the explicitly bounded maintenance service.
 * A cycle is reserved before any external request so no run is repeated after a
 * process restart, and completed only after its compact result is persisted.
 */
export const maintenanceCycles = mysqlTable("maintenanceCycles", {
  id: int("id").autoincrement().primaryKey(),
  cycleNumber: int("cycleNumber").notNull().unique(),
  status: mysqlEnum("status", ["started", "completed"]).notNull(),
  resultStatus: mysqlEnum("resultStatus", ["success", "blocked", "error"]),
  summary: text("summary"),
  repositoriesChecked: int("repositoriesChecked"),
  failedRepositories: int("failedRepositories"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type MaintenanceCycle = typeof maintenanceCycles.$inferSelect;
