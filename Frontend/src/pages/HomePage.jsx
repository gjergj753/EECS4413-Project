import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Grid,
    Typography,
    Box,
    CircularProgress,
    Button,
} from "@mui/material";
import BookCard from "../components/BookCard";
import SearchBar from "../components/SearchBar";
import FilterPanel from "../components/FilterPanel";
import { dummyBooks } from "../data/dummyBooks";
import { useCart } from "../context/CartContext";

export default function HomePage() {
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const genreFromUrl = queryParams.get("genre") || "All";
    const { addToCart } = useCart();
    const genres = ["All", ...new Set(dummyBooks.flatMap((b) => b.genres))];

    const [selectedGenre, setSelectedGenre] = useState(genreFromUrl);

    // Sync state when URL changes (user clicks genre in navbar)
    useEffect(() => {
        if (location.state?.reset) {
            // Reset filters + search
            setSearchQuery("");
            setSelectedGenre("All");
            setSortBy("none");

            // Re-fetch all books
            fetchBooks();

            // Clear reset flag so it doesn't persist on back navigation
            navigate("/", { replace: true, state: {} });
            setSelectedGenre(genreFromUrl)
        }
    }, [genreFromUrl, location.state]);

    // Search
    const [searchQuery, setSearchQuery] = useState("");

    // Filters

    const [sortBy, setSortBy] = useState("none");

    // Books
    const [loading, setLoading] = useState(true);
    const [books, setBooks] = useState([]);

    // Fetch books (simulated backend)
    const fetchBooks = () => {
        setLoading(true);

        setTimeout(() => {
            let filtered = dummyBooks;

            // Genre and search
            if (selectedGenre !== "All" && selectedGenre !== "") {
                filtered = filtered.filter((b) => b.genres.includes(selectedGenre));
            }
            else if (searchQuery.trim() !== "") {
                const q = searchQuery.toLowerCase();
                filtered = filtered.filter(
                    (b) =>
                        b.title.toLowerCase().includes(q) ||
                        b.author.toLowerCase().includes(q) ||
                        b.isbn.toLowerCase().includes(q)
                );
            }
            // Sort
            if (sortBy === "priceLowHigh") filtered.sort((a, b) => a.price - b.price);
            else if (sortBy === "priceHighLow") filtered.sort((a, b) => b.price - a.price);
            else if (sortBy === "titleAZ") filtered.sort((a, b) => a.title.localeCompare(b.title));
            else if (sortBy === "titleZA") filtered.sort((a, b) => b.title.localeCompare(a.title));

            setBooks(filtered);
            setLoading(false);
        }, 400);
    };

    const handleSearch = () => {
        navigate("/books", { replace: true });
        fetchBooks();
    };

    // Re-run fetch when filters change OR URL genre changes
    useEffect(() => {
        fetchBooks();
    }, [selectedGenre, sortBy]);

    useEffect(() => {
        setSelectedGenre(genreFromUrl);
    }, [genreFromUrl]);

    const handleAddToCart = (book) => {
        addToCart(book);
    };

    const handleViewDetails = (bookId) => navigate(`/book/${bookId}`);

    return (
        <Box sx={{ width: "100%", p: 2 }}>

            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                    flexWrap: "wrap",
                    gap: 2,
                }}
            >
                {/* Search Bar */}
                <Box
                    sx={{
                        flexGrow: 1,
                        minWidth: { xs: "100%", sm: "60%", md: "70%" },
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <SearchBar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        onSearchSubmit={handleSearch}
                    />
                </Box>

                {/* Sort dropdown (FilterPanel) */}
                <Box
                    sx={{
                        width: { xs: "100%", sm: "auto" },
                        display: "flex",
                        justifyContent: { xs: "center", sm: "flex-end" },
                    }}
                >
                    <FilterPanel sortBy={sortBy} setSortBy={setSortBy} />
                </Box>
            </Box>


            {loading ? (
                <Box textAlign="center" mt={5}>
                    <CircularProgress />
                    <Typography variant="body2" mt={2}>Loading books...</Typography>
                </Box>
            ) : books.length === 0 ? (
                <Typography
                    variant="body1"
                    color="text.secondary"
                    textAlign="center"
                    mt={4}
                >
                    No books found.
                </Typography>
            ) : (
                <Grid container spacing={2} justifyContent="center">
                    {books.map((book) => (
                        <Grid item key={book.bookId} xs={12} sm={6} md={3}>
                            <BookCard
                                book={book}
                                onAddToCart={handleAddToCart}
                                onViewDetails={handleViewDetails}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}

