import React from "react";
import ReactDOM from "react-dom/client"; // ✅ Correct import for React 18
import { BrowserRouter } from "react-router-dom";
import App from "./App.js";
import { QPProvider } from "./Contexts/QPContext.js"; // ✅ Import QPProvider
import AuthProvider from "./Contexts/AuthContext.js";
import "./index.css";
import "./styles/global.css";

const root = ReactDOM.createRoot(document.getElementById("root")); // ✅ Use createRoot

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <QPProvider>  {/* ✅ Wrap with QPProvider to provide context */}
          <App />
        </QPProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
