import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Paper,
  Divider,
  Button,
  Alert,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

import { fetchBookById } from "../api/catalogAPI";
import {
  isEmpty,
  isValidCardNumber,
  isValidExpiry,
  isValidCvv,
  detectCardBrand,
} from "../utils/validation";

import { getAddressForUser } from "../api/addressApi";
import { getUserDefaultPaymentMethod } from "../api/paymentApi";
import { checkoutOrder } from "../api/checkoutApi";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [savedAddress, setSavedAddress] = useState(null);
  const [savedPayment, setSavedPayment] = useState(null);

  const [useSavedInfo, setUseSavedInfo] = useState(true);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({}); // <-- NEW

  const [shipping, setShipping] = useState({
    street: "",
    city: "",
    province: "",
    postalCode: "",
    country: "",
  });

  const [billing, setBilling] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { redirectTo: "/checkout" } });
      return;
    }

    const loadData = async () => {
      try {
        const addrRes = await getAddressForUser(user.userId, user.authToken);
        if (addrRes.address) setSavedAddress(addrRes.address);

        const payRes = await getUserDefaultPaymentMethod(
          user.userId,
          user.authToken
        );
        if (payRes) setSavedPayment(payRes);
      } catch (err) {
        console.error("Failed to load checkout info:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (!user) return null;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  // ------------------------------
  // VALIDATION
  // ------------------------------
  const validateForm = () => {
    const newErrors = {};

    if (useSavedInfo) {
      return newErrors; // no validation needed
    }

    // Shipping validation
    ["street", "city", "province", "postalCode", "country"].forEach((field) => {
      if (isEmpty(shipping[field])) {
        newErrors[field] = "Required";
      }
    });

    // Billing validation
    if (isEmpty(billing.cardholderName))
      newErrors.cardholderName = "Required";

    if (!isValidCardNumber(billing.cardNumber))
      newErrors.cardNumber = "Invalid card number";

    if (!isValidCvv(billing.cvv)) newErrors.cvv = "Invalid CVV";

    if (!isValidExpiry(billing.expiryMonth, billing.expiryYear)) {
      newErrors.expiryMonth = "Invalid expiry date";
      newErrors.expiryYear = "Invalid expiry date";
    }

    return newErrors;
  };

  // PLACE ORDER
  const validateStock = async () => {
    for (const item of cartItems) {
      const freshData = await fetchBookById(item.book.bookId);
      const freshBook = freshData.book;

      if (!freshBook) {
        setError(`"${item.book.title}" no longer exists.`);
        return false;
      }

      if (freshBook.quantity < item.quantity) {
        setError(
          `Not enough stock for "${freshBook.title}". Only ${freshBook.quantity} left.`
        );
        return false;
      }
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    setError("");
    setErrors({});

    const ok = await validateStock();
    if (!ok) return;

    if (!savedAddress && useSavedInfo) {
      setError("No saved address found. Please add one in your Account.");
      return;
    }

    if (useSavedInfo && !savedPayment) {
      setError("You must have a saved payment method to use this option.");
      return;
    }

    // Custom form validation
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setError("Please fix the highlighted fields.");
      return;
    }

    // Build payload
    let payload = { userId: user.userId };

    if (useSavedInfo) {
      payload.addressId = savedAddress.addressId;
      payload.paymentMethodId = savedPayment.paymentMethodId;
    } else {
      payload.temporaryAddress = { ...shipping };
      payload.saveAddress = false;

      payload.temporaryPayment = {
        cardholderName: billing.cardholderName,
        cardNumber: billing.cardNumber.replace(/\s+/g, ""),
        cardBrand: detectCardBrand(billing.cardNumber),
        cvv: billing.cvv,
        expiryMonth: billing.expiryMonth,
        expiryYear: billing.expiryYear,
      };

      payload.savePaymentMethod = false;
    }

    try {
      const data = await checkoutOrder(payload, user.authToken);

      if (data.order) {
        clearCart();
        navigate(`/order-success/${data.order.orderId}`, {
          state: {
            shipping: useSavedInfo
              ? savedAddress
              : shipping,
            billing: useSavedInfo
              ? { last4: savedPayment.cardLast4 }
              : {
                last4: billing.cardNumber.slice(-4),
                expiryMonth: billing.expiryMonth,
                expiryYear: billing.expiryYear,
              },
          },
        });
      } else {
        setError(data.message || "Checkout failed");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", width: "100%", px: { xs: 2, md: 6 }, py: 4 }}>
      <Paper
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: "1200px",
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          backgroundColor: "white",
        }}
      >
        <Typography variant="h4" fontWeight="bold" mb={4} textAlign="center">
          Checkout
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 4,
          }}
        >
          {/* LEFT COLUMN */}
          <Box>
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }} elevation={1}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={useSavedInfo}
                    onChange={(e) => setUseSavedInfo(e.target.checked)}
                  />
                }
                label="Use saved shipping & billing information"
              />
            </Paper>

            {useSavedInfo ? (
              <Paper sx={{ p: 3, borderRadius: 3 }} elevation={2}>
                <Typography variant="h6">Saved Information</Typography>
                <Divider sx={{ my: 2 }} />

                <Typography fontWeight="bold">Shipping:</Typography>
                <Typography>{savedAddress.street}</Typography>
                <Typography>{savedAddress.city}</Typography>
                <Typography>{savedAddress.postalCode}</Typography>

                <Typography fontWeight="bold" mt={3}>
                  Billing:
                </Typography>
                {savedPayment ? (
                  <Typography>Card ending in {savedPayment.cardLast4}</Typography>
                ) : (
                  <Typography color="error">No saved payment method</Typography>
                )}
              </Paper>
            ) : (
              <Paper sx={{ p: 3, borderRadius: 3 }} elevation={2}>
                <Typography variant="h6">Shipping Information</Typography>
                <Divider sx={{ my: 2 }} />

                {[
                  ["street", "Street"],
                  ["city", "City"],
                  ["province", "Province"],
                  ["postalCode", "Postal Code"],
                  ["country", "Country"],
                ].map(([key, label]) => (
                  <TextField
                    key={key}
                    label={label}
                    fullWidth
                    sx={{ mb: 2 }}
                    value={shipping[key]}
                    onChange={(e) =>
                      setShipping({ ...shipping, [key]: e.target.value })
                    }
                    error={!!errors[key]}
                    helperText={errors[key]}
                  />
                ))}

                <Typography variant="h6" mt={3}>
                  Billing Information
                </Typography>
                <Divider sx={{ my: 2 }} />

                <TextField
                  label="Cardholder Name"
                  fullWidth
                  sx={{ mb: 2 }}
                  value={billing.cardholderName}
                  onChange={(e) =>
                    setBilling({
                      ...billing,
                      cardholderName: e.target.value,
                    })
                  }
                  error={!!errors.cardholderName}
                  helperText={errors.cardholderName}
                />

                <TextField
                  label="Card Number"
                  fullWidth
                  sx={{ mb: 2 }}
                  value={billing.cardNumber}
                  onChange={(e) =>
                    setBilling({ ...billing, cardNumber: e.target.value })
                  }
                  error={!!errors.cardNumber}
                  helperText={errors.cardNumber}
                />

                <TextField
                  label="Expiry Month (MM)"
                  fullWidth
                  sx={{ mb: 2 }}
                  value={billing.expiryMonth}
                  onChange={(e) =>
                    setBilling({ ...billing, expiryMonth: e.target.value })
                  }
                  error={!!errors.expiryMonth}
                  helperText={errors.expiryMonth}
                />

                <TextField
                  label="Expiry Year (YYYY)"
                  fullWidth
                  sx={{ mb: 2 }}
                  value={billing.expiryYear}
                  onChange={(e) =>
                    setBilling({ ...billing, expiryYear: e.target.value })
                  }
                  error={!!errors.expiryYear}
                  helperText={errors.expiryYear}
                />

                <TextField
                  label="CVV"
                  fullWidth
                  sx={{ mb: 2 }}
                  value={billing.cvv}
                  onChange={(e) =>
                    setBilling({ ...billing, cvv: e.target.value })
                  }
                  error={!!errors.cvv}
                  helperText={errors.cvv}
                />
              </Paper>
            )}
          </Box>

          {/* RIGHT COLUMN — ORDER SUMMARY */}
          <Box>
            <Paper sx={{ p: 3, borderRadius: 3 }} elevation={2}>
              <Typography variant="h6">Order Summary</Typography>
              <Divider sx={{ my: 2 }} />

              {cartItems.map((item) => (
                <Box
                  key={item.cartItemId}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography>{item.book.title}</Typography>
                  <Typography>
                    {item.quantity} × ${item.book.price.toFixed(2)}
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Typography variant="h5" sx={{ textAlign: "right", fontWeight: "bold" }}>
                Total: $
                {cartItems
                  .reduce(
                    (sum, item) => sum + item.book.price * item.quantity,
                    0
                  )
                  .toFixed(2)}
              </Typography>
            </Paper>

            <Button
              variant="contained"
              fullWidth
              size="large"
              sx={{
                mt: 3,
                py: 1.5,
                borderRadius: "20px",
                textTransform: "none",
                fontWeight: "bold",
                fontSize: "1.1rem",
              }}
              onClick={handlePlaceOrder}
            >
              Place Order
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}



