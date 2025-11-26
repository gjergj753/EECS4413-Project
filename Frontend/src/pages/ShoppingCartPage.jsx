import React from "react";
import {
    Box,
    Typography,
    Button,
    IconButton,
    Divider,
    Paper,
    CardMedia,
    CardContent
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ShoppingCartPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const {
        cartItems,
        increaseQty,
        decreaseQty,
        removeFromCart,
        cartTotal,
    } = useCart();

    const handleCheckout = () => {
        if (!user) {
            navigate("/login?next=checkout");
            return;
        }
        navigate("/checkout");
    };

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                px: { xs: 2, md: 30, lg: 50 },
                py: 4,
            }}
        >
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
                {/* Header */}
                <Typography
                    variant="h4"
                    sx={{ fontWeight: "bold", mb: 4, textAlign: "center" }}
                >
                    Shopping Cart
                </Typography>

                {/* EMPTY CART */}
                {cartItems.length === 0 ? (
                    <Typography variant="h6" sx={{ textAlign: "center", mt: 5 }}>
                        Your cart is empty.
                    </Typography>
                ) : (
                    <Box>
                        {/* CART ITEMS */}
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                                gap: 3,
                                mb: 4,
                            }}
                        >
                            {cartItems.map((item) => (
                                <Paper
                                    key={item.cartItemId}
                                    elevation={2}
                                    sx={{
                                        display: "flex",
                                        p: 2,
                                        borderRadius: 3,
                                        alignItems: "flex-start",
                                        gap: 2,
                                    }}
                                >
                                    {/* IMAGE */}
                                    <CardMedia
                                        component="img"
                                        sx={{
                                            width: { xs: 90, sm: 110, md: 140 },
                                            height: { xs: 120, sm: 150, md: 200 },
                                            objectFit: "cover",
                                            borderRadius: "8px",
                                        }}
                                        image={item.book.imageUrl}
                                        alt={item.book.title}
                                    />

                                    {/* ITEM INFO */}
                                    <CardContent
                                        sx={{
                                            flexGrow: 1,
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "space-between",
                                            p: 0,
                                        }}
                                    >
                                        {/* Title + Author + Price */}
                                        <Box>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontSize: { xs: "1rem", md: "1.3rem" },
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                {item.book.title}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: "text.secondary",
                                                    fontSize: { xs: "0.85rem", md: "1rem" },
                                                }}
                                            >
                                                {item.book.author}
                                            </Typography>

                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    mt: 1,
                                                    fontSize: { xs: "1rem", md: "1.15rem" },
                                                }}
                                            >
                                                Price:{" "}
                                                <strong>${item.book.price.toFixed(2)}</strong>
                                            </Typography>
                                        </Box>

                                        {/* Quantity Controls */}
                                        <Box
                                            sx={{ display: "flex", alignItems: "center", mt: { xs: 1.5, md: 2 } }}
                                        >
                                            <IconButton
                                                onClick={() =>
                                                    decreaseQty(item.book.bookId, item.cartItemId)
                                                }
                                            >
                                                <RemoveIcon fontSize="small" />
                                            </IconButton>

                                            <Typography
                                                sx={{
                                                    mx: 2,
                                                    fontSize: { xs: "1rem", md: "1.2rem" },
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                {item.quantity}
                                            </Typography>

                                            <IconButton
                                                onClick={() =>
                                                    increaseQty(item.book.bookId, item.cartItemId)
                                                }
                                            >
                                                <AddIcon fontSize="small" />
                                            </IconButton>

                                            <IconButton
                                                color="error"
                                                onClick={() =>
                                                    removeFromCart(item.book.bookId, item.cartItemId)
                                                }
                                                sx={{ ml: { xs: 1, md: 2 } }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </CardContent>
                                </Paper>
                            ))}
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        {/* TOTAL */}
                        <Box sx={{ textAlign: "right", mb: 2 }}>
                            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                                Total: ${cartTotal}
                            </Typography>
                        </Box>

                        {/* Buttons */}
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mt: 4,
                                flexWrap: "wrap",
                                gap: 2,
                            }}
                        >
                            {/* Continue Shopping */}
                            <Button
                                startIcon={<ArrowBackIcon />}
                                variant="outlined"
                                onClick={() => navigate("/books")}
                                sx={{
                                    flexGrow: { xs: 1, sm: 0 },
                                    borderRadius: "20px",
                                    textTransform: "none",
                                    fontWeight: "bold",
                                    py: 1.2,
                                    px: 3,
                                    fontSize: { xs: "0.9rem", md: "1rem" },
                                }}
                            >
                                Continue Shopping
                            </Button>

                            {/* Checkout */}
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                onClick={handleCheckout}
                                sx={{
                                    flexGrow: { xs: 1, sm: 0 },
                                    borderRadius: "20px",
                                    textTransform: "none",
                                    fontWeight: "bold",
                                    py: 1.2,
                                    px: 3,
                                    fontSize: { xs: "0.9rem", md: "1rem" },
                                }}
                            >
                                Checkout
                            </Button>
                        </Box>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}

