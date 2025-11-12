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

export default function BookDetailsPage() {
    const { bookId } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);

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

                        <Typography variant="body1" sx={{ my: 2 }}>
                            {book.description}
                        </Typography>

                        {/* Price */}
                        <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                            ${book.price.toFixed(2)}
                        </Typography>

                        {/* Dynamic Stock Indicator */}
                        {renderStockStatus(book.quantity)}

                        <Box
                            sx={{
                                display: "flex",
                                flexWrap: { xs: "wrap", sm: "nowrap" },
                                gap: { xs: 2, sm: 1 },  
                            }}
                        >
                            <Button
                                variant="contained"
                                size="large"
                                sx={{ flexGrow: { xs: 1, sm: 0 } }}
                                disabled={book.quantity === 0}
                                onClick={() => alert("Added to cart!")}
                            >
                                ADD TO CART
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                sx={{ flexGrow: { xs: 1, sm: 0 } }}
                                onClick={() => navigate("/")}
                            >
                                BACK TO CATALOG
                            </Button>
                        </Box>
                    </CardContent>
                </Grid>
            </Grid>
        </Box>
    );
}
