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
} from "@mui/material";
import { useAuth } from "../context/AuthContext";

export default function AccountPage() {
  const { user, setUser } = useAuth(); // We'll expose setUser for profile updates
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    shipping: {
      address: "",
      city: "",
      postal: "",
    },
    billing: {
      cardName: "",
      cardNumber: "",
      expiry: "",
    },
  });

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        shipping: user.savedShipping || {
          address: "",
          city: "",
          postal: "",
        },
        billing: user.savedBilling || {
          cardName: "",
          cardNumber: "",
          expiry: "",
        },
      });
    }
  }, [user]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (section, key, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const handleSave = () => {
    const updatedUser = {
      ...user,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      savedShipping: form.shipping,
      savedBilling: form.billing,
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    alert("Profile updated!");
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" mb={3}>
        Edit Profile
      </Typography>

      <Grid container spacing={4}>
        {/* LEFT SIDE – Personal Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Personal Information</Typography>
              <Divider sx={{ my: 2 }} />

              <TextField
                label="First Name"
                fullWidth
                margin="normal"
                value={form.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
              />

              <TextField
                label="Last Name"
                fullWidth
                margin="normal"
                value={form.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
              />

              <TextField
                label="Email"
                fullWidth
                margin="normal"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </CardContent>
          </Card>

          {/* OPTIONAL PASSWORD SECTION */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6">Change Password</Typography>
              <Divider sx={{ my: 2 }} />

              <TextField
                label="New Password"
                type="password"
                fullWidth
                margin="normal"
              />

              <TextField
                label="Confirm Password"
                type="password"
                fullWidth
                margin="normal"
              />
              <Button variant="outlined" sx={{ mt: 1, borderRadius: 10 }}>
                Update Password
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT SIDE – Shipping & Billing */}
        <Grid item xs={12} md={6}>
          {/* SHIPPING */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6">Shipping Address</Typography>
              <Divider sx={{ my: 2 }} />

              <TextField
                label="Address"
                fullWidth
                margin="normal"
                value={form.shipping.address}
                onChange={(e) =>
                  handleNestedChange("shipping", "address", e.target.value)
                }
              />

              <TextField
                label="City"
                fullWidth
                margin="normal"
                value={form.shipping.city}
                onChange={(e) =>
                  handleNestedChange("shipping", "city", e.target.value)
                }
              />

              <TextField
                label="Postal Code"
                fullWidth
                margin="normal"
                value={form.shipping.postal}
                onChange={(e) =>
                  handleNestedChange("shipping", "postal", e.target.value)
                }
              />
            </CardContent>
          </Card>

          {/* BILLING */}
          <Card>
            <CardContent>
              <Typography variant="h6">Billing Information</Typography>
              <Divider sx={{ my: 2 }} />

              <TextField
                label="Cardholder Name"
                fullWidth
                margin="normal"
                value={form.billing.cardName}
                onChange={(e) =>
                  handleNestedChange("billing", "cardName", e.target.value)
                }
              />

              <TextField
                label="Card Number"
                fullWidth
                margin="normal"
                value={form.billing.cardNumber}
                onChange={(e) =>
                  handleNestedChange("billing", "cardNumber", e.target.value)
                }
              />

              <TextField
                label="Expiry (MM/YY)"
                fullWidth
                margin="normal"
                value={form.billing.expiry}
                onChange={(e) =>
                  handleNestedChange("billing", "expiry", e.target.value)
                }
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* SAVE BUTTON */}
      <Button
        variant="contained"
        size="large"
        sx={{
          mt: 3, backgroundColor: "#3f51b5", "&:hover": {
            backgroundColor: "#303f9f",
            transform: "scale(1.03)",
          }, fontWeight: "bold", borderRadius: "20px",
        }}
        onClick={handleSave}
      >
        Save Changes
      </Button>
    </Box>
  );
}
