import { z } from "zod";

// odpowiada za walidację i udostępnienie konfiguracji środowiska
const EnvSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  HOST: z.string().min(1).default("127.0.0.1"),

  DATABASE_URL: z.string().min(1),

  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535),
  SMTP_SECURE: z.coerce.boolean().default(true),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  SMTP_FROM: z.string().min(1),

  KOD_TTL_MINUTY: z.coerce.number().int().min(1).max(120).default(10),
  MAX_PROB_KODU: z.coerce.number().int().min(1).max(20).default(5)
});

export const Env = EnvSchema.parse({
  PORT: process.env.PORT,
  HOST: process.env.HOST,
  DATABASE_URL: process.env.DATABASE_URL,

  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_SECURE: process.env.SMTP_SECURE,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM,

  KOD_TTL_MINUTY: process.env.KOD_TTL_MINUTY,
  MAX_PROB_KODU: process.env.MAX_PROB_KODU
});
