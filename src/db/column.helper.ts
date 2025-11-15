import * as t from "drizzle-orm/pg-core";

export const timestamps = {
  updated_at: t.timestamp(),
  created_at: t.timestamp().defaultNow().notNull(),
};

export const roleEnum = t.pgEnum("roles", ["user", "planter"]);

export const experienceLevelEnum = t.pgEnum("experience_level", [
  "beginner",
  "intermediate",
  "expert",
]);

export const genderEnum = t.pgEnum("gender", ["male", "female"]);
