import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import { AuthProvider } from "./services/AuthContext";
import "./index.css";
import { PaymentStatsProvider } from './contexts/PaymentStatsContext';
import { MedicalPendingProvider } from './contexts/MedicalPendingContext';

ReactDOM.createRoot(document.getElementById("root")).render(
 <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PaymentStatsProvider>
          <MedicalPendingProvider>
            <App />
          </MedicalPendingProvider>
        </PaymentStatsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
