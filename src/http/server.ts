import fastify from "fastify";

const app = fastify();

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('DATABASE_URL:', process.env.DATABASE_URL);

    console.log("Http server running");
  });
