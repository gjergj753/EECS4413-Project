import React from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { mockOrders } from "../data/orders";

export default function OrdersPage() {
  const navigate = useNavigate();
  const orders = mockOrders;

  return (
    <Box
      sx={{
        ml: { sm: "240px" },            // match sidebar
        display: "flex",
        justifyContent: "center",
        width: "100%",
           px: { xs: 5, md: 20, lg: 35 },
        py: 4,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: "900px" }}>
        <Typography
          variant="h4"
          sx={{ mb: 4, fontWeight: "bold", textAlign: "center" }}
        >
          Your Orders
        </Typography>

        {orders.map((order) => (
          <Paper
            key={order.id}
            elevation={3}
            sx={{
              mb: 4,
              borderRadius: 3,
              overflow: "hidden",
              transition: "0.2s ease",
              "&:hover": { boxShadow: 6 },
            }}
          >
            {/* HEADER */}
            <Box
              sx={{
                backgroundColor: "#f3f3f3",
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography sx={{ fontWeight: "bold" }}>
                Placed on {order.date}
              </Typography>

              <Typography sx={{ fontWeight: "bold" }}>
                Total: ${order.total.toFixed(2)}
              </Typography>
            </Box>

            <Divider />

            {/* ITEMS */}
            <Box sx={{ p: 2 }}>
              {order.items.map((item) => (
                <Box
                  key={item.bookId}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ fontWeight: "bold" }}>
                      {item.title}
                    </Typography>
                    <Typography sx={{ color: "gray" }}>
                      Quantity: {item.quantity}
                    </Typography>
                    <Typography sx={{ color: "gray" }}>
                      Price: ${item.price.toFixed(2)}
                    </Typography>
                  </Box>

                  {/* VIEW BOOK BUTTON */}
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/book/${item.bookId}`)}
                    sx={{
                      borderRadius: "20px",
                      textTransform: "none",
                      px: 3,
                      fontWeight: "bold",
                      "&:hover": { transform: "scale(1.04)" },
                    }}
                  >
                    View Book
                  </Button>
                </Box>
              ))}
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
