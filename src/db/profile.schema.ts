import * as t from "drizzle-orm/pg-core";
import { users } from "./user.schema";
import { experienceLevelEnum, genderEnum } from "./column.helper";

/*

Field: healthCondition, healthGoals, dan allergies akan berbentuk stringified JSON untuk
mempermudah pembentukan dan pemodelan DB. Karena ketiga field ini akan memiliki value
berupa list/array, akan sangat sulit untuk membuat struktur relationship dengan 
usecase seperti ini. Maka dari itu, stringified JSON dengan field yang bernilai TEXT adalah 
pilihan yang tepat.

*/

export const profile = t.pgTable("profiles", {
  userId: t.integer().references((): t.AnyPgColumn => users.id),
  age: t.integer().notNull(),
  gender: genderEnum().notNull(),
  region: t.varchar().notNull(),
  healthCondition: t.text().notNull(),
  healthGoals: t.text().notNull(),
  allergies: t.text().notNull(),
  experienceLevel: experienceLevelEnum().notNull(),
});
