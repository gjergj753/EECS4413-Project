import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { dummyBooks } from "../data/dummyBooks";
import {
    Box,
    Typography,
    Button,
    Card,
    CardMedia,
    CardContent,
    Grid,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useCart } from "../context/CartContext";

export default function BookDetailsPage() {
    const { bookId } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [qty, setQty] = useState(1);
    const { addToCart } = useCart();

    useEffect(() => {
        const found = dummyBooks.find((b) => b.bookId === Number(bookId));
        setBook(found || null);
    }, [bookId]);

    if (!book) {
        return (
            <Box textAlign="center" mt={5}>
                <Typography variant="h6" color="text.secondary">
                    Book not found.
                </Typography>
                <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate("/")}>
                    Back to Home
                </Button>
            </Box>
        );
    }

    const increaseQty = () => setQty(qty + 1);
    const decreaseQty = () => setQty(Math.max(1, qty - 1));


    // Determine stock status
    const renderStockStatus = (quantity) => {
        if (quantity > 5) {
            return (
                <Box sx={{ display: "flex", alignItems: "center", color: "green", mb: 2 }}>
                    <CheckCircleIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">In stock</Typography>
                </Box>
            );
        } else if (quantity > 0) {
            return (
                <Box sx={{ display: "flex", alignItems: "center", color: "orange", mb: 2 }}>
                    <WarningAmberIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">Only {quantity} left!</Typography>
                </Box>
            );
        } else {
            return (
                <Box sx={{ display: "flex", alignItems: "center", color: "red", mb: 2 }}>
                    <ErrorIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">Out of stock</Typography>
                </Box>
            );
        }
    };

    const handleAddToCart = (book) => {
        addToCart(book);
    };

    return (
        <Box sx={{ p: 4 }}>
            <Grid container spacing={4} justifyContent="center">
                {/* Book cover */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ boxShadow: 3 }}>
                        <CardMedia
                            component="img"
                            image={book.imageUrl}
                            alt={book.title}
                            sx={{ height: 400, objectFit: "cover" }}
                        />
                    </Card>
                </Grid>

                {/* Book details */}
                <Grid item xs={12} md={6}>
                    <CardContent>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            {book.title}
                        </Typography>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            {book.author}
                        </Typography>

                        {/* ISBN + Year */}
                        <Typography variant="body2" color="text.secondary">
                            ISBN: {book.isbn}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Year: {book.year}
                        </Typography>
                        {/* Genres */}
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
                            {book.genres.map((g) => (
                                <Box
                                    key={g}
                                    sx={{
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: "20px",
                                        backgroundColor: "#e0e0e0",
                                        fontSize: "0.85rem",
                                    }}
                                >
                                    {g}
                                </Box>
                            ))}
                        </Box>
                        <Typography variant="body1" sx={{ my: 2 }}>
                            {book.description}
                        </Typography>

                        {/* Price */}
                        <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                            ${book.price.toFixed(2)}
                        </Typography>

                        {/* Dynamic Stock Indicator */}
                        {renderStockStatus(book.quantity)}

                        {/* Quantity selector */}
                        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                            <Button
                                variant="outlined"
                                onClick={decreaseQty}
                                sx={{
                                    minWidth: 40,
                                    fontSize: "1.2rem",
                                    borderRadius: "50%",
                                }}
                            >
                                –
                            </Button>

                            <Typography sx={{ mx: 2, fontSize: "1.2rem", width: "30px", textAlign: "center" }}>
                                {qty}
                            </Typography>

                            <Button
                                variant="outlined"
                                onClick={increaseQty}
                                sx={{
                                    minWidth: 40,
                                    fontSize: "1.2rem",
                                    borderRadius: "50%",
                                }}
                            >
                                +
                            </Button>
                        </Box>

                        {/* Action buttons */}
                        <Box
                            sx={{
                                display: "flex",
                                flexWrap: { xs: "wrap", sm: "nowrap" },
                                gap: { xs: 2, sm: 2 },
                            }}
                        >
                            {/* Add to Cart */}
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => addToCart(book, qty)}
                                disabled={book.quantity === 0}
                                sx={{
                                    flexGrow: { xs: 1, sm: 0 },
                                    borderRadius: "20px",
                                    backgroundColor: "#3f51b5",
                                    color: "white",
                                    textTransform: "none",
                                    fontWeight: "bold",
                                    py: 1.4,
                                    px: 3,
                                    fontSize: "1rem",
                                    transition: "0.2s ease",
                                    "&:hover": {
                                        backgroundColor: "#303f9f",
                                        transform: "scale(1.03)",
                                    },
                                }}
                            >
                                Add {qty} to Cart
                            </Button>

                            {/* Back to Catalog */}
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => navigate("/")}
                                sx={{
                                    flexGrow: { xs: 1, sm: 0 },
                                    borderRadius: "20px",
                                    textTransform: "none",
                                    fontWeight: "bold",
                                    py: 1.4,
                                    px: 3,
                                    fontSize: "1rem",
                                    borderWidth: "2px",
                                    borderColor: "#3f51b5",
                                    color: "#3f51b5",
                                    transition: "0.2s ease",
                                    "&:hover": {
                                        borderColor: "#303f9f",
                                        color: "#303f9f",
                                        transform: "scale(1.03)",
                                    },
                                }}
                            >
                                Back to Catalog
                            </Button>
                        </Box>


                    </CardContent>
                </Grid>
            </Grid>
        </Box>
    );
}
