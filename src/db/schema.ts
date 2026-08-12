import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// users
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  // Nullable: a user created by signing in with Microsoft (see src/auth.ts)
  // never sets a local password -- Microsoft already handled that. Only
  // users who registered with email+password have one.
  hashedPassword: text("hashed_password"),
  // Always true for Microsoft sign-ins (Microsoft already verified the
  // identity); for email+password users, true only after they click the
  // verification link.
  isVerified: boolean("is_verified").notNull().default(false),
  // Nullable: only set while an email-verification or password-reset flow is
  // pending. Cleared once the flow completes.
  verificationToken: text("verification_token"),
  resetToken: text("reset_token"),
  resetTokenExpires: timestamp("reset_token_expires"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  lists: many(lists),
}));

// ---------------------------------------------------------------------------
// lists
// ---------------------------------------------------------------------------

export const lists = pgTable("lists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull().default("#dc2626"),
  description: text("description"),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  // Not auto-updated by the database. Every Server Action that updates a
  // list must set this itself (e.g. `updatedAt: new Date()`) -- Drizzle will
  // NOT bump it for you on UPDATE.
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const listsRelations = relations(lists, ({ one, many }) => ({
  user: one(users, { fields: [lists.userId], references: [users.id] }),
  tasks: many(tasks),
}));

// ---------------------------------------------------------------------------
// tasks
// ---------------------------------------------------------------------------

export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  listId: integer("list_id")
    .notNull()
    .references(() => lists.id, { onDelete: "cascade" }),
  priority: priorityEnum("priority").notNull().default("medium"),
  // Stored as a plain "YYYY-MM-DD" string (mode: "string"), not a JS Date.
  // This avoids timezone/Date-object headaches for a simple due date.
  dueDate: date("due_date", { mode: "string" }),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  // Same rule as lists.updatedAt: set this by hand in every update action.
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tasksRelations = relations(tasks, ({ one }) => ({
  list: one(lists, { fields: [tasks.listId], references: [lists.id] }),
}));
