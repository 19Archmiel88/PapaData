import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import { ZodError } from "zod";
import { WalidacjeAuth } from "./WalidacjeAuth.js";
import { SerwisAuth } from "./SerwisAuth.js";
import { BladSMTP } from "../../uslugi/Mailer.js";

// odpowiada za mapowanie błędów walidacji na pola
function OdpowiedzWalidacji(err: ZodError) {
  const pola: Record<string, string> = {};
  for (const issue of err.issues) {
    const klucz = issue.path.join(".") || "global";
    if (!pola[klucz]) pola[klucz] = issue.message;
  }
  return { ok: false, kod: "WALIDACJA", pola };
}

// odpowiada za routing Auth
export const RouterAuth: FastifyPluginAsync = async (serwer: FastifyInstance) => {
  serwer.post("/rejestracja", async (req, reply) => {
    try {
      const dane = WalidacjeAuth.Rejestracja.parse(req.body);
      const wynik = await SerwisAuth.Rejestracja(dane.email, dane.haslo);

      if (!wynik.ok) return reply.code(409).send(wynik);
      return reply.send(wynik);
    } catch (err) {
      if (err instanceof ZodError) return reply.code(400).send(OdpowiedzWalidacji(err));
      if (err instanceof BladSMTP) return reply.code(502).send({ ok: false, kod: err.kod, wiadomosc: err.message });

      serwer.log.error(err);
      return reply.code(500).send({ ok: false, kod: "BLAD_SERWERA", wiadomosc: "Wystąpił błąd serwera." });
    }
  });

  serwer.post("/ponow-wyslij-kod", async (req, reply) => {
    try {
      const dane = WalidacjeAuth.PonowWyslijKod.parse(req.body);
      const wynik = await SerwisAuth.PonowWyslijKod(dane.email);

      if (!wynik.ok) return reply.code(400).send(wynik);
      return reply.send(wynik);
    } catch (err) {
      if (err instanceof ZodError) return reply.code(400).send(OdpowiedzWalidacji(err));
      if (err instanceof BladSMTP) return reply.code(502).send({ ok: false, kod: err.kod, wiadomosc: err.message });

      serwer.log.error(err);
      return reply.code(500).send({ ok: false, kod: "BLAD_SERWERA", wiadomosc: "Wystąpił błąd serwera." });
    }
  });

  serwer.post("/weryfikacja-kodu", async (req, reply) => {
    try {
      const dane = WalidacjeAuth.WeryfikacjaKodu.parse(req.body);
      const wynik = await SerwisAuth.WeryfikacjaKodu(dane.email, dane.kod);

      if (!wynik.ok) return reply.code(400).send(wynik);
      return reply.send(wynik);
    } catch (err) {
      if (err instanceof ZodError) return reply.code(400).send(OdpowiedzWalidacji(err));
      serwer.log.error(err);
      return reply.code(500).send({ ok: false, kod: "BLAD_SERWERA", wiadomosc: "Wystąpił błąd serwera." });
    }
  });

  serwer.post("/logowanie", async (req, reply) => {
    try {
      const dane = WalidacjeAuth.Logowanie.parse(req.body);
      const wynik = await SerwisAuth.Logowanie(dane.email, dane.haslo);

      if (!wynik.ok) {
        const status = wynik.kod === "NIEZWERYFIKOWANE" ? 403 : 401;
        return reply.code(status).send(wynik);
      }

      return reply.send(wynik);
    } catch (err) {
      if (err instanceof ZodError) return reply.code(400).send(OdpowiedzWalidacji(err));
      serwer.log.error(err);
      return reply.code(500).send({ ok: false, kod: "BLAD_SERWERA", wiadomosc: "Wystąpił błąd serwera." });
    }
  });
};
