import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Alert, Snackbar
} from "@mui/material";
import { primaryButton, secondaryButton, errorButton } from "../utils/buttonStyles";
import { useAuth } from "../context/AuthContext";
import { getAllCustomers, getCustomerHistory } from "../api/adminApi";

export default function AdminCustomersPage() {
  const { user } = useAuth();
  const authToken = user?.authToken;
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [filters, setFilters] = useState({ id: "", name: "", email: "" });
  const [purchaseHistory, setPurchaseHistory] = useState(null);

  const [alert, setAlert] = useState({ open: false, severity: "success", message: "" });

  // ---------------- LOAD CUSTOMERS ----------------
  useEffect(() => {
    async function load() {
      try {
        const res = await getAllCustomers();
        setCustomers(res.userList || res || []);
      } catch (err) {
        console.error("Failed to load customers", err);
        showAlert("error", "Failed to load customers");
      }
    }
    load();
  }, []);

  // ---------------- ALERT HANDLERS ----------------
  const showAlert = (severity, message) => {
    setAlert({ open: true, severity, message });
  };

  const closeAlert = () => {
    setAlert({ open: false, severity: "success", message: "" });
  };

  // ---------------- FILTERING ----------------
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
      if (filters.id && !c.userId.toString().includes(filters.id)) return false;
      if (filters.name && !fullName.includes(filters.name.toLowerCase())) return false;
      if (filters.email && !c.email.toLowerCase().includes(filters.email.toLowerCase())) return false;
      return true;
    });
  }, [customers, filters]);

  // ---------------- LOAD PURCHASE HISTORY ----------------
  const openPurchaseHistory = async (customer) => {
    try {
      const data = await getCustomerHistory(authToken, customer.userId);
      setPurchaseHistory(data);
    } catch (err) {
      console.error("Failed to load purchase history", err);
      setPurchaseHistory({ orderList: [] });
      showAlert("error", "Failed to load purchase history");
    }
  };

  // ---------------- NAVIGATE TO SPECIFIED ORDER IN ADMINSALESPAGE ----------------
  const goToOrder = (orderId) => {
    setPurchaseHistory(null);
    navigate(`/admin/sales?orderId=${orderId}`);
  };

  return (
    <Box sx={{ ml: 0, width: "100%", px: { xs: 2, md: 4 }, py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold", textAlign: "center" }}>
        Manage Customers
      </Typography>

      {/* FILTERS */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Filter By
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2 }}>
          <TextField label="Customer ID" fullWidth value={filters.id} onChange={(e) => setFilters({ ...filters, id: e.target.value })} />
          <TextField label="Name" fullWidth value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
          <TextField label="Email" fullWidth value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} />
        </Box>
      </Paper>

      {/* CUSTOMERS TABLE */}
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: "#f3f3f3" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Customer ID</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredCustomers.map((c) => (
              <TableRow key={c.userId}>
                <TableCell>{c.userId}</TableCell>
                <TableCell>{c.firstName} {c.lastName}</TableCell>
                <TableCell>{c.email}</TableCell>

                <TableCell>
                  <Button 
                    variant="outlined" 
                    sx={secondaryButton} 
                    onClick={() => navigate(`/admin/customers/${c.userId}/edit`)} //go to AdminEditCustomerPage
                  >
                    Edit
                  </Button>
                  &nbsp;
                  <Button variant="outlined" sx={secondaryButton} onClick={() => openPurchaseHistory(c)}>Purchase History</Button>
                </TableCell>
              </TableRow>
            ))}

            {filteredCustomers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: "center", color: "gray" }}>
                  No customers match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ------------ PURCHASE HISTORY MODAL ------------ */}
      {purchaseHistory && (
        <Dialog open={true} onClose={() => setPurchaseHistory(null)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: "bold" }}>
            Purchase History - Customer #{purchaseHistory.user?.userId}: {purchaseHistory.user?.firstName} {purchaseHistory.user?.lastName}
          </DialogTitle>

          <DialogContent dividers>
            {(!purchaseHistory.orderList || purchaseHistory.orderList.length === 0) ? (
              <Typography>No orders found for this customer.</Typography>
            ) : (
              purchaseHistory.orderList.map((o) => (
                <Paper key={o.orderId} sx={{ p: 2, mb: 2 }}>
                  <Typography><b>Order ID:</b> {o.orderId}</Typography>
                  <Typography><b>Total Price:</b> ${Number(o.totalPrice).toFixed(2)}</Typography>
                  <Typography><b>Status:</b> {o.status}</Typography>
                  <Typography><b>Date:</b> {new Date(o.createdAt).toLocaleString()}</Typography>
                  <Box sx={{ mt: 2 }}>
                    <Button 
                      variant="outlined" 
                      sx={secondaryButton} 
                      onClick={() => goToOrder(o.orderId)}
                    >
                      Go to Order
                    </Button>
                  </Box>
                </Paper>
              ))
            )}
          </DialogContent>

          <DialogActions>
            <Button variant="outlined" sx={secondaryButton} onClick={() => setPurchaseHistory(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* ------------ UNIFIED ALERT SNACKBAR ------------ */}
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={closeAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}