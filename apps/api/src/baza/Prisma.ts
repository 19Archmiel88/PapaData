import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// odpowiada za singleton PrismaClient (SQLite przez driver adapter)
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db"
});

export const Prisma = new PrismaClient({ adapter });
