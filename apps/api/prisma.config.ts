/// <reference types="node" />
import { defineConfig } from "prisma/config";

// odpowiada za konfigurację Prisma CLI (Prisma ORM v7)
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "file:./dev.db"
  }
});
