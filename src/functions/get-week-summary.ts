import { and, count, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../db";
import { goalCompletions, goals } from "../db/schema";
import dayjs from "dayjs";
import { title } from "process";

export async function getWeekSummary() {
  const lastDayOfWeek = dayjs().endOf("week").toDate();
  const firstDayOfWeek = dayjs().startOf("week").toDate();

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

  const goalsCompletedWeek = db.$with("goal_complited_week").as(
    db
      .select({
        id: goalCompletions.id,
        title: goals.title,
        completedAt: goalCompletions.createdAt,
        completedAtDate: sql`
        date(${goalCompletions.createdAt})
        `.as("completedAtDate"),
      })
      .from(goalCompletions)
      .innerJoin(goals, eq(goals.id, goalCompletions.goalId))
      .where(
        and(
          gte(goalCompletions.createdAt, firstDayOfWeek),
          lte(goalCompletions.createdAt, lastDayOfWeek)
        )
      )
  );

  const goalsCompletedByWeekDay = db.$with("goals_coplited_by_week_day").as(
    db
      .select({
        completedAtDate: goalsCompletedWeek.completedAtDate,
        completions: sql`
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id', ${goalsCompletedWeek.id}, 
                    'title', ${goalsCompletedWeek.title}, 
                    'completedAt', ${goalsCompletedWeek.completedAt}
                )
            )`.as("completions"),
      })
      .from(goalsCompletedWeek)
      .groupBy(goalsCompletedWeek.completedAtDate)
  );

  const result = await db
    .with(goalCreatedUpToWeek, goalsCompletedWeek, goalsCompletedByWeekDay)
    .select({
      completed: sql`(select count(*) from ${goalsCompletedWeek})`.mapWith(
        Number
      ),
      total:
        sql`(select sum(${goalCreatedUpToWeek.desiredWeeklyFrequency}) from ${goalCreatedUpToWeek})`.mapWith(
          Number
        ),
      goalsPerDate: sql`    
        JSON_OBJECT_AGG(
            ${goalsCompletedByWeekDay.completedAtDate},
            ${goalsCompletedByWeekDay.completions}
        )
      `,
    })
    .from(goalsCompletedByWeekDay);

  return {
    summary: result,
  };
}
