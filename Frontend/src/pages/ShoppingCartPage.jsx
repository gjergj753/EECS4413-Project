import React from "react";
import {
    Box,
    Typography,
    Button,
    IconButton,
    Divider,
    Card,
    CardContent,
    CardMedia,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function ShoppingCartPage() {
    const navigate = useNavigate();

    // Get everything from context
    const {
        cartItems,
        increaseQty,
        decreaseQty,
        removeFromCart,
        cartTotal,
    } = useCart();

    return (
        <Box sx={{ p: 3, maxWidth: "900px", margin: "auto" }}>
            <Typography variant="h4" gutterBottom>
                Shopping Cart
            </Typography>

            {cartItems.length === 0 ? (
                <Typography variant="h6" sx={{ textAlign: "center", mt: 5 }}>
                    Your cart is empty.
                </Typography>
            ) : (
                <>
                    {/* Cart Items */}
                    {cartItems.map((item) => (
                        <Card
                            key={item.bookId}
                            sx={{
                                display: "flex",
                                mb: { xs: 2, md: 3 },          
                                p: { xs: 1.5, md: 2.5 },      
                                borderRadius: "12px",
                                boxShadow: 3,
                            }}
                        >
                            <CardMedia
                                component="img"
                                sx={{
                                    width: { xs: 90, sm: 110, md: 150 },  
                                    height: { xs: 120, sm: 150, md: 200 },
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                }}
                                image={item.imageUrl}
                                alt={item.title}
                            />

                            <CardContent
                                sx={{
                                    flexGrow: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    ml: { xs: 1.5, md: 3 },
                                }}
                            >
                                <Box>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontSize: { xs: "1rem", md: "1.3rem" },
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {item.title}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: "text.secondary",
                                            fontSize: { xs: "0.85rem", md: "1rem" },
                                        }}
                                    >
                                        {item.author}
                                    </Typography>

                                    <Typography
                                        variant="body1"
                                        sx={{
                                            mt: 1,
                                            fontSize: { xs: "1rem", md: "1.15rem" },
                                        }}
                                    >
                                        Price: <strong>${item.price.toFixed(2)}</strong>
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        mt: { xs: 1.5, md: 2 },
                                    }}
                                >
                                    <IconButton onClick={() => decreaseQty(item.bookId)}>
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

                                    <IconButton onClick={() => increaseQty(item.bookId)}>
                                        <AddIcon fontSize="small" />
                                    </IconButton>

                                    <IconButton
                                        color="error"
                                        onClick={() => removeFromCart(item.bookId)}
                                        sx={{ ml: { xs: 1, md: 2 } }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}

                    <Divider sx={{ my: 3 }} />

                    {/* Cart Total */}
                    <Typography variant="h5" gutterBottom>
                        Total: ${cartTotal}
                    </Typography>

                    {/* Actions */}
                    {/* Actions */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mt: 3,
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
                                borderWidth: "2px",
                                borderColor: "#3f51b5",
                                color: "#3f51b5",
                                transition: "0.2s ease",
                                "&:hover": {
                                    borderColor: "#303f9f",
                                    color: "#303f9f",
                                    transform: "scale(1.03)",
                                    backgroundColor: "transparent",
                                },
                            }}
                        >
                            Continue Shopping
                        </Button>

                        {/* Checkout */}
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={() => navigate("/checkout")}
                            sx={{
                                flexGrow: { xs: 1, sm: 0 },
                                borderRadius: "20px",
                                backgroundColor: "#3f51b5",
                                textTransform: "none",
                                fontWeight: "bold",
                                py: 1.2,
                                px: 3,
                                fontSize: { xs: "0.9rem", md: "1rem" },
                                transition: "0.2s ease",
                                "&:hover": {
                                    backgroundColor: "#303f9f",
                                    transform: "scale(1.03)",
                                },
                            }}
                        >
                            Checkout
                        </Button>
                    </Box>

                </>
            )}
        </Box>
    );
}

