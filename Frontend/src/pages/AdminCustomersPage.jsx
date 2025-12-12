import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Alert, Snackbar, Pagination,
  CircularProgress, LinearProgress
} from "@mui/material";
import { primaryButton, secondaryButton, errorButton } from "../utils/buttonStyles";
import { useAuth } from "../context/AuthContext";
import { getAllCustomers, getCustomerHistory } from "../api/adminApi";

export default function AdminCustomersPage() {
  const { user } = useAuth();
  const authToken = user?.authToken;
  const navigate = useNavigate();

  // states
  const [allCustomers, setAllCustomers] = useState([]);
  const [filters, setFilters] = useState({ id: "", name: "", email: "" });
  const [purchaseHistory, setPurchaseHistory] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const [alert, setAlert] = useState({ open: false, severity: "success", message: "" });

  const [page, setPage] = useState(0);
  const [pageSize] = useState(50);

  // ---------------------- ALERT HANDLERS ----------------------
  const showAlert = (severity, message) => {
    setAlert({ open: true, severity, message });
  };

  const closeAlert = () => {
    setAlert({ open: false, severity: "success", message: "" });
  };

  // ------------------- LOAD ALL CUSTOMERS -------------------
  async function loadAllCustomers() {
    setInitialLoading(true);
    try {
      const customers = await getAllCustomers();
      setAllCustomers(customers);
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to load customers. Please refresh the page.");
      setAllCustomers([]);
    } finally {
      setInitialLoading(false);
    }
  }

  useEffect(() => {
    loadAllCustomers();
  }, []);

  // ------------------- FILTER LOGIC -------------------
  useEffect(() => {
    setPage(0); // Reset to first page when filters change
  }, [filters.id, filters.name, filters.email]);

  const filteredCustomers = useMemo(() => {
    return allCustomers.filter((c) => {
      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
      if (filters.id && !c.userId.toString().includes(filters.id)) return false;
      if (filters.name && !fullName.includes(filters.name.toLowerCase())) return false;
      if (filters.email && !c.email.toLowerCase().includes(filters.email.toLowerCase())) return false;
      return true;
    });
  }, [allCustomers, filters]);

  // ------------------- PAGINATE FILTERED RESULTS -------------------
  const totalFilteredCustomers = filteredCustomers.length;
  const totalPages = Math.ceil(totalFilteredCustomers / pageSize);
  const paginatedCustomers = useMemo(() => {
    return filteredCustomers.slice(page * pageSize, (page + 1) * pageSize);
  }, [filteredCustomers, page, pageSize]);

  // ------------------- PAGINATION HANDLER -------------------
  const handlePageChange = (event, value) => {
    setPage(value - 1); // mui Pagination is 1-indexed, API is 0-indexed
  };

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

  // Show loading screen on initial load
  if (initialLoading) {
    return (
      <Box sx={{ 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center", 
        minHeight: "60vh",
        gap: 3
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading customers... ({allCustomers.length} customers loaded)
        </Typography>
        <Box sx={{ width: "300px" }}>
          <LinearProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ ml: 0, width: "100%", px: { xs: 2, md: 5 }, py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold", textAlign: "center" }}>
        Manage Customers
      </Typography>

      {/* FILTERS */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Filter By
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1.5fr" }, gap: 2 }}>
          <TextField 
            label="Customer ID" 
            fullWidth 
            value={filters.id} 
            onChange={(e) => setFilters({ ...filters, id: e.target.value })}
            placeholder="Search by ID..."
          />
          <TextField 
            label="Name" 
            fullWidth 
            value={filters.name} 
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            placeholder="Search by name..."
          />
          <TextField 
            label="Email" 
            fullWidth 
            value={filters.email} 
            onChange={(e) => setFilters({ ...filters, email: e.target.value })}
            placeholder="Search by email..."
          />
        </Box>

        {(filters.id || filters.name || filters.email) && (
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="outlined" 
              sx={secondaryButton} 
              onClick={() => setFilters({ id: "", name: "", email: "" })}
            >
              Clear All Filters
            </Button>
          </Box>
        )}
      </Paper>

      {/* PAGINATION INFO */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 2 }}>
        <Typography variant="body2" sx={{ color: "gray" }}>
          Showing {paginatedCustomers.length > 0 ? page * pageSize + 1 : 0} - {Math.min((page + 1) * pageSize, totalFilteredCustomers)} of {totalFilteredCustomers} customers
          {totalFilteredCustomers !== allCustomers.length && (
            <span style={{ fontWeight: "bold", marginLeft: "8px" }}>
              (filtered from {allCustomers.length} total)
            </span>
          )}
        </Typography>
      </Box>

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
            {paginatedCustomers.map((c) => (
              <TableRow key={c.userId}>
                <TableCell>{c.userId}</TableCell>
                <TableCell>{c.firstName} {c.lastName}</TableCell>
                <TableCell>{c.email}</TableCell>

                <TableCell>
                  <Button 
                    variant="outlined" 
                    sx={secondaryButton} 
                    onClick={() => navigate(`/admin/customers/${c.userId}/edit`)}
                  >
                    Edit
                  </Button>
                  &nbsp;
                  <Button 
                    variant="outlined" 
                    sx={secondaryButton} 
                    onClick={() => openPurchaseHistory(c)}
                  >
                    Purchase History
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {paginatedCustomers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: "center", py: 4, color: "gray" }}>
                  {filters.id || filters.name || filters.email
                    ? "No customers match your filters."
                    : "No customers available."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination 
            count={totalPages} 
            page={page + 1} 
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

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
