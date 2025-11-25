import { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Paper,
  Grid,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // validation functions...
  function isValidCardNumber(num) {
    return /^[0-9]{16}$/.test(num);
  }

  function isValidCVV(cvv) {
    return /^[0-9]{3,4}$/.test(cvv);
  }

  function isValidPostal(code) {
    return /^[A-Za-z0-9 ]{4,10}$/.test(code);
  }

  function isValidExpiry(month, year) {
    const m = parseInt(month);
    const y = parseInt(year);
    if (!m || !y) return false;
    if (m < 1 || m > 12) return false;

    const now = new Date();
    const expiry = new Date(y, m - 1);
    return expiry >= new Date(now.getFullYear(), now.getMonth());
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }

    for (const key in form) {
      if (!form[key]) {
        setError("Please fill in all fields.");
        return;
      }
    }

    if (!isValidPostal(form.postalCode)) {
      setError("Invalid postal code.");
      return;
    }
    if (!isValidCardNumber(form.cardNumber)) {
      setError("Card number must be 16 digits.");
      return;
    }
    if (!isValidCVV(form.cvv)) {
      setError("CVV must be 3–4 digits.");
      return;
    }
    if (!isValidExpiry(form.expiryMonth, form.expiryYear)) {
      setError("Expiry date is invalid or in the past.");
      return;
    }

    try {
      setLoading(true);
      await register(form);
      navigate("/account");
    } catch (err) {
      setError(err.message);
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
      alignItems: "flex-start",
      backgroundColor: "#fafafa",
      py: { xs: 2, sm: 4 },
      px: { xs: 1.5, sm: 2 },
    }}
  >
    <Container maxWidth="sm"> 
      {/* maxWidth="sm" = ideal mobile/tablet width */}
      
      <Paper
        elevation={4}
        sx={{
          p: { xs: 2.5, sm: 4 },
          borderRadius: 3,
          backgroundColor: "#fff",
        }}
      >
        <Typography 
          variant="h5" 
          textAlign="center" 
          sx={{ mb: { xs: 2, sm: 3 }, fontWeight: 600 }}
        >
          Create Your Account
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          
          {/* PERSONAL INFO */}
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Personal Information
          </Typography>

          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="firstName"
                label="First Name"
                size="small"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="lastName"
                label="Last Name"
                size="small"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="email"
                label="Email"
                size="small"
                value={form.email}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="password"
                type="password"
                label="Password"
                size="small"
                value={form.password}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="confirm"
                type="password"
                label="Confirm Password"
                size="small"
                value={form.confirm}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>

          {/* ADDRESS */}
          <Typography variant="h6" sx={{ mt: 3, mb: 1.5 }}>
            Address Information
          </Typography>

          <Grid container spacing={1.5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="street"
                label="Street Address"
                size="small"
                value={form.street}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="city"
                label="City"
                size="small"
                value={form.city}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="province"
                label="Province"
                size="small"
                value={form.province}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="postalCode"
                label="Postal Code"
                size="small"
                value={form.postalCode}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="country"
                label="Country"
                size="small"
                value={form.country}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>

          {/* PAYMENT */}
          <Typography variant="h6" sx={{ mt: 3, mb: 1.5 }}>
            Payment Information
          </Typography>

          <Grid container spacing={1.5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="cardNumber"
                label="Card Number"
                size="small"
                value={form.cardNumber}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                name="expiryMonth"
                label="Expiry Month (MM)"
                size="small"
                value={form.expiryMonth}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                name="expiryYear"
                label="Expiry Year (YYYY)"
                size="small"
                value={form.expiryYear}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="cvv"
                label="CVV"
                size="small"
                value={form.cvv}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, py: 1.2, textTransform: "none" }}
          >
            {loading ? "Creating Account..." : "Register"}
          </Button>
        </Box>

        <Typography textAlign="center" sx={{ mt: 2.5 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ fontWeight: 500 }}>
            Log in
          </Link>
        </Typography>
      </Paper>
    </Container>
  </Box>
);

}



