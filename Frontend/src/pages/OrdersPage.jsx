import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  CircularProgress,
  Pagination
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserOrders } from "../api/orderApi";

export default function OrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  useEffect(() => {
    if (!user) return;

    async function loadOrders() {
      try {
        const data = await getUserOrders(user.userId, user.authToken);
        const sorted = (data.orderList || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sorted);
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [user]);

  if (loading) {
    return (
      <Box
        sx={{
          ml: { sm: "240px" },
          mt: 10,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // slice for pagination
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginatedOrders = orders.slice(startIndex, startIndex + PAGE_SIZE);
  const totalPages = Math.ceil(orders.length / PAGE_SIZE);

  return (
    <Box
      sx={{
        ml: { sm: "240px" },
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

        {orders.length === 0 && (
          <Typography sx={{ textAlign: "center", fontStyle: "italic", color: "gray" }}>
            You have no orders yet.
          </Typography>
        )}

        {paginatedOrders.map((order) => (
          <Paper
            key={order.orderId}
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
                Order #{order.orderId}
              </Typography>

              <Typography sx={{ fontWeight: "bold" }}>
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </Typography>
            </Box>

            <Divider />

            {/* ITEMS */}
            <Box sx={{ p: 2 }}>
              {order.orderItemList.map((item) => (
                <Box
                  key={item.orderItemId}
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
                      {item.book.title}
                    </Typography>
                    <Typography sx={{ color: "gray" }}>
                      Quantity: {item.quantity}
                    </Typography>
                    <Typography sx={{ color: "gray" }}>
                      Price: ${item.price.toFixed(2)}
                    </Typography>
                  </Box>

                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/book/${item.book.bookId}`)}
                    sx={{
                      borderRadius: "20px",
                      textTransform: "none",
                      px: 3,
                      fontWeight: "bold",
                    }}
                  >
                    View Book
                  </Button>
                </Box>
              ))}
            </Box>

            <Divider />
            {/* TOTAL */}
            <Box sx={{ p: 2, textAlign: "right" }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Total: ${order.totalPrice.toFixed(2)}
              </Typography>
            </Box>

            {/* VIEW ORDER DETAILS BUTTON */}
            <Box sx={{ p: 2, textAlign: "right" }}>
              <Button
                variant="contained"
                onClick={() => navigate(`/orders/${order.orderId}`)}
                sx={{
                  borderRadius: "20px",
                  textTransform: "none",
                  px: 3,
                  fontWeight: "bold",
                  mt: 1
                }}
              >
                View Order Details
              </Button>
            </Box>


          </Paper>
        ))}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
