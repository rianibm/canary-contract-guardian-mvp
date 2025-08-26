import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Dashboard from "./components/Dashboard";
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
