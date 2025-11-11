import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import BookDetailsPage from "./pages/BookDetails";
import { Box, Toolbar } from "@mui/material";
import React from "react";

function AppContent() {
  const location = useLocation();
  const path = location.pathname;

  // (later from context/backend)
  const isLoggedIn = true;
  const cartCount = 1;

  // pages where Navbar should be hidden
  const isAuthPage = path === "/login" || path === "/sign-up";

  const handleLogout = () => {
    console.log("Logging out...");
  };

  return (
    <>
      {!isAuthPage && (
        <Navbar
          onLogout={handleLogout}
          isLoggedIn={isLoggedIn}
          cartCount={cartCount}
        />
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: !isAuthPage ? 3 : 0,
          ml: !isAuthPage ? { sm: "240px" } : 0, 
          backgroundColor: isAuthPage ? "#ffffff" : "inherit",
          minHeight: "100vh",
        }}
      >
        {!isAuthPage && <Toolbar />}

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/book/:bookId" element={<BookDetailsPage />} />
          <Route path="/account" element={<p>Account page</p>} />\
          <Route path="/login" element={<p>Login page</p>} />
          <Route path="/sign-up" element={<p>Sign-up page</p>} />
          <Route path="/cart" element={<p>Cart Page</p>} />
          <Route path="/checkout" element={<p>Checkout Page</p>} />
        </Routes>
      </Box>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
