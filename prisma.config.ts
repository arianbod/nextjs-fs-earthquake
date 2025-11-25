import "dotenv/config";
import { defineConfig } from "prisma/config";

// Use POSTGRES_URL_NON_POOLING (Vercel/Neon) or fall back to DIRECT_URL (local)
const directUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.DIRECT_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  engine: "classic",
  datasource: {
    url: process.env.DATABASE_URL, // Pooled connection
    directUrl: directUrl, // Direct connection for migrations
  },
});
