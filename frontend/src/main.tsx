import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { Auth0Provider } from "./auth/Auth0Provider";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Auth0Provider>
      <App />
    </Auth0Provider>
  </StrictMode>
);
