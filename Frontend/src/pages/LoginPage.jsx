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

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const next = new URLSearchParams(location.search).get("next");
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      navigate(next ? `/${next}` : "/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
  sx={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
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
        <Typography variant="h4" gutterBottom textAlign="center">
          Welcome Back
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            name="email"
            label="Email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            name="password"
            label="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />

          <Button
            variant="contained"
            type="submit"
            fullWidth
            sx={{ mt: 2, py: 1.2 }}
          >
            Log In
          </Button>
        </Box>

        <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
          Don't have an account? <Link to="/sign-up">Sign up</Link>
        </Typography>
      </Paper>
      </Container>
    </Box>
  );

}
