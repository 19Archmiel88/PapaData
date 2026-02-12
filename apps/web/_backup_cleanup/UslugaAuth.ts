// src/components/auth/UslugaAuth.ts
// odpowiada za: cienką warstwę auth dla komponentów (reexport z services/auth)

export {
  // odpowiada za: walidację e-mail
  czyEmailPoprawny,
  // odpowiada za: politykę hasła
  czyHasloPoprawne,
  // odpowiada za: logowanie Google (Firebase + zapis sesji)
  zalogujGoogle,
  // odpowiada za: logowanie Microsoft (Firebase + zapis sesji)
  zalogujMicrosoft,
  // odpowiada za: wylogowanie (Firebase + czyszczenie sesji)
  wyloguj,
  // odpowiada za: odczyt sesji
  pobierzSesje,
  // odpowiada za: czyszczenie sesji
  wyczyscSesje,
} from "../../services/auth";
