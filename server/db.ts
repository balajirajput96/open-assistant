import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertMaintenanceRun,
  InsertUser,
  maintenanceCycles,
  maintenanceRuns,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function recordMaintenanceRun(run: InsertMaintenanceRun): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Maintenance] Database unavailable; run state was not persisted");
    return;
  }

  await db.insert(maintenanceRuns).values(run);
}

export type MaintenanceCycleResult = {
  status: "success" | "blocked" | "error";
  repositoriesChecked: number;
  failedRepositories: number;
  summary: string;
  details: string;
};

/**
 * Reserves one monotonically increasing maintenance cycle before any external
 * health request. A missing database deliberately blocks the worker rather
 * than allowing an unrecorded, non-reproducible cycle to run.
 */
export async function reserveMaintenanceCycle(maxCycles: number): Promise<{ cycleNumber: number } | null> {
  if (!Number.isInteger(maxCycles) || maxCycles < 1) {
    throw new Error("Maintenance cycle limit must be a positive integer");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Maintenance] Database unavailable; no maintenance cycle was reserved");
    return null;
  }

  try {
    return await db.transaction(async (tx) => {
      const [latest] = await tx
        .select({ cycleNumber: maintenanceCycles.cycleNumber })
        .from(maintenanceCycles)
        .orderBy(desc(maintenanceCycles.cycleNumber))
        .limit(1);
      const cycleNumber = (latest?.cycleNumber ?? 0) + 1;

      if (cycleNumber > maxCycles) return null;

      await tx.insert(maintenanceCycles).values({
        cycleNumber,
        status: "started",
      });
      return { cycleNumber };
    });
  } catch (error) {
    console.error("[Maintenance] Failed to reserve maintenance cycle:", error);
    throw error;
  }
}

/**
 * Atomically records the compact result and completes its previously reserved
 * cycle. Both historical run history and the cycle ledger are retained.
 */
export async function completeMaintenanceCycle(
  cycleNumber: number,
  run: MaintenanceCycleResult,
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Maintenance database is unavailable while completing a reserved cycle");
  }

  try {
    await db.transaction(async (tx) => {
      await tx.insert(maintenanceRuns).values({
        status: run.status,
        repositoriesChecked: run.repositoriesChecked,
        failedRepositories: run.failedRepositories,
        summary: run.summary,
        details: run.details,
      });
      await tx
        .update(maintenanceCycles)
        .set({
          status: "completed",
          resultStatus: run.status,
          summary: run.summary,
          repositoriesChecked: run.repositoriesChecked,
          failedRepositories: run.failedRepositories,
          completedAt: new Date(),
        })
        .where(eq(maintenanceCycles.cycleNumber, cycleNumber));
    });
  } catch (error) {
    console.error("[Maintenance] Failed to complete maintenance cycle:", error);
    throw error;
  }
}
