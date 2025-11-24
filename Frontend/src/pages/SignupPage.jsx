import { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Paper,
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
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset error
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });

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
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "90vh",
        ml: { sm: "240px" },
        pt: { xs: "80px", sm: "64px" },
        px: 2,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h4" textAlign="center" gutterBottom>
            Sign Up
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              name="firstName"
              label="First Name"
              value={form.firstName}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />

            <TextField
              name="lastName"
              label="Last Name"
              value={form.lastName}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />

            <TextField
              name="email"
              label="Email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />

            <TextField
              name="password"
              label="Password"
              type="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />

            <TextField
              name="confirm"
              label="Confirm Password"
              type="password"
              value={form.confirm}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />

            <Button
              variant="contained"
              type="submit"
              fullWidth
              disabled={loading}
              sx={{ mt: 2, py: 1.2 }}
            >
              {loading ? "Creating Account..." : "Register"}
            </Button>
          </Box>

          <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
            Already have an account? <Link to="/login">Log in</Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

