import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Divider,
    CircularProgress,
    Button
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserOrderById } from "../api/orderApi";

export default function OrderDetailsPage() {
    const { orderId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        async function loadOrder() {
            try {
                const data = await getUserOrderById(orderId, user.authToken);
                setOrder(data.order); // extract nested order object
            } catch (err) {
                console.error("Failed to load order:", err);
            } finally {
                setLoading(false);
            }
        }

        loadOrder();
    }, [orderId, user]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!order) {
        return (
            <Box sx={{ textAlign: "center", mt: 10 }}>
                <Typography variant="h6">Order not found.</Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                ml: { sm: "200px" },
                px: { xs: 2, md: 6, lg: 10 },
                py: 5,
                display: "flex",
                justifyContent: "center",
                width: "100%",
            }}
        >
            <Paper
                elevation={4}
                sx={{
                    width: "100%",
                    maxWidth: "1400px",         // WIDER WIDTH
                    p: 5,
                    borderRadius: 4,
                }}
            >
                {/* HEADER */}
                <Typography variant="h4" fontWeight="bold" textAlign="center" mb={2}>
                    Order #{order.orderId}
                </Typography>



                <Typography textAlign="center" color="text.secondary" mb={4}>
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                </Typography>

                <Divider sx={{ my: 4 }} />

                {/* TWO COLUMN LAYOUT */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", lg: "2.2fr 1fr" },
                        gap: 6,
                    }}
                >
                    {/* LEFT: Items */}
                    <Box>
                        <Typography variant="h5" fontWeight="bold" mb={3}>
                            Items in Order
                        </Typography>

                        {order.orderItemList.map((item) => (
                            <Paper
                                key={item.orderItemId}
                                elevation={1}
                                sx={{
                                    display: "flex",
                                    p: 3,
                                    mb: 3,
                                    borderRadius: 3,
                                    gap: 3,
                                    alignItems: "flex-start",
                                }}
                            >
                                <img
                                    src={item.book.imageUrl}
                                    alt={item.book.title}
                                    style={{
                                        width: "120px",
                                        height: "170px",
                                        objectFit: "cover",
                                        borderRadius: "10px",
                                    }}
                                />

                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography fontSize="1.25rem" fontWeight="bold">
                                        {item.book.title}
                                    </Typography>

                                    <Typography color="text.secondary" sx={{ mb: 1 }}>
                                        {item.book.author}
                                    </Typography>

                                    <Typography>
                                        Unit Price: ${(item.book.price ?? 0).toFixed(2)}
                                    </Typography>

                                    <Typography>
                                        Quantity: {item.quantity}
                                    </Typography>

                                    <Typography fontWeight="bold" sx={{ mt: 1 }}>
                                        Item Total: ${(item.price ?? 0).toFixed(2)}
                                    </Typography>
                                </Box>
                            </Paper>
                        ))}
                    </Box>

                    {/* RIGHT: Summary */}
                    <Paper
                        elevation={2}
                        sx={{
                            p: 4,
                            borderRadius: 3,
                            height: "fit-content",
                            position: "sticky",
                            top: 120,
                        }}
                    >
                        <Typography variant="h5" fontWeight="bold" mb={3}>
                            Order Summary
                        </Typography>

                        <Divider sx={{ mb: 3 }} />

                        <Box sx={{ mb: 3 }}>
                            <Typography fontWeight="bold" mb={1}>
                                Buyer
                            </Typography>
                            <Typography>
                                {order.user.firstName} {order.user.lastName}
                            </Typography>
                            <Typography color="text.secondary">
                                {order.user.email}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            textAlign="right"
                            color="primary"
                        >
                            Total: ${(order.totalPrice ?? 0).toFixed(2)}
                        </Typography>

                        <Button
                            variant="contained"
                            fullWidth
                            sx={{
                                mt: 4,
                                py: 1.5,
                                borderRadius: "20px",
                                fontSize: "1.1rem",
                                fontWeight: "bold",
                            }}
                            onClick={() => navigate("/orders")}
                        >
                            Back to My Orders
                        </Button>
                    </Paper>
                </Box>
            </Paper>
        </Box>
    );

}
