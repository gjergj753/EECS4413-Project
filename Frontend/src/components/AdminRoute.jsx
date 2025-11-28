import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user } = useAuth();

  // not logged in -> log in 
  if (!user) return <Navigate to="/login" replace />;

  // Logged in but not admin -> home
  if (!user.admin) return <Navigate to="/" replace />;

  return children;
}
