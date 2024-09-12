import { db } from ".";
import { goalCompletions, goals } from "./schema";

async function seed() {
  await db.delete(goalCompletions);
  await db.delete(goals);

  await db.insert(goals).values([
    { title: "Acordar", desiredWeeklyFrequency: 5 },
    { title: "Me exercitar", desiredWeeklyFrequency: 2 },
    { title: "Meditar", desiredWeeklyFrequency: 4 },
  ]);
}

seed();
