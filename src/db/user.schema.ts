import * as t from "drizzle-orm/pg-core";
import { roleEnum, timestamps } from "./column.helper";

export const users = t.pgTable(
  "users",
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    username: t.varchar({ length: 250 }).notNull(),
    name: t.varchar({ length: 250 }).notNull(),
    email: t.varchar({ length: 250 }).notNull(),
    role: roleEnum().default("user"),
    city: t.varchar({ length: 250 }).notNull(),
    password: t.varchar({ length: 250 }).notNull(),
    ...timestamps,
  },
  (table) => [t.uniqueIndex("email_idx").on(table.email)]
);
