import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import PublicApp from "./PublicApp";
import AdminLogin from "./AdminLogin";
import AdminApp from "./AdminApp";

import "./index.css";


// =====================================================
// PROTECTED ADMIN ROUTE
// =====================================================

function ProtectedAdmin() {
  const isLoggedIn =
    sessionStorage.getItem("adminLoggedIn") === "true";

  if (!isLoggedIn) {
    return <Navigate to="/admin" replace />;
  }

  return <AdminApp />;
}


// =====================================================
// APP ROUTING
// =====================================================

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <BrowserRouter>

      <Routes>

        {/* =========================================
            PUBLIC WEBSITE
        ========================================= */}

        <Route
          path="/"
          element={<PublicApp />}
        />


        {/* =========================================
            ADMIN LOGIN
        ========================================= */}

        <Route
          path="/admin"
          element={<AdminLogin />}
        />


        {/* =========================================
            PROTECTED ADMIN DASHBOARD
        ========================================= */}

        <Route
          path="/admin/dashboard"
          element={<ProtectedAdmin />}
        />


        {/* =========================================
            UNKNOWN URL
        ========================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  </React.StrictMode>
);