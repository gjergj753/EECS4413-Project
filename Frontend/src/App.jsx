import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import BookDetailsPage from "./pages/BookDetails";
import { Box, Toolbar } from "@mui/material";
import React from "react";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AccountPage from "./pages/AccountPage";
import ShoppingCartPage from "./pages/ShoppingCartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSummaryPage from "./pages/OrderSummaryPage";
import OrdersPage from "./pages/OrdersPage";
import AdminSalesPage from "./pages/AdminSalesPage";
import AdminInventoryPage from "./pages/AdminInventoryPage";
import AdminCustomersPage from "./pages/AdminCustomersPage";

function AppContent() {
  const location = useLocation();
  const path = location.pathname;

  const { user, logout } = useAuth();

  // pages where Navbar should be hidden
  const isAuthPage = path === "/login" || path === "/sign-up";


  return (
    <>
      {/* {
      !isAuthPage && (
        <Navbar
          onLogout={logout}
          isLoggedIn={!!user}
          isAdmin={user?.isAdmin}
          cartCount={cartCount}
        />
      )} */}

      {/* show navbar always for now */}
      <Navbar
        onLogout={logout}
        isLoggedIn={!!user}
        isAdmin={user?.isAdmin}
      />

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
        {/* {!isAuthPage && <Toolbar />} */}
        <Toolbar />

        {/* Define paths for pages */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/books" element={<HomePage />} />
          <Route path="/book/:bookId" element={<BookDetailsPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sign-up" element={<SignupPage />} />
          <Route path="/orders" element={<OrdersPage/>} />
          <Route path="/cart" element={<ShoppingCartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success/:orderId" element={<OrderSummaryPage />} />


          <Route path="/admin/inventory" element={<AdminInventoryPage />} />
          <Route path="/admin/sales" element={<AdminSalesPage />} />
          <Route path="/admin/customers" element={<AdminCustomersPage />} />
          


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
