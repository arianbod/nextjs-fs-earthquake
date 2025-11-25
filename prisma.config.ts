import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  engine: "classic",
  datasource: {
    url: env("POSTGRES_PRISMA_URL"), // Neon pooled connection
    directUrl: env("POSTGRES_URL_NON_POOLING"), // Neon direct connection (for migrations)
  },
});
