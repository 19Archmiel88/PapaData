import Fastify from "fastify";
import cors from "@fastify/cors";

// odpowiada za konfigurację serwera HTTP
const serwer = Fastify({
  logger: true
});

// odpowiada za CORS dla frontendu
await serwer.register(cors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
});

// odpowiada za endpoint zdrowia backendu
serwer.get("/health", async () => {
  return { ok: true };
});

// odpowiada za start nasłuchiwania
const PORT = Number(process.env.PORT ?? 3001);
const HOST = process.env.HOST ?? "127.0.0.1";

try {
  await serwer.listen({ port: PORT, host: HOST });
} catch (err) {
  serwer.log.error(err);
  process.exit(1);
}
