import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { LabAppearance } from "./components/LabAppearance";
import "./styles.css";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LabAppearance><App /></LabAppearance>
  </React.StrictMode>,
);
