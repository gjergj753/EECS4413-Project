import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Snackbar,
  Alert,
  MenuItem,
} from "@mui/material";

import {
  isEmpty,
  isValidCardNumber,
  isValidExpiry,
  isValidCvv,
  detectCardBrand,
} from "../utils/validation";

import { getAddressForUser, updateAddress } from "../api/addressApi";
import {
  getUserPaymentMethods,
  deletePaymentMethod,
  addPaymentMethod,
} from "../api/paymentApi";
import { updateUser } from "../api/userAPi";
import { useAuth } from "../context/AuthContext";


export default function AccountPage() {
  const { user, updatePasswordInContext, setUser } =
    useAuth();

  // --- STATES ---
  const [personal, setPersonal] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [address, setAddress] = useState({
    addressId: null,
    street: "",
    city: "",
    province: "",
    postalCode: "",
    country: "",
  });

  const [payment, setPayment] = useState({
    cardHolderName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });

  const [errors, setErrors] = useState({
    personal: {},
    password: {},
    address: {},
    payment: {},
  });

  // --- SNACKBAR ---
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showMessage = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const clearSection = (section) => {
    setErrors((prev) => ({ ...prev, [section]: {} }));
  };

  // --- LOAD USER PROFILE ---
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        // Personal
        setPersonal({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        });

        // Address
        const addrRes = await getAddressForUser(user.userId, user.authToken);
        if (addrRes.address) {
          setAddress({
            addressId: addrRes.address.addressId,
            street: addrRes.address.street,
            city: addrRes.address.city,
            province: addrRes.address.province,
            postalCode: addrRes.address.postalCode,
            country: addrRes.address.country,
          });
        }

        // Payment
        const payRes = await getUserPaymentMethods(user.userId, user.authToken);

        if (payRes.paymentMethodList?.length > 0) {
          const card = payRes.paymentMethodList[0];
          setPayment({
            cardHolderName: `${user.firstName} ${user.lastName}`,
            cardNumber: `**** **** **** ${card.cardLast4}`,
            expiryMonth: card.expiryMonth,
            expiryYear: card.expiryYear,
            cvv: "",
          });
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };

    loadData();
  }, [user]);

  // ------------------------
  //        HANDLERS
  // ------------------------


  const handleSavePersonal = async () => {
    clearSection("personal");

    const sectionErrors = {};

    if (isEmpty(personal.firstName))
      sectionErrors.firstName = "First name is required.";
    if (isEmpty(personal.lastName))
      sectionErrors.lastName = "Last name is required.";
    if (isEmpty(personal.email))
      sectionErrors.email = "Email is required.";

    if (Object.keys(sectionErrors).length > 0) {
      setErrors((prev) => ({ ...prev, personal: sectionErrors }));
      return;
    }

    try {
      // Update backend
      await updateUser(
        user.userId,
        {
          firstName: personal.firstName,
          lastName: personal.lastName,
          email: personal.email,
        },
        user.authToken
      );

      // Extract password from existing token
      const decoded = atob(user.authToken);
      const password = decoded.split(":")[1]; // keep same password

      // Build new token using the NEW email + SAME password
      const newToken = btoa(`${personal.email}:${password}`);

      // Update user locally (VERY small update)
      const updatedUser = {
        ...user,
        ...personal,
        authToken: newToken,
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      showMessage("Personal info updated!");
    } catch (err) {
      console.error(err);
      showMessage("Failed to update personal info.", "error");
    }
  };




  const handleSavePassword = async () => {
    clearSection("password");

    const sectionErrors = {};

    if (isEmpty(passwords.newPassword))
      sectionErrors.newPassword = "Password is required.";

    if (isEmpty(passwords.confirmPassword))
      sectionErrors.confirmPassword = "Confirm password is required.";

    if (
      !isEmpty(passwords.newPassword) &&
      passwords.newPassword !== passwords.confirmPassword
    )
      sectionErrors.confirmPassword = "Passwords do not match.";

    if (passwords.newPassword.length < 6)
      sectionErrors.newPassword = "Password must be at least 6 characters.";

    if (Object.keys(sectionErrors).length > 0) {
      setErrors((prev) => ({ ...prev, password: sectionErrors }));
      return;
    }

    try {
      await updateUser(
        user.userId,
        { hashedPassword: passwords.newPassword },
        user.authToken
      );

      updatePasswordInContext(passwords.newPassword);

      setPasswords({ newPassword: "", confirmPassword: "" });

      showMessage("Password updated!");
    } catch {
      showMessage("Failed to update password.", "error");
    }
  };

  // ✔ ADDRESS
  const handleSaveAddress = async () => {
    clearSection("address");

    const requiredFields = ["street", "city", "province", "postalCode", "country"];

    const sectionErrors = {};
    requiredFields.forEach((f) => {
      if (isEmpty(address[f])) sectionErrors[f] = "Required";
    });

    if (Object.keys(sectionErrors).length > 0) {
      setErrors((prev) => ({ ...prev, address: sectionErrors }));
      return;
    }

    try {
      await updateAddress(
        address.addressId,
        {
          street: address.street,
          city: address.city,
          province: address.province,
          postalCode: address.postalCode,
          country: address.country,
        },
        user.authToken
      );

      showMessage("Address updated!");
    } catch {
      showMessage("Failed to update address.", "error");
    }
  };

  // ✔ PAYMENT
  const handleSavePayment = async () => {
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
      const existing = await getUserPaymentMethods(user.userId, user.authToken);

      if (existing.paymentMethodList?.length > 0) {
        const old = existing.paymentMethodList[0];
        await deletePaymentMethod(
          old.paymentMethodId,
          user.userId,
          user.authToken
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

      await addPaymentMethod(user.userId, newPm, user.authToken);

      setPayment({
        cardHolderName: payment.cardHolderName,
        cardNumber: `**** **** **** ${last4}`,
        expiryMonth: payment.expiryMonth,
        expiryYear: payment.expiryYear,
        cvv: "",
      });

      showMessage("Payment method updated!");
    } catch (err) {
      console.error(err);
      showMessage("Failed to update payment method.", "error");
    }
  };

  // --- Dropdown lists ---
  const months = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => (currentYear + i).toString());

  // ------------------------
  //        UI LAYOUT
  // ------------------------

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" mb={3}>
        Account Settings
      </Typography>

      <Grid container spacing={4}>
        {/* LEFT COLUMN */}
        <Grid item xs={12} md={6}>
          {/* PERSONAL */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6">Personal Information</Typography>
              <Divider sx={{ my: 2 }} />

              <TextField
                fullWidth
                margin="normal"
                label="First Name"
                value={personal.firstName}
                error={!!errors.personal.firstName}
                helperText={errors.personal.firstName}
                onChange={(e) =>
                  setPersonal({ ...personal, firstName: e.target.value })
                }
              />

              <TextField
                fullWidth
                margin="normal"
                label="Last Name"
                value={personal.lastName}
                error={!!errors.personal.lastName}
                helperText={errors.personal.lastName}
                onChange={(e) =>
                  setPersonal({ ...personal, lastName: e.target.value })
                }
              />

              <TextField
                fullWidth
                margin="normal"
                label="Email"
                value={personal.email}
                error={!!errors.personal.email}
                helperText={errors.personal.email}
                onChange={(e) =>
                  setPersonal({ ...personal, email: e.target.value })
                }
              />

              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handleSavePersonal}
              >
                Save Personal Info
              </Button>
            </CardContent>
          </Card>

          {/* PASSWORD */}
          <Card>
            <CardContent>
              <Typography variant="h6">Change Password</Typography>
              <Divider sx={{ my: 2 }} />

              <TextField
                type="password"
                fullWidth
                margin="normal"
                label="New Password"
                value={passwords.newPassword}
                error={!!errors.password.newPassword}
                helperText={errors.password.newPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, newPassword: e.target.value })
                }
              />

              <TextField
                type="password"
                fullWidth
                margin="normal"
                label="Confirm Password"
                value={passwords.confirmPassword}
                error={!!errors.password.confirmPassword}
                helperText={errors.password.confirmPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    confirmPassword: e.target.value,
                  })
                }
              />

              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handleSavePassword}
              >
                Save Password
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT COLUMN */}
        <Grid item xs={12} md={6}>
          {/* ADDRESS */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6">Address Information</Typography>
              <Divider sx={{ my: 2 }} />

              {[
                { key: "street", label: "Street" },
                { key: "city", label: "City" },
                { key: "province", label: "Province" },
                { key: "postalCode", label: "Postal Code" },
                { key: "country", label: "Country" },
              ].map(({ key, label }) => (
                <TextField
                  key={key}
                  fullWidth
                  margin="normal"
                  label={label}
                  value={address[key]}
                  error={!!errors.address[key]}
                  helperText={errors.address[key]}
                  onChange={(e) =>
                    setAddress({ ...address, [key]: e.target.value })
                  }
                />
              ))}

              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handleSaveAddress}
              >
                Save Address
              </Button>
            </CardContent>
          </Card>

          {/* PAYMENT */}
          <Card>
            <CardContent>
              <Typography variant="h6">Payment Information</Typography>
              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                {/* Cardholder Name */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Cardholder Name"
                    value={payment.cardHolderName}
                    onChange={(e) =>
                      setPayment({
                        ...payment,
                        cardHolderName: e.target.value,
                      })
                    }
                  />
                </Grid>

                {/* Card Number */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Card Number"
                    value={payment.cardNumber}
                    error={!!errors.payment.cardNumber}
                    helperText={errors.payment.cardNumber}
                    onFocus={() => {
                      // If masked, clear so user can type a real card number
                      if (payment.cardNumber.startsWith("****")) {
                        setPayment({ ...payment, cardNumber: "" });
                      }
                    }}
                    onChange={(e) =>
                      setPayment({ ...payment, cardNumber: e.target.value })
                    }
                  />
                </Grid>

                {/* Expiry Month */}
                <Grid item xs={6} sm={3}>
                  <TextField
                    select
                    fullWidth
                    label="Expiry Month"
                    value={payment.expiryMonth}
                    error={!!errors.payment.expiryMonth}
                    helperText={errors.payment.expiryMonth}
                    onChange={(e) =>
                      setPayment({
                        ...payment,
                        expiryMonth: e.target.value,
                      })
                    }
                  >
                    {months.map((m) => (
                      <MenuItem key={m} value={m}>
                        {m}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Expiry Year */}
                <Grid item xs={6} sm={3}>
                  <TextField
                    select
                    fullWidth
                    label="Expiry Year"
                    value={payment.expiryYear}
                    error={!!errors.payment.expiryYear}
                    helperText={errors.payment.expiryYear}
                    onChange={(e) =>
                      setPayment({
                        ...payment,
                        expiryYear: e.target.value,
                      })
                    }
                  >
                    {years.map((y) => (
                      <MenuItem key={y} value={y}>
                        {y}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* CVV */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="CVV"
                    value={payment.cvv}
                    error={!!errors.payment.cvv}
                    helperText={errors.payment.cvv}
                    onChange={(e) =>
                      setPayment({ ...payment, cvv: e.target.value })
                    }
                  />
                </Grid>
              </Grid>

              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handleSavePayment}
              >
                Save Payment Method
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}


