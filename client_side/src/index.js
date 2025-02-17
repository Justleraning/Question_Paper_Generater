import React from "react";
import ReactDOM from "react-dom/client"; // ✅ Use the correct import for React 18
import { BrowserRouter } from "react-router-dom";
import App from "./App.js";
import AuthProvider from "./Contexts/AuthContext.js";
import "./index.css";
import "./styles/global.css";

const root = ReactDOM.createRoot(document.getElementById("root")); // ✅ Use createRoot

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
