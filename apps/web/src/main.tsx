import React from "react";
import ReactDOM from "react-dom/client";
import { Aplikacja } from "./Aplikacja.tsx";
import "./index.css";

// odpowiada za bootstrap aplikacji web
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Aplikacja />
  </React.StrictMode>
);
