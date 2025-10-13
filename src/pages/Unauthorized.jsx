import React from "react";

const Unauthorized = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
    <h1 style={{ fontSize: "2.5rem", color: "#e53e3e", marginBottom: "1rem" }}>403 - Unauthorized</h1>
    <p style={{ fontSize: "1.2rem", color: "#444" }}>You do not have permission to access this page.</p>
  </div>
);

export default Unauthorized;
