import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  Box, Typography, Paper, Divider, Button, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Select, MenuItem,
  FormControl, InputLabel, Alert, Snackbar, Pagination, CircularProgress,
  LinearProgress
} from "@mui/material";
import { primaryButton, secondaryButton, errorButton } from "../utils/buttonStyles";
import { useAuth } from "../context/AuthContext";
import { getAllOrders, getOrderById, updateOrderStatus, cancelOrder } from "../api/adminApi";
import { generateSalesCSV } from "../utils/generateSalesCSV";

export default function AdminSalesPage() {
  const { user } = useAuth();
  const authToken = user?.authToken;
  const location = useLocation();

  const [allOrders, setAllOrders] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const [alert, setAlert] = useState({ open: false, severity: "success", message: "" });

  const [filters, setFilters] = useState({
    orderId: "",
    status: "",
    productName: "",
    fromDate: "",
    toDate: "",
    minTotal: ""
  });

  const [page, setPage] = useState(0);
  const [pageSize] = useState(100);

  // ---------------------- ALERT HANDLERS ----------------------
  const showAlert = (severity, message) => {
    setAlert({ open: true, severity, message });
  };

  const closeAlert = () => {
    setAlert({ open: false, severity: "success", message: "" });
  };

  // ---------------------- RESET FILTERS ----------------------
  const resetFilters = () => {
    setFilters({
      orderId: "",
      status: "",
      productName: "",
      fromDate: "",
      toDate: "",
      minTotal: ""
    });
  };

  // ------------------- LOAD ALL ORDERS -------------------
  async function loadAllOrders() {
    setInitialLoading(true);
    try {
      const orders = await getAllOrders(authToken);
      setAllOrders(orders);
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to load orders. Please refresh the page.");
      setAllOrders([]);
    } finally {
      setInitialLoading(false);
    }
  }

  useEffect(() => {
    loadAllOrders();
  }, []);

  // ---------------------- FOR URL PARAMETERS FROM ADMINCUSTOMERSPAGE ----------------------
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderIdParam = params.get("orderId");

    if (orderIdParam && allOrders.length > 0) {
      setFilters(prev => ({ ...prev, orderId: orderIdParam }));
      openOrderDetails(parseInt(orderIdParam));
    }
  }, [location.search, allOrders]);

  // ------------------- FILTER LOGIC -------------------
  useEffect(() => {
    setPage(0); // Reset to first page when filters change
  }, [filters.orderId, filters.status, filters.productName, filters.fromDate, filters.toDate, filters.minTotal]);

  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      const orderDate = new Date(order.createdAt);

      if (filters.orderId && !order.orderId.toString().includes(filters.orderId)) return false;

      const status = `${order.status} ${order.status}`.toLowerCase();
      if (filters.status && !status.includes(filters.status.toLowerCase())) return false;

      if (filters.productName) {
        const match = order.orderItemList?.some(item =>
          item.book.title.toLowerCase().includes(filters.productName.toLowerCase())
        );
        if (!match) return false;
      }

      if (filters.fromDate && orderDate < new Date(filters.fromDate)) return false;
      if (filters.toDate) { 
        const toDate = new Date(filters.toDate);
        toDate.setDate(toDate.getDate() + 1);
        if (orderDate >= toDate) return false;
      }

      if (filters.minTotal && order.totalPrice < parseFloat(filters.minTotal)) return false;

      return true;
    });
  }, [filters, allOrders]);

  // ------------------- PAGINATE FILTERED RESULTS -------------------
  const totalFilteredOrders = filteredOrders.length;
  const totalPages = Math.ceil(totalFilteredOrders / pageSize);
  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice(page * pageSize, (page + 1) * pageSize);
  }, [filteredOrders, page, pageSize]);

  // ------------------- PAGINATION HANDLER -------------------
  const handlePageChange = (event, value) => {
    setPage(value - 1); // mui Pagination is 1-indexed, API is 0-indexed
  };

  // ---------------------- LOAD SINGLE ORDER ----------------------
  async function openOrderDetails(orderId) {
    try {
      const res = await getOrderById(authToken, orderId);
      setSelectedOrder(res.order);
      setNewStatus(res.order.status);
    } catch {
      showAlert("error", "Failed to load order details");
    }
  }

  // ---------------------- UPDATE ORDER STATUS HANDLER ----------------------
  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      await updateOrderStatus(authToken, selectedOrder.orderId, newStatus);
      showAlert("success", "Order status updated successfully!");
      
      // Update local state
      setSelectedOrder({ ...selectedOrder, status: newStatus });
      setAllOrders(prev => prev.map(order => 
        order.orderId === selectedOrder.orderId 
          ? { ...order, status: newStatus }
          : order
      ));
    } catch (err) {
      console.error("Failed to update order status", err);
      const errorMessage = err.response?.data?.message || "Failed to update order status";
      showAlert("error", errorMessage);
    }
  };

  // ---------------------- CANCEL ORDER HANDLER ----------------------
  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    if (selectedOrder.status !== "PENDING") {
      showAlert("error", "Only PENDING orders can be cancelled");
      return;
    }

    if (!window.confirm(`Are you sure you want to cancel order #${selectedOrder.orderId}?`)) {
      return;
    }

    try {
      await cancelOrder(authToken, selectedOrder.orderId);
      showAlert("success", "Order cancelled successfully!");
      
      // Remove order from local states
      setAllOrders(prev => prev.filter(order => order.orderId !== selectedOrder.orderId));
      setSelectedOrder(null);
    } catch (err) {
      console.error("Failed to cancel order", err);
      const errorMessage = err.response?.data?.message || "Failed to cancel order. Only PENDING orders can be cancelled.";
      showAlert("error", errorMessage);
    }
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
          Loading orders... ({allOrders.length} orders loaded)
        </Typography>
        <Box sx={{ width: "300px" }}>
          <LinearProgress />
        </Box>
      </Box>
    );
  }


  return (
    <Box sx={{ ml: 0, px: { xs: 2, md: 5 }, py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold", textAlign: "center" }}>
        Sales History
      </Typography>

      {/* Filter Section */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>Filter By</Typography>
        
        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1.5fr" },
          gap: 2
        }}>
          <TextField 
            label="Order ID" 
            value={filters.orderId}
            onChange={e => setFilters({ ...filters, orderId: e.target.value })}
            placeholder="Search by ID..."
          />
          <TextField 
            label="Status" 
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
            placeholder="Search by status..."
          />
          <TextField 
            label="Book Title" 
            value={filters.productName}
            onChange={e => setFilters({ ...filters, productName: e.target.value })}
            placeholder="Search by books in order..."
          />
          <TextField 
            type="date" 
            label="From" 
            slotProps={{ inputLabel: { shrink: true } }}
            value={filters.fromDate} 
            onChange={e => setFilters({ ...filters, fromDate: e.target.value })}
          />
          <TextField 
            type="date" 
            label="To" 
            slotProps={{ inputLabel: { shrink: true } }}
            value={filters.toDate} 
            onChange={e => setFilters({ ...filters, toDate: e.target.value })}
          />
          <TextField 
            label="Min Total ($)" 
            type="number" 
            value={filters.minTotal}
            onChange={e => setFilters({ ...filters, minTotal: e.target.value })}
            placeholder="Minimum total..."
          />
        </Box>

        {(filters.orderId || filters.status || filters.productName || filters.fromDate || filters.toDate || filters.minTotal) && (
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" sx={secondaryButton} onClick={resetFilters}>
              Clear All Filters
            </Button>
          </Box>
        )}
      </Paper>

      {/* Download Sales Report & Pagination Info */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 2 }}>
        <Button
          variant="contained"
          sx={primaryButton}
          onClick={() => generateSalesCSV(filteredOrders, filters)}
        >
          Download Sales Report (For Date Range)
        </Button>
        
        <Typography variant="body2" sx={{ color: "gray" }}>
          Showing {paginatedOrders.length > 0 ? page * pageSize + 1 : 0} - {Math.min((page + 1) * pageSize, totalFilteredOrders)} of {totalFilteredOrders} orders
          {totalFilteredOrders !== allOrders.length && (
            <span style={{ fontWeight: "bold", marginLeft: "8px" }}>
              (filtered from {allOrders.length} total)
            </span>
          )}
        </Typography>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f3f3f3" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedOrders.map(order => (
              <TableRow key={order.orderId}>
                <TableCell>{order.orderId}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>${order.totalPrice.toFixed(2)}</TableCell>

                <TableCell>
                  <Button
                    variant="outlined"
                    sx={secondaryButton}
                    onClick={() => openOrderDetails(order.orderId)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {paginatedOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: "center", py: 4, color: "gray" }}>
                  {filters.orderId || filters.status || filters.productName || filters.fromDate || filters.toDate || filters.minTotal
                    ? "No orders match your filters."
                    : "No orders available."}
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={true} onClose={() => setSelectedOrder(null)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: "bold" }}>
            Order #{selectedOrder.orderId}
          </DialogTitle>

          <DialogContent dividers>
            <Typography sx={{ mb: 1 }}>
              <strong>Customer:</strong> {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}
            </Typography>

            <Typography sx={{ mb: 1 }}>
              <strong>Email:</strong> {selectedOrder.user?.email}
            </Typography>

            <Typography sx={{ mb: 2 }}>
              <strong>Date:</strong>{" "}
              {new Date(selectedOrder.createdAt).toLocaleString()}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* ORDER STATUS SUBSECTION */}
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Order Status
            </Typography>
            
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 3 }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newStatus}
                  label="Status"
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <MenuItem value="PENDING">PENDING</MenuItem>
                  <MenuItem value="PAID">PAID</MenuItem>
                  <MenuItem value="SHIPPED">SHIPPED</MenuItem>
                  <MenuItem value="RECEIVED">RECEIVED</MenuItem>
                </Select>
              </FormControl>
              
              <Button 
                variant="contained" 
                sx={primaryButton}
                onClick={handleUpdateStatus}
                disabled={newStatus === selectedOrder.status}
              >
                Update Status
              </Button>

              {/* show Cancel Order button only if status == PENDING */}
              {selectedOrder.status === "PENDING" && (
                <Button 
                  variant="contained" 
                  sx={errorButton}
                  onClick={handleCancelOrder}
                >
                  Cancel Order
                </Button>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* ORDER ITEMS SUBSECTION */}
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Items
            </Typography>

            {selectedOrder.orderItemList.map(item => (
              <Paper
                key={item.orderItemId}
                elevation={2}
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 3,
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 2
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Typography sx={{ fontWeight: "bold" }}>{item.book.title}</Typography>
                  <Typography sx={{ color: "gray" }}>Qty: {item.quantity}</Typography>
                  <Typography sx={{ color: "gray" }}>Price: ${item.price.toFixed(2)}</Typography>
                </Box>
              </Paper>
            ))}

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Total: ${selectedOrder.totalPrice.toFixed(2)}
            </Typography>
          </DialogContent>

          <DialogActions>
            <Button
              variant="outlined"
              sx={secondaryButton}
              onClick={() => setSelectedOrder(null)}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* UNIFIED ALERT SNACKBAR */}
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
