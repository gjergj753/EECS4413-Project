import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Divider, FormControlLabel, Checkbox, Alert, Snackbar,
  List, ListItem, ListItemText, IconButton, Chip, MenuItem, Grid
} from "@mui/material";
import { primaryButton, secondaryButton, errorButton } from "../utils/buttonStyles";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../context/AuthContext";
import { getAllCustomers, updateCustomerDetails, updateCustomerPassword, deleteCustomer } from "../api/adminApi";
import { getAddressForUser, updateAddress } from "../api/addressApi";
import { getUserPaymentMethods, addPaymentMethod, deletePaymentMethod, setUserDefaultPaymentMethod } from "../api/paymentApi";
import {
  isEmpty,
  isValidCardNumber,
  isValidExpiry,
  isValidCvv,
  detectCardBrand,
} from "../utils/validation";

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

  const [payment, setPayment] = useState({
    cardHolderName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });

  const [errors, setErrors] = useState({
    payment: {},
  });

  // --- Dropdown lists ---
  const months = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => (currentYear + i).toString());

  // ---------------- LOAD CUSTOMER DATA ----------------
  useEffect(() => {
    async function loadCustomer() {
      try {
        const customers = await getAllCustomers();
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

        // Populate address if any
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

  const clearSection = (section) => {
    setErrors((prev) => ({ ...prev, [section]: {} }));
  };

  // ---------------- UPDATE PERSONAL ----------------
  const updatePersonal = async () => {
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
        showAlert("warning", "No address entered. Shipping information not updated.");
      }
    } catch (err) {
      console.error("Failed to update address", err);
      showAlert("error", "Failed to update shipping address.");
    }
  };

  // ---------------- ADD PAYMENT HANDLER ----------------
  const handleSavePayment = async () => {
    if (!customer) return;
    
    clearSection("payment");

    const sectionErrors = {};

    const raw = payment.cardNumber.startsWith("****")
      ? null
      : payment.cardNumber.replace(/\s+/g, "");

    if (raw && !isValidCardNumber(raw))
      sectionErrors.cardNumber = "Invalid card number.";

    if (!isValidExpiry(payment.expiryMonth, payment.expiryYear)) {
      sectionErrors.expiryMonth = "Invalid expiry date.";
      sectionErrors.expiryYear = "Invalid expiry date.";
    }

    if (isEmpty(payment.cvv)) sectionErrors.cvv = "CVV is required.";
    else if (!isValidCvv(payment.cvv)) sectionErrors.cvv = "Invalid CVV.";

    if (Object.keys(sectionErrors).length > 0) {
      setErrors((prev) => ({ ...prev, payment: sectionErrors }));
      return;
    }

    try {
      const existing = await getUserPaymentMethods(customer.userId, authToken);

      if (existing.paymentMethodList?.length > 0) {
        const old = existing.paymentMethodList[0];
        await deletePaymentMethod(
          old.paymentMethodId,
          customer.userId,
          authToken
        );
      }

      const last4 = raw
        ? raw.slice(-4)
        : existing.paymentMethodList[0]?.cardLast4;

      const newPm = {
        cardLast4: last4,
        cardBrand: detectCardBrand(raw || last4),
        expiryMonth: payment.expiryMonth,
        expiryYear: payment.expiryYear,
        isDefault: true,
      };

      await addPaymentMethod(customer.userId, newPm, authToken);

      setPayment({
        cardHolderName: payment.cardHolderName,
        cardNumber: `**** **** **** ${last4}`,
        expiryMonth: payment.expiryMonth,
        expiryYear: payment.expiryYear,
        cvv: "",
      });

      showAlert("success", "Billing Information updated!");
      loadPaymentMethods(customer.userId);
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to update billing information.");
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
      showAlert("error", "Failed to delete payment method.");
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
      showAlert("error", "Failed to set default payment method.");
    }
  };

  // ---------------- DELETE USER ----------------
  const handleDeleteCustomer = async () => {
    if (!customer) return;
    
    if (!window.confirm("Are you sure you want to delete this customer?")) {
      return;
    }

    try {
      await deleteCustomer(customer.userId);
      navigate("/admin/customers");
    } catch (err) {
      console.error("Failed to delete customer", err);
      showAlert("error", "Failed to delete customer.");
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
        {/* <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
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
        </Box> */}
        <Box>
         <Button 
            variant="outlined" 
            sx={secondaryButton} 
            onClick={() => navigate("/admin/customers")}
          >
            ← Back to Customers
          </Button>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center", m: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
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
          <Button variant="contained" sx={primaryButton} onClick={updatePersonal}>Update Personal Info</Button>
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
          <Button variant="contained" sx={primaryButton} onClick={updateShipping}>Update Shipping Info</Button>
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
        
        <Box 
          sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mb: 2, }} 
        >
          {/* Cardholder Name */}
          <TextField
            fullWidth
            label="Cardholder Name"
            value={payment.cardHolderName}
            onChange={(e) =>
              setPayment({ ...payment, cardHolderName: e.target.value })
            }
          />

          {/* Card Number */}
          <TextField
            fullWidth
            label="Card Number"
            value={payment.cardNumber}
            error={!!errors.payment.cardNumber}
            helperText={errors.payment.cardNumber}
            onFocus={() => {
              if (payment.cardNumber.startsWith("****")) {
                setPayment({ ...payment, cardNumber: "" });
              }
            }}
            onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })}
          />
        </Box>

        <Box
          sx={{ display: "grid", gridTemplateColumns: { xs: "0.5fr 0.5fr 0.5fr", md: "1fr 1fr 1fr" }, gap: 2, }}
        >
          {/* Expiry Month */}
          <TextField
            select
            fullWidth
            label="Exp Month"
            value={payment.expiryMonth}
            error={!!errors.payment.expiryMonth}
            helperText={errors.payment.expiryMonth}
            onChange={(e) =>
              setPayment({ ...payment, expiryMonth: e.target.value })
            }
          >
            {months.map((m) => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))}
          </TextField>

          {/* Expiry Year */}
          <TextField
            select
            fullWidth
            label="Exp Year"
            value={payment.expiryYear}
            error={!!errors.payment.expiryYear}
            helperText={errors.payment.expiryYear}
            onChange={(e) =>
              setPayment({ ...payment, expiryYear: e.target.value })
            }
          >
            {years.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </TextField>

          {/* CVV */}
          <TextField
            fullWidth
            label="CVV"
            value={payment.cvv}
            error={!!errors.payment.cvv}
            helperText={errors.payment.cvv}
            onChange={(e) => setPayment({ ...payment, cvv: e.target.value })}
          />
        </Box>

        <Button variant="contained" sx={{ ...primaryButton, mt: 2 }} onClick={handleSavePayment}>
          Add Payment Method
        </Button>

      </Paper>

      <Box sx={{ mt: 4 }}>
       <Button onClick={handleDeleteCustomer} variant="contained" sx={errorButton}>Delete Customer</Button>
      </Box>

      {/* ------------ PASSWORD CHANGE MODAL ------------ */}
      <Dialog open={passwordModal} onClose={closePasswordModal} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>Change Customer's Password</DialogTitle>
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
