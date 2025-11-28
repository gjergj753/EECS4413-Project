import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
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
import AdminRoute from "./components/AdminRoute";
import AdminSalesPage from "./pages/AdminSalesPage";
import AdminInventoryPage from "./pages/AdminInventoryPage";
import AdminCustomersPage from "./pages/AdminCustomersPage";
import AdminEditCustomerPage from "./pages/AdminEditCustomerPage";

import OrderDetailsPage from "./pages/OrderDetails";

function AppContent() {
  const location = useLocation();
  const path = location.pathname;

  const { user, logout } = useAuth();

  // pages where Navbar should be hidden
  const isAuthPage = path === "/login" || path === "/sign-up";


  return (
    <>

      {!isAuthPage && (
        <Navbar
          onLogout={logout}
          isLoggedIn={!!user}
          isAdmin={user?.isAdmin}
        />
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isAuthPage ? 0 : 3,
          ml: isAuthPage ? 0 : { xs: "0px", sm: "240px" },
          backgroundColor: isAuthPage ? "#ffffff" : "inherit",
          minHeight: "100vh",
        }}
      >
        {!isAuthPage && <Toolbar />}

        {/* Non-admin routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/books" element={<HomePage />} />
          <Route path="/book/:bookId" element={<BookDetailsPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sign-up" element={<SignupPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
          <Route path="/cart" element={<ShoppingCartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success/:orderId" element={<OrderSummaryPage />} />

        {/* Admin routes */}  
          <Route path="/admin" element={<Navigate to="/admin/sales" replace />}/>
          <Route path="/admin/inventory"
            element={
              <AdminRoute>
                <AdminInventoryPage />
              </AdminRoute>
            }
          />

        <Route path="/admin/sales"
          element={
            <AdminRoute>
              <AdminSalesPage />
            </AdminRoute>
          }
        />

        <Route path="/admin/customers"
          element={
            <AdminRoute>
              <AdminCustomersPage />
            </AdminRoute>
          }
        />
        <Route path="/admin/customers/:userId/edit" element={<AdminEditCustomerPage />} />

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
