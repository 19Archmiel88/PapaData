import nodemailer from "nodemailer";
import { Env } from "../konfiguracja/Env.js";

// odpowiada za błąd SMTP o kontrolowanym kodzie
export class BladSMTP extends Error {
  public readonly kod = "SMTP_NIEDOSTEPNE" as const;

  constructor() {
    super("Nie udało się wysłać wiadomości e-mail. Spróbuj ponownie później.");
  }
}

// odpowiada za wysyłkę maili (SMTP)
const transporter = nodemailer.createTransport({
  host: Env.SMTP_HOST,
  port: Env.SMTP_PORT,
  secure: Env.SMTP_SECURE,
  auth: {
    user: Env.SMTP_USER,
    pass: Env.SMTP_PASS
  }
});

export const Mailer = {
  async WyslijKodWeryfikacyjny(email: string, kod: string) {
    const temat = "PapaData — kod weryfikacyjny";
    const tekst =
      `Twój kod weryfikacyjny do PapaData: ${kod}\n\n` +
      `Kod jest ważny przez ${Env.KOD_TTL_MINUTY} minut.\n\n` +
      `Jeśli to nie Ty, zignoruj tę wiadomość.`;

    try {
      await transporter.sendMail({
        from: Env.SMTP_FROM,
        to: email,
        subject: temat,
        text: tekst
      });
    } catch (err) {
      // odpowiada za logowanie szczegółu tylko po stronie backendu
      // (użytkownik dostaje kontrolowany komunikat)
      console.error("[SMTP] sendMail error:", err);
      throw new BladSMTP();
    }
  }
};
