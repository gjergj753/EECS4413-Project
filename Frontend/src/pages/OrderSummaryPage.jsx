import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Grid,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function OrderSummaryPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const order = JSON.parse(localStorage.getItem("lastOrder"));

  if (!order || order.id !== orderId) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6">Order not found.</Typography>
        <Button
          variant="contained"
          sx={{ mt: 2, borderRadius: "20px", textTransform: "none" }}
          onClick={() => navigate("/")}
        >
          Return Home
        </Button>
      </Box>
    );
  }

  const total = order.items
    .reduce((sum, item) => sum + item.quantity * item.price, 0)
    .toFixed(2);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        px: { xs: 2, md: 6 },
        py: 4,
         ml: { sm: "240px" },  
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: "900px",
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          backgroundColor: "white",
        }}
      >
        {/* Success Header */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: "green" }} />
          <Typography variant="h4" sx={{ mt: 2, fontWeight: "bold" }}>
            Order Successful!
          </Typography>
          <Typography sx={{ color: "gray", mt: 1 }}>
            Thank you for your purchase.
          </Typography>
        </Box>

        {/* Order Summary Card */}
        <Typography variant="h5" sx={{ mb: 1, fontWeight: "bold" }}>
          Order #{order.id}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={4}>
          {/* SHIPPING INFO */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", mb: 1 }}
            >
              Shipping Information
            </Typography>

            <Typography>{order.shipping.name}</Typography>
            <Typography>{order.shipping.address}</Typography>
            <Typography>{order.shipping.city}</Typography>
            <Typography>{order.shipping.postal}</Typography>
          </Grid>

          {/* PAYMENT INFO */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", mb: 1 }}
            >
              Payment Details
            </Typography>

            <Typography>Card ending in 4242</Typography>
            <Typography>Expiry: {order.billing.expiry}</Typography>
          </Grid>
        </Grid>

        {/* ITEMS LIST */}
        <Typography
          variant="h6"
          sx={{ mt: 4, mb: 1, fontWeight: "bold" }}
        >
          Books Purchased
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {order.items.map((item) => (
          <Box
            key={item.bookId}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography>{item.title}</Typography>
            <Typography>
              {item.quantity} × ${item.price.toFixed(2)}
            </Typography>
          </Box>
        ))}

        <Divider sx={{ my: 3 }} />

        {/* TOTAL */}
        <Typography
          variant="h5"
          sx={{ textAlign: "right", fontWeight: "bold" }}
        >
          Total: ${total}
        </Typography>

        {/* ACTION BUTTONS */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 4,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            sx={{
              flexGrow: { xs: 1, sm: 0 },
              borderRadius: "20px",
              textTransform: "none",
              fontWeight: "bold",
              py: 1.2,
              px: 3,
              borderWidth: "2px",
              borderColor: "#3f51b5",
              color: "#3f51b5",
              "&:hover": {
                borderColor: "#303f9f",
                color: "#303f9f",
                transform: "scale(1.03)",
              },
            }}
            onClick={() => navigate("/orders")}
          >
            View Orders
          </Button>

          <Button
            variant="contained"
            sx={{
              flexGrow: { xs: 1, sm: 0 },
              borderRadius: "20px",
              textTransform: "none",
              fontWeight: "bold",
              py: 1.2,
              px: 3,
              backgroundColor: "#3f51b5",
              "&:hover": {
                backgroundColor: "#303f9f",
                transform: "scale(1.03)",
              },
            }}
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

