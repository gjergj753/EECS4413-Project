import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Divider, FormControlLabel, Checkbox, Alert, Snackbar,
  List, ListItem, ListItemText, IconButton, Chip
} from "@mui/material";
import { primaryButton, secondaryButton, errorButton } from "../utils/buttonStyles";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../context/AuthContext";
import { getAllCustomers, updateCustomerDetails, updateCustomerPassword, deleteUser } from "../api/adminApi";
import { getAddressForUser, updateAddress } from "../api/addressApi";
import { getUserPaymentMethods, addPaymentMethod, deletePaymentMethod, setUserDefaultPaymentMethod } from "../api/paymentApi";

export default function AdminEditCustomerPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const authToken = user?.authToken;

  const [customer, setCustomer] = useState(null);
  const [addressId, setAddressId] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const [alert, setAlert] = useState({ open: false, severity: "success", message: "" });

  const [passwordModal, setPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" });

  const [personal, setPersonal] = useState({
    firstName: "",
    lastName: "",
    email: "",
    admin: false
  });

  const [shipping, setShipping] = useState({
    street: "",
    city: "",
    province: "",
    postalCode: "",
    country: ""
  });

  const [billing, setBilling] = useState({
    cardLast4: "",
    cardBrand: "",
    expiryMonth: "",
    expiryYear: ""
  });

  // ---------------- LOAD CUSTOMER DATA ----------------
  useEffect(() => {
    async function loadCustomer() {
      try {
        const res = await getAllCustomers();
        const customers = res.userList || res || [];
        const foundCustomer = customers.find(c => c.userId === parseInt(userId));
        
        if (!foundCustomer) {
          showAlert("error", "Customer not found");
          navigate("/admin/customers");
          return;
        }

        setCustomer(foundCustomer);

        // Populate personal info
        setPersonal({
          firstName: foundCustomer.firstName ?? "",
          lastName: foundCustomer.lastName ?? "",
          email: foundCustomer.email ?? "",
          admin: foundCustomer.admin ?? false
        });

        // Load address if any
        try {
          const addrRes = await getAddressForUser(foundCustomer.userId, authToken);
          const addr = addrRes.address || {};
          setShipping({
            street: addr.street || "",
            city: addr.city || "",
            province: addr.province || "",
            postalCode: addr.postalCode || "",
            country: addr.country || ""
          });
          setAddressId(addr.addressId ?? null);
        } catch (err) {
          setShipping({ street: "", city: "", province: "", postalCode: "", country: "" });
          setAddressId(null);
        }

        // Load payment methods
        loadPaymentMethods(foundCustomer.userId);
      } catch (err) {
        console.error("Failed to load customer", err);
        showAlert("error", "Failed to load customer");
      }
    }

    loadCustomer();
  }, [userId, authToken, navigate]);

  // ---------------- LOAD PAYMENT METHODS ----------------
  const loadPaymentMethods = async (customerId) => {
    try {
      const res = await getUserPaymentMethods(customerId, authToken);
      console.log("Payment methods response:", res); // Debug log
      // API returns paymentMethodList, not paymentMethods
      setPaymentMethods(res.paymentMethodList || []);
    } catch (err) {
      console.error("Failed to load payment methods", err);
      setPaymentMethods([]);
    }
  };

  // ---------------- ALERT HANDLERS ----------------
  const showAlert = (severity, message) => {
    setAlert({ open: true, severity, message });
  };

  const closeAlert = () => {
    setAlert({ open: false, severity: "success", message: "" });
  };

  // ---------------- UPDATE PERSONAL ----------------
  const updatePersonal = async () => {
    // fill with exisiting details
    if (!customer) return;
    const body = {
      userId: customer.userId,
      email: personal.email,
      firstName: personal.firstName,
      lastName: personal.lastName,
      admin: !!personal.admin
    };

    try {
      await updateCustomerDetails(authToken, customer.userId, body);
      setCustomer({ ...customer, ...body });
      showAlert("success", "Personal information updated successfully!");
    } catch (err) {
      console.error("Failed to update personal info", err);
      showAlert("error", "Failed to update personal information");
    }
  };

  // ---------------- PASSWORD MODAL ----------------
  const openPasswordModal = () => {
    setPasswordData({ newPassword: "", confirmPassword: "" });
    setPasswordModal(true);
  };

  const closePasswordModal = () => {
    setPasswordData({ newPassword: "", confirmPassword: "" });
    setPasswordModal(false);
  };

  const updatePassword = async () => {
    if (!customer) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showAlert("error", "Passwords do not match");
      return;
    }

    if (!passwordData.newPassword || passwordData.newPassword.trim() === "") {
      showAlert("error", "Password cannot be empty");
      return;
    }

    try {
      await updateCustomerPassword(authToken, customer.userId, passwordData.newPassword);
      showAlert("success", "Password updated successfully!");
      closePasswordModal();
    } catch (err) {
      console.error("Failed to update password", err);
      showAlert("error", "Failed to update password");
    }
  };

  // ---------------- UPDATE SHIPPING ----------------
  const updateShipping = async () => {
    const payload = {
      street: shipping.street,
      city: shipping.city,
      province: shipping.province,
      postalCode: shipping.postalCode,
      country: shipping.country
    };

    try {
      if (addressId) {
        await updateAddress(addressId, payload, authToken);
        showAlert("success", "Shipping address updated successfully!");
      } else {
        showAlert("warning", "No address was entered for this user; Shipping info not updated.");
      }
    } catch (err) {
      console.error("Failed to update address", err);
      showAlert("error", "Failed to update shipping address");
    }
  };

  // ---------------- ADD PAYMENT ----------------
  const addPayment = async () => {
    if (!customer) return;

    const body = {
      cardLast4: (billing.cardLast4 || "").slice(-4),
      cardBrand: billing.cardBrand || "UNKNOWN",
      expiryMonth: billing.expiryMonth || "",
      expiryYear: billing.expiryYear || ""
    };

    try {
      await addPaymentMethod(customer.userId, body, authToken);
      showAlert("success", `Payment method added successfully!`);
      setBilling({ cardLast4: "", cardBrand: "", expiryMonth: "", expiryYear: "" });
      loadPaymentMethods(customer.userId);
    } catch (err) {
      console.error("Failed to add payment method", err);
      showAlert("error", "Failed to add payment method");
    }
  };

  // ---------------- DELETE PAYMENT ----------------
  const handleDeletePayment = async (paymentId) => {
    if (!customer) return;
    
    if (!window.confirm("Are you sure you want to delete this payment method?")) {
      return;
    }

    try {
      await deletePaymentMethod(paymentId, customer.userId, authToken);
      showAlert("success", "Payment method deleted successfully!");
      loadPaymentMethods(customer.userId);
    } catch (err) {
      console.error("Failed to delete payment method", err);
      showAlert("error", "Failed to delete payment method");
    }
  };

  // ---------------- SET DEFAULT PAYMENT ----------------
  const handleSetDefault = async (paymentId) => {
    if (!customer) return;

    try {
      await setUserDefaultPaymentMethod(paymentId, customer.userId, authToken);
      showAlert("success", "Default payment method updated!");
      loadPaymentMethods(customer.userId);
    } catch (err) {
      console.error("Failed to set default payment method", err);
      showAlert("error", "Failed to set default payment method");
    }
  };

  // ---------------- DELETE USER ----------------
  const handleDeleteUser = async () => {
    if (!customer) return;
    
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await deleteUser(customer.userId);
      navigate("/admin/customers");
    } catch (err) {
      console.error("Failed to delete user", err);
      showAlert("error", "Failed to delete user.");
    }
  };

  if (!customer) {
    return (
      <Box sx={{ ml: 0, width: "100%", px: { xs: 2, md: 4 }, py: 4 }}>
        <Typography>Loading customer...</Typography>
      </Box>
    );
  }


  return (
    <Box sx={{ ml: 0, width: "100%", px: { xs: 2, md: 4 }, py: 4, display: "flex"}}>
      <Box sx={{ width: "100%", maxWidth: { xs: "100%", md: "70%" } }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
         <Button 
            variant="outlined" 
            sx={secondaryButton} 
            onClick={() => navigate("/admin/customers")}
          >
            ← Back to Customers
          </Button>
          <Typography variant="h4" sx={{ ml: 3, fontWeight: "bold" }}>
            Edit Customer #{customer.userId} - {customer.firstName} {customer.lastName}
          </Typography>
        </Box>

      <Paper sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        {/* PERSONAL */}
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>Personal Information</Typography>
        <TextField fullWidth label="First Name" sx={{ mb: 2 }} value={personal.firstName} onChange={(e) => setPersonal({ ...personal, firstName: e.target.value })} />
        <TextField fullWidth label="Last Name" sx={{ mb: 2 }} value={personal.lastName} onChange={(e) => setPersonal({ ...personal, lastName: e.target.value })} />
        <TextField fullWidth label="Email" sx={{ mb: 2 }} value={personal.email} onChange={(e) => setPersonal({ ...personal, email: e.target.value })} />
        <FormControlLabel control={<Checkbox checked={personal.admin} onChange={(e) => setPersonal({ ...personal, admin: e.target.checked })} />} label="Admin User" />

        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button variant="contained" sx={primaryButton} onClick={updatePersonal}>Save Personal Info</Button>
          <Button variant="outlined" sx={secondaryButton} onClick={openPasswordModal}>Change Password</Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        {/* SHIPPING */}
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>Shipping Information</Typography>
        <TextField fullWidth label="Street" sx={{ mb: 2 }} value={shipping.street} onChange={(e) => setShipping({ ...shipping, street: e.target.value })} />
        <TextField fullWidth label="City" sx={{ mb: 2 }} value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} />
        <TextField fullWidth label="Province" sx={{ mb: 2 }} value={shipping.province} onChange={(e) => setShipping({ ...shipping, province: e.target.value })} />
        <TextField fullWidth label="Postal Code" sx={{ mb: 2 }} value={shipping.postalCode} onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })} />
        <TextField fullWidth label="Country" sx={{ mb: 2 }} value={shipping.country} onChange={(e) => setShipping({ ...shipping, country: e.target.value })} />

        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button variant="contained" sx={primaryButton} onClick={updateShipping}>Save Shipping Info</Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        {/* PAYMENT METHODS */}
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>Billing Information</Typography>
        
        {paymentMethods.length > 0 ? (
          <List sx={{ mb: 3 }}>
            {paymentMethods.map((pm, index) => (
              <ListItem
                key={pm.paymentMethodId}
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  mb: 1,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography>
                        {index + 1}. {pm.cardBrand} ****{pm.cardLast4}
                      </Typography>
                      {pm.default && (
                        <Chip label="Default" color="primary" size="small" />
                      )}
                    </Box>
                  }
                  secondary={`Expires: ${pm.expiryMonth}/${pm.expiryYear}`}
                />
                <Box sx={{ display: "flex", gap: 1 }}>
                  {!pm.default && (
                    <Button
                      variant="outlined"
                      size="small"
                      sx={secondaryButton}
                      onClick={() => handleSetDefault(pm.paymentMethodId)}
                    >
                      Set as Default
                    </Button>
                  )}
                  <IconButton
                    color="error"
                    onClick={() => handleDeletePayment(pm.paymentMethodId)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography sx={{ mb: 3, color: "gray" }}>No payment methods on file.</Typography>
        )}

        <Divider sx={{ my: 3 }} />

        {/* ADD PAYMENT METHOD */}
        <Typography sx={{ fontWeight: "bold", mb: 2 }}>Add New Payment Method</Typography>
        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
          <TextField label="Card Last 4" value={billing.cardLast4} onChange={(e) => setBilling({ ...billing, cardLast4: e.target.value })} />
          <TextField label="Card Brand" value={billing.cardBrand} onChange={(e) => setBilling({ ...billing, cardBrand: e.target.value })} />
        </Box>
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <TextField label="Expiry Month (MM)" value={billing.expiryMonth} onChange={(e) => setBilling({ ...billing, expiryMonth: e.target.value })} />
          <TextField label="Expiry Year (YYYY)" value={billing.expiryYear} onChange={(e) => setBilling({ ...billing, expiryYear: e.target.value })} />
        </Box>
        <Button variant="contained" sx={primaryButton} onClick={addPayment}>Add Payment Method</Button>
      </Paper>

      <Box sx={{ mt: 4 }}>
       <Button onClick={handleDeleteUser} variant="contained" sx={errorButton} >Delete Customer</Button>
      </Box>

      {/* ------------ PASSWORD CHANGE MODAL ------------ */}
      <Dialog open={passwordModal} onClose={closePasswordModal} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>Change Password</DialogTitle>
        <DialogContent dividers>
          <TextField 
            fullWidth 
            type="password" 
            label="New Password" 
            sx={{ mb: 2 }} 
            value={passwordData.newPassword} 
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} 
          />
          <TextField 
            fullWidth 
            type="password" 
            label="Confirm Password" 
            value={passwordData.confirmPassword} 
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} 
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" sx={secondaryButton} onClick={closePasswordModal}>Cancel</Button>
          <Button variant="contained" sx={primaryButton} onClick={updatePassword}>Save Password</Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
}