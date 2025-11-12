import { Container, Typography, Button } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <Container sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>My Account</Typography>
      <Typography variant="body1">Welcome {user.firstName}! </Typography>
    </Container>
  );
}
