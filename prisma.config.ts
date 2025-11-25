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
    url: env("DATABASE_URL"), // Pooled connection (works everywhere)
    directUrl: env("POSTGRES_URL_NON_POOLING"), // Direct connection for migrations
  },
});
