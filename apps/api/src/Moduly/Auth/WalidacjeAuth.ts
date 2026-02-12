import { z } from "zod";

// odpowiada za walidację payloadów Auth
const EmailSchema = z.string().trim().toLowerCase().email("Niepoprawny adres email");

const HasloRejestracjaSchema = z
  .string()
  .min(8, "Hasło musi mieć min. 8 znaków")
  .max(72, "Hasło może mieć max. 72 znaki")
  .refine((v) => /[A-Za-z]/.test(v), "Hasło musi zawierać przynajmniej jedną literę")
  .refine((v) => /\d/.test(v), "Hasło musi zawierać przynajmniej jedną cyfrę");

const HasloLogowanieSchema = z
  .string()
  .min(1, "Hasło jest wymagane")
  .max(72, "Hasło może mieć max. 72 znaki");

const KodSchema = z.string().trim().regex(/^\d{6}$/, "Kod musi mieć dokładnie 6 cyfr");

export const WalidacjeAuth = {
  Rejestracja: z.object({
    email: EmailSchema,
    haslo: HasloRejestracjaSchema
  }),
  Logowanie: z.object({
    email: EmailSchema,
    haslo: HasloLogowanieSchema
  }),
  WeryfikacjaKodu: z.object({
    email: EmailSchema,
    kod: KodSchema
  }),
  PonowWyslijKod: z.object({
    email: EmailSchema
  })
};
