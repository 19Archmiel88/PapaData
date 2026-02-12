import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";
import { pobierzPreferowanyMotyw, zastosujMotywDokumentu } from "./app/motyw/motyw";
import { GranicaBledow } from "./components/system/GranicaBledow";
import { AuthProvider } from "./context/AuthProvider";
import { ModalProvider } from "./context/ModalProvider";
import { UIProvider } from "./context/UIProvider";
import { zastosujZgodeZeStorage } from "./utils/consent-mode";
import { captureUtmFromSearch } from "./utils/utm";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./index.css";

// odpowiada za zastosowanie motywu przed montazem React (bez flasha)
zastosujMotywDokumentu(pobierzPreferowanyMotyw());
// odpowiada za inicjalizacje consent mode i odczyt zapisanej zgody
zastosujZgodeZeStorage();
// odpowiada za zapis UTM z aktualnego adresu
captureUtmFromSearch(window.location.search);

// odpowiada za bootstrap aplikacji web
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UIProvider>
      <AuthProvider>
        <ModalProvider>
          <GranicaBledow>
            <App />
          </GranicaBledow>
        </ModalProvider>
      </AuthProvider>
    </UIProvider>
  </React.StrictMode>
);
