import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";

import App from "./App.jsx";
import ScrollRestoration from "./components/ScrollRestoration";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <Router>
        <ScrollRestoration />
        <App />
      </Router>
    </ThemeProvider>
  </React.StrictMode>
);
