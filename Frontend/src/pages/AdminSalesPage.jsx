import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import { mockSales } from "../data/salesData";

export default function AdminSalesPage() {
  const [filters, setFilters] = useState({
    orderId: "",
    customerName: "",
    productName: "",
    fromDate: "",
    toDate: "",
    minTotal: "" 
  });

  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredSales = useMemo(() => {
    return mockSales.filter(order => {
      const orderDate = new Date(order.createdAt);
      if (filters.orderId && !order.orderId.toString().includes(filters.orderId)) return false;
      const fullName = `${order.user.firstName} ${order.user.lastName}`.toLowerCase();
      if (filters.customerName && !fullName.includes(filters.customerName.toLowerCase())) return false;
      if (filters.productName) {
        const productMatch = order.orderItemList.some(item =>
          item.book.title.toLowerCase().includes(filters.productName.toLowerCase())
        );
        if (!productMatch) return false;
      }
      if (filters.fromDate && orderDate < new Date(filters.fromDate)) return false;
      if (filters.toDate && orderDate > new Date(filters.toDate)) return false;
      if (filters.minTotal && order.totalPrice < parseFloat(filters.minTotal)) return false;

      return true;
    });
  }, [filters]);

  return (
    <Box sx={{ ml: 0, px: { xs: 2, md: 5 }, py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold", textAlign: "center" }}>
        Sales History
      </Typography>

      {/* ------------------ FILTER SECTION ------------------ */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>Filter By</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
          <TextField
            label="Order ID"
            value={filters.orderId}
            onChange={e => setFilters({ ...filters, orderId: e.target.value })}
          />
          <TextField
            label="Customer Name"
            value={filters.customerName}
            onChange={e => setFilters({ ...filters, customerName: e.target.value })}
          />
          <TextField
            label="Product Title"
            value={filters.productName}
            onChange={e => setFilters({ ...filters, productName: e.target.value })}
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
            slotProps={{ inputLabel: { min: 0 } }}
          />

        </Box>
      </Paper>

      {/* ------------------ SALES TABLE ------------------ */}
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f3f3f3" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSales.map(order => (
              <TableRow key={order.orderId}>
                <TableCell>{order.orderId}</TableCell>
                <TableCell>{order.user.firstName} {order.user.lastName}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    sx={{
                      borderRadius: "20px",
                      textTransform: "none",
                      px: 3,
                      fontWeight: "bold",
                      "&:hover": { transform: "scale(1.04)" }
                    }}
                    onClick={() => setSelectedOrder(order)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {filteredSales.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: "center", color: "gray" }}>
                  No orders match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ------------------ DETAILS MODAL ------------------ */}
      {selectedOrder && (
        <Dialog open={true} onClose={() => setSelectedOrder(null)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: "bold" }}>Order #{selectedOrder.orderId}</DialogTitle>
          <DialogContent dividers>
            <Typography sx={{ mb: 1 }}>
              <strong>Customer:</strong> {selectedOrder.user.firstName} {selectedOrder.user.lastName}
            </Typography>
            <Typography sx={{ mb: 2 }}>
              <strong>Email:</strong> {selectedOrder.user.email}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>Items</Typography>
            {selectedOrder.orderItemList.map(item => (
              <Paper key={item.orderItemId} elevation={2} sx={{ p: 2, mb: 2, borderRadius: 3, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography sx={{ fontWeight: "bold" }}>{item.book.title}</Typography>
                  <Typography sx={{ color: "gray" }}>Qty: {item.quantity}</Typography>
                  <Typography sx={{ color: "gray" }}>Price: ${item.price.toFixed(2)}</Typography>
                </Box>
              </Paper>
            ))}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>Total: ${selectedOrder.totalPrice.toFixed(2)}</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={() => setSelectedOrder(null)}
              sx={{
                borderRadius: "20px",
                textTransform: "none",
                px: 3,
                fontWeight: "bold",
                "&:hover": { transform: "scale(1.04)" }
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

