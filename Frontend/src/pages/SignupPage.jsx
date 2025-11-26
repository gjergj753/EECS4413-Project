import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Paper,
  Grid,
  Snackbar,
  MenuItem,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  isEmpty,
  isValidCardNumber,
  isValidExpiry,
  isValidCvv,
  detectCardBrand,
} from "../utils/validation";

export default function SignupPage() {
  const { register } = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
    street: "",
    city: "",
    province: "",
    postalCode: "",
    country: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const showMessage = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () =>
    setSnackbar({ ...snackbar, open: false });

  // Same dropdown as Account page
  const months = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) =>
    (currentYear + i).toString()
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // --- REQUIRED FIELDS ---
    Object.keys(form).forEach((key) => {
      if (isEmpty(form[key])) newErrors[key] = "Required";
    });

    // Password match
    if (form.password !== form.confirm) {
      newErrors.confirm = "Passwords do not match.";
    }

    // Card number validation
    if (!isValidCardNumber(form.cardNumber)) {
      newErrors.cardNumber = "Invalid card number.";
    }

    // CVV validation
    if (!isValidCvv(form.cvv)) {
      newErrors.cvv = "Invalid CVV.";
    }

    // Expiry validation
    if (!isValidExpiry(form.expiryMonth, form.expiryYear)) {
      newErrors.expiryMonth = "Invalid expiry date.";
      newErrors.expiryYear = "Invalid expiry date.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      await register(form);

      showMessage("Account created!", "success");
      setTimeout(() => navigate("/account"), 800);

    } catch (err) {
      showMessage(err.message || "Registration failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fafafa",
      }}
    >
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, borderRadius: 3 }} elevation={4}>
          <Typography variant="h5" textAlign="center" sx={{ mb: 3 }}>
            Create Your Account
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            {/* PERSONAL */}
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Personal Information
            </Typography>

            <Grid container spacing={1.5}>
              {[
                { name: "firstName", label: "First Name" },
                { name: "lastName", label: "Last Name" },
                { name: "email", label: "Email" },
              ].map(({ name, label }) => (
                <Grid
                  key={name}
                  item
                  xs={12}
                  sm={name === "email" ? 12 : 6}
                >
                  <TextField
                    fullWidth
                    size="small"
                    name={name}
                    label={label}
                    value={form[name]}
                    onChange={handleChange}
                    error={!!errors[name]}
                    helperText={errors[name]}
                  />
                </Grid>
              ))}

              {/* PASSWORD */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="password"
                  size="small"
                  name="password"
                  label="Password"
                  value={form.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="password"
                  size="small"
                  name="confirm"
                  label="Confirm Password"
                  value={form.confirm}
                  onChange={handleChange}
                  error={!!errors.confirm}
                  helperText={errors.confirm}
                />
              </Grid>
            </Grid>

            {/* ADDRESS */}
            <Typography variant="h6" sx={{ mt: 3, mb: 1.5 }}>
              Address Information
            </Typography>

            <Grid container spacing={1.5}>
              {[
                { name: "street", label: "Street" },
                { name: "city", label: "City" },
                { name: "province", label: "Province" },
                { name: "postalCode", label: "Postal Code" },
                { name: "country", label: "Country" },
              ].map(({ name, label }) => (
                <Grid key={name} item xs={12} sm={name === "street" ? 12 : 6}>
                  <TextField
                    fullWidth
                    size="small"
                    name={name}
                    label={label}
                    value={form[name]}
                    onChange={handleChange}
                    error={!!errors[name]}
                    helperText={errors[name]}
                  />
                </Grid>
              ))}
            </Grid>

            {/* PAYMENT */}
            <Typography variant="h6" sx={{ mt: 3, mb: 1.5 }}>
              Payment Information
            </Typography>

            <Grid container spacing={1.5}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  name="cardNumber"
                  label="Card Number"
                  value={form.cardNumber}
                  onChange={handleChange}
                  error={!!errors.cardNumber}
                  helperText={errors.cardNumber}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  name="expiryMonth"
                  label="Month"
                  value={form.expiryMonth}
                  onChange={handleChange}
                  error={!!errors.expiryMonth}
                  helperText={errors.expiryMonth}
                >
                  {months.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  name="expiryYear"
                  label="Year"
                  value={form.expiryYear}
                  onChange={handleChange}
                  error={!!errors.expiryYear}
                  helperText={errors.expiryYear}
                >
                  {years.map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  name="cvv"
                  label="CVV"
                  value={form.cvv}
                  onChange={handleChange}
                  error={!!errors.cvv}
                  helperText={errors.cvv}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, py: 1.2 }}
            >
              {loading ? "Creating Account..." : "Register"}
            </Button>
          </Box>

          <Typography textAlign="center" sx={{ mt: 2 }}>
            Already have an account? <Link to="/login">Log in</Link>
          </Typography>
        </Paper>

        {/* SNACKBAR */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={closeSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
            onClose={closeSnackbar}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
