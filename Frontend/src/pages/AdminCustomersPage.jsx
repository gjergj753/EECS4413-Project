import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from "@mui/material";
import { dummyCustomers } from "../data/dummyCustomers"; 
import { mockOrders } from "../data/orders";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState(dummyCustomers);
  const orders = mockOrders;
  const [filters, setFilters] = useState({ id: "", name: "", email: "" });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editData, setEditData] = useState({ firstName: "", lastName: "", email: "", address: "", creditCard: "" });


  // ---------------- FILTERING ----------------
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
      if (filters.id && !c.userId.toString().includes(filters.id)) return false;
      if (filters.name && !fullName.includes(filters.name.toLowerCase())) return false;
      if (filters.email && !c.email.toLowerCase().includes(filters.email.toLowerCase())) return false;
      return true;
    });
  }, [customers, filters]);

  // ---------------- SAVE CHANGES ----------------
  const handleSave = () => {
    setCustomers(prev => prev.map(c => c.userId === selectedCustomer.userId ? { ...c, ...editData } : c));
    setSelectedCustomer(null);
  };



  return (
    // <Box sx={{ ml: 0, px: { xs: 2, md: 5 }, py: 4 }}>
        <Box sx={{
            ml: 0,
            width: "100%",
            maxWidth: "100%",   // allow full width
            px: { xs: 2, md: 4 },
            py: 4,
            boxSizing: "border-box"
            }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold", textAlign: "center" }}>
        Manage Customers
      </Typography>

      {/* FILTER SECTION */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>Filter By</Typography>
        {/* <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 2 }}> */}
            <Box sx={{
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
  gap: 2,
  width: "100%",
  boxSizing: "border-box"
}}>

          <TextField fullWidth label="Customer ID" value={filters.id} onChange={e => setFilters({...filters, id: e.target.value})} />
          <TextField fullWidth label="Name" value={filters.name} onChange={e => setFilters({...filters, name: e.target.value})} />
          <TextField fullWidth label="Email" value={filters.email} onChange={e => setFilters({...filters, email: e.target.value})} />
        </Box>
      </Paper>

      {/* CUSTOMER TABLE */}
      {/* <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table> */}
            <TableContainer component={Paper} sx={{ borderRadius: 3, overflowX: "auto" }}>
  <Table sx={{ minWidth: 650 }}> {/* optional: min width */}

          <TableHead sx={{ backgroundColor: "#f3f3f3" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Customer ID</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers.map(c => (
              <TableRow key={c.userId}>
                <TableCell>{c.userId}</TableCell>
                <TableCell>{c.firstName} {c.lastName}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    sx={{ borderRadius: "20px", textTransform: "none", px: 3, fontWeight: "bold" }}
                    onClick={() => {
                      setSelectedCustomer(c);
                      setEditData({
                        firstName: c.firstName,
                        lastName: c.lastName,
                        email: c.email,
                        address: c.address || "",
                        creditCard: c.creditCard || ""
                      });
                    }}
                  >
                    Edit
                  </Button>
                </TableCell>
                <TableCell>
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
                        Purchase History
                    </Button>
 
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



      {/* EDIT CUSTOMER MODAL */}
      {selectedCustomer && (
        <Dialog open={true} onClose={() => setSelectedCustomer(null)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: "bold" }}>Editing Customer ... {selectedCustomer.firstName} {selectedCustomer.lastName}</DialogTitle>
          <DialogContent dividers>
            <TextField
              label="First Name"
              fullWidth
              sx={{ mb: 2 }}
              value={editData.firstName}
              onChange={e => setEditData({...editData, firstName: e.target.value})}
            />
            <TextField
              label="Last Name"
              fullWidth
              sx={{ mb: 2 }}
              value={editData.lastName}
              onChange={e => setEditData({...editData, lastName: e.target.value})}
            />
            <TextField
              label="Email"
              fullWidth
              sx={{ mb: 2 }}
              value={editData.email}
              onChange={e => setEditData({...editData, email: e.target.value})}
            />
            <TextField
              label="Address"
              fullWidth
              sx={{ mb: 2 }}
              value={editData.address}
              onChange={e => setEditData({...editData, address: e.target.value})}
            />
            <TextField
              label="Credit Card"
              fullWidth
              value={editData.creditCard}
              onChange={e => setEditData({...editData, creditCard: e.target.value})}
            />
          </DialogContent>
          <DialogActions>
             <Button
                variant="outlined"
                onClick={() => setSelectedCustomer(null)}
                sx={{
                borderRadius: "20px",
                textTransform: "none",
                px: 3,
                fontWeight: "bold",
                "&:hover": { transform: "scale(1.04)" }
                }}
            >
                Cancel
            </Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: "#3f51b5", borderRadius: "20px", "&:hover": { backgroundColor: "#303f9f", transform: "scale(1.04)" } }}
              onClick={handleSave}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}

      
    </Box>
  );
}
