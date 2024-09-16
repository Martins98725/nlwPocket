import fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";

import { createGoalRoute } from "./routes/create-goal";
import { getPendingGoalsRoute } from "./routes/get-pending-goal";
import { createCompletionRoute } from "./routes/create-completion";
import { getWeekSummaryRoute } from "./routes/get-week-summary";
import fastifyCors from "@fastify/cors";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);


app.register(fastifyCors, {
  origin: "*",
})

app.register(createGoalRoute);
app.register(getPendingGoalsRoute);
app.register(createCompletionRoute);
app.register(getWeekSummaryRoute);


app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("Http server running");
  });
