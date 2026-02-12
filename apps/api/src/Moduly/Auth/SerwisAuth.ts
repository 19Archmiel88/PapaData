import argon2 from "argon2";
import { Prisma } from "../../baza/Prisma.js";
import { Env } from "../../konfiguracja/Env.js";
import { Mailer } from "../../uslugi/Mailer.js";

// odpowiada za logikę Auth (rejestracja/logowanie/kod)
function LosowyKod6Cyfr(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return String(n);
}

function TerazPlusMinuty(minuty: number): Date {
  return new Date(Date.now() + minuty * 60 * 1000);
}

async function WystawNowyKodIUstawJakoAktywny(uzytkownikId: string) {
  const kod = LosowyKod6Cyfr();
  const kodHash = await argon2.hash(kod, { type: argon2.argon2id });

  await Prisma.kodWeryfikacyjny.updateMany({
    where: { uzytkownikId, wykorzystanyAt: null },
    data: { wykorzystanyAt: new Date() }
  });

  const rekord = await Prisma.kodWeryfikacyjny.create({
    data: {
      uzytkownikId,
      kodHash,
      wygasaAt: TerazPlusMinuty(Env.KOD_TTL_MINUTY)
    }
  });

  return { kod, rekordId: rekord.id };
}

export const SerwisAuth = {
  async Rejestracja(email: string, haslo: string) {
    const istnieje = await Prisma.uzytkownik.findUnique({ where: { email } });

    // jeśli konto już istnieje i jest zweryfikowane -> konflikt
    if (istnieje?.zweryfikowanyAt) {
      return {
        ok: false as const,
        kod: "EMAIL_ZAJETY" as const,
        wiadomosc: "Konto o tym adresie email już istnieje."
      };
    }

    // jeśli konto istnieje, ale jest niezweryfikowane -> recovery: wyślij nowy kod
    if (istnieje && !istnieje.zweryfikowanyAt) {
      const { kod, rekordId } = await WystawNowyKodIUstawJakoAktywny(istnieje.id);

      try {
        await Mailer.WyslijKodWeryfikacyjny(email, kod);
        return { ok: true as const, status: "WYSŁANO_KOD" as const };
      } catch (err) {
        // sprzątanie: unieważnij świeżo utworzony kod, bo mail nie poszedł
        await Prisma.kodWeryfikacyjny.update({
          where: { id: rekordId },
          data: { wykorzystanyAt: new Date() }
        });
        throw err;
      }
    }

    // nowe konto
    const hashHasla = await argon2.hash(haslo, { type: argon2.argon2id });

    const uzytkownik = await Prisma.uzytkownik.create({
      data: { email, hashHasla }
    });

    const { kod, rekordId } = await WystawNowyKodIUstawJakoAktywny(uzytkownik.id);

    try {
      await Mailer.WyslijKodWeryfikacyjny(email, kod);
      return { ok: true as const, status: "WYSŁANO_KOD" as const };
    } catch (err) {
      // sprzątanie: usuń konto i kod, żeby nie zostawić zombie kont po nieudanej wysyłce
      await Prisma.kodWeryfikacyjny.deleteMany({ where: { uzytkownikId: uzytkownik.id } });
      await Prisma.uzytkownik.delete({ where: { id: uzytkownik.id } });
      throw err;
    }
  },

  async PonowWyslijKod(email: string) {
    const uzytkownik = await Prisma.uzytkownik.findUnique({ where: { email } });
    if (!uzytkownik) {
      return {
        ok: false as const,
        kod: "NIE_ZNALEZIONO" as const,
        wiadomosc: "Nie znaleziono konta dla podanego emaila."
      };
    }

    if (uzytkownik.zweryfikowanyAt) {
      return {
        ok: false as const,
        kod: "JUZ_ZWERYFIKOWANE" as const,
        wiadomosc: "Konto jest już zweryfikowane."
      };
    }

    const { kod, rekordId } = await WystawNowyKodIUstawJakoAktywny(uzytkownik.id);

    try {
      await Mailer.WyslijKodWeryfikacyjny(email, kod);
      return { ok: true as const, status: "WYSŁANO_KOD" as const };
    } catch (err) {
      await Prisma.kodWeryfikacyjny.update({
        where: { id: rekordId },
        data: { wykorzystanyAt: new Date() }
      });
      throw err;
    }
  },

  async WeryfikacjaKodu(email: string, kod: string) {
    const uzytkownik = await Prisma.uzytkownik.findUnique({ where: { email } });
    if (!uzytkownik) {
      return { ok: false as const, kod: "NIE_ZNALEZIONO" as const, wiadomosc: "Nie znaleziono konta dla podanego emaila." };
    }

    if (uzytkownik.zweryfikowanyAt) {
      return { ok: true as const, status: "ZWERYFIKOWANO" as const };
    }

    const rekord = await Prisma.kodWeryfikacyjny.findFirst({
      where: { uzytkownikId: uzytkownik.id, wykorzystanyAt: null },
      orderBy: { utworzonyAt: "desc" }
    });

    if (!rekord) {
      return { ok: false as const, kod: "BRAK_KODU" as const, wiadomosc: "Brak aktywnego kodu. Użyj opcji ponownego wysłania." };
    }

    if (rekord.probyNieudane >= Env.MAX_PROB_KODU) {
      return { ok: false as const, kod: "ZABLOKOWANY" as const, wiadomosc: "Przekroczono limit prób kodu. Wyślij nowy kod." };
    }

    if (rekord.wygasaAt.getTime() < Date.now()) {
      await Prisma.kodWeryfikacyjny.update({ where: { id: rekord.id }, data: { wykorzystanyAt: new Date() } });
      return { ok: false as const, kod: "KOD_WYGASL" as const, wiadomosc: "Kod wygasł. Wyślij nowy kod." };
    }

    const poprawny = await argon2.verify(rekord.kodHash, kod);
    if (!poprawny) {
      await Prisma.kodWeryfikacyjny.update({
        where: { id: rekord.id },
        data: { probyNieudane: { increment: 1 } }
      });
      return { ok: false as const, kod: "KOD_BLEDNY" as const, wiadomosc: "Niepoprawny kod." };
    }

    await Prisma.$transaction([
      Prisma.kodWeryfikacyjny.update({ where: { id: rekord.id }, data: { wykorzystanyAt: new Date() } }),
      Prisma.uzytkownik.update({ where: { id: uzytkownik.id }, data: { zweryfikowanyAt: new Date() } })
    ]);

    return { ok: true as const, status: "ZWERYFIKOWANO" as const };
  },

  async Logowanie(email: string, haslo: string) {
    const uzytkownik = await Prisma.uzytkownik.findUnique({ where: { email } });
    if (!uzytkownik) {
      return { ok: false as const, kod: "BLEDNE_DANE" as const, wiadomosc: "Niepoprawny email lub hasło." };
    }

    const poprawne = await argon2.verify(uzytkownik.hashHasla, haslo);
    if (!poprawne) {
      return { ok: false as const, kod: "BLEDNE_DANE" as const, wiadomosc: "Niepoprawny email lub hasło." };
    }

    if (!uzytkownik.zweryfikowanyAt) {
      return { ok: false as const, kod: "NIEZWERYFIKOWANE" as const, wiadomosc: "Konto nie jest zweryfikowane. Wpisz kod z maila." };
    }

    return {
      ok: true as const,
      status: "ZALOGOWANO" as const,
      uzytkownik: { id: uzytkownik.id, email: uzytkownik.email, zweryfikowany: true }
    };
  }
};
