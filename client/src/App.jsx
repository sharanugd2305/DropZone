import React from "react";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";

const App = () => {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard /> 
            </ProtectedRoute>
          }
        />

        {/* Clerk Pages */}
        <Route
          path="/sign-in"
          element={
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
              <SignIn />
            </div>
          }
        />

        <Route
          path="/sign-up"
          element={
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
              <SignUp />
            </div>
          }
        />
      </Routes>
    </>
  );
};

export default App;
