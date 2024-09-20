interface CreateGoalRequeste {
  title: string;
  diseredWeeklyFrequency: number;
}

export async function createGoal({
  title,
  diseredWeeklyFrequency,
}: CreateGoalRequeste) {
  await fetch("http://localhost:3333/goals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      diseredWeeklyFrequency,
    }),
  });
}
