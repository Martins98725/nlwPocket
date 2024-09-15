import dayjs from "dayjs";
import { db } from "../db";
import { goalCompletions, goals } from "../db/schema";
import { and, count, eq, gte, lte, sql } from "drizzle-orm";

export async function getWeekPendingGoals() {
  const lastDayOfWeek = dayjs().endOf("week").toDate();
  const firstDayOfWeek = dayjs().startOf("week").toDate();
  //const currentweek = dayjs().week();

  const goalCreatedUpToWeek = db.$with("goals_created_up_week").as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
        createdAt: goals.createdAt,
      })
      .from(goals)
      .where(lte(goals.createdAt, lastDayOfWeek))
  );

  const goalsCompletionCounts = db.$with("goal_complition_counts").as(
    db
      .select({
        goalId: goalCompletions.goalId,
        completionCount: count(goalCompletions.id).as("completionCount"),
      })
      .from(goalCompletions)
      .where(
        and(
          gte(goalCompletions.createdAt, firstDayOfWeek),
          lte(goalCompletions.createdAt, lastDayOfWeek)
        )
      )
      .groupBy(goalCompletions.goalId)
  );

  const pedingGoals = await db
    .with(goalCreatedUpToWeek, goalsCompletionCounts)
    .select({
      id: goalCreatedUpToWeek.id,
      title: goalCreatedUpToWeek.title,
      desiredWeeklyFrequency: goalCreatedUpToWeek.desiredWeeklyFrequency,
      completionCount: sql`
        coalesce(${goalsCompletionCounts.completionCount}, 0)
      `.mapWith(Number),
    })
    .from(goalCreatedUpToWeek)
    .leftJoin(
      goalsCompletionCounts,
      eq(goalsCompletionCounts.goalId, goalCreatedUpToWeek.id)
    );

  return { pedingGoals };
}
