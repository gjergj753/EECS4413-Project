import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Grid,
    Typography,
    Box,
    CircularProgress,
    Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import BookCard from "../components/BookCard";
import SearchBar from "../components/SearchBar";
import FilterPanel from "../components/FilterPanel";
import { dummyBooks } from "../data/dummyBooks";

export default function HomePage() {
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const genreFromUrl = queryParams.get("genre") || "All";

    const genres = ["All", ...new Set(dummyBooks.flatMap((b) => b.genres))];

    const [selectedGenre, setSelectedGenre] = useState(genreFromUrl);

    // Sync state when URL changes (user clicks genre in navbar)
    useEffect(() => {
        setSelectedGenre(genreFromUrl);
    }, [genreFromUrl]);

    // Search
    const [searchQuery, setSearchQuery] = useState("");

    // Filters
    const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
    const [sortBy, setSortBy] = useState("none");

    // UI control
    const [showFilters, setShowFilters] = useState(false);

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
            // Price
            filtered = filtered.filter(
                (b) => b.price >= priceRange.min && b.price <= priceRange.max
            );

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
    }, [selectedGenre, priceRange, sortBy]);

    const handleAddToCart = (bookId) => alert(`Book ${bookId} added to cart!`);

    const handleViewDetails = (bookId) => navigate(`/book/${bookId}`);

    return (
        <Box sx={{ width: "100%", p: 2 }}>

            {/* Search + filter button */}
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
                <Box
                    sx={{
                        flexGrow: 1,
                        minWidth: { xs: "100%", sm: "60%", md: "70%" },
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <SearchBar
                        genres={genres}
                        selectedGenre={selectedGenre}
                        onGenreChange={(g) => navigate(`/books?genre=${g}`)}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        onSearchSubmit={handleSearch}
                    />
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: { xs: "center", sm: "flex-end" },
                        width: { xs: "100%", sm: "auto" },
                    }}
                >
                    <Button
                        variant="outlined"
                        onClick={() => setShowFilters((prev) => !prev)}
                        startIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        sx={{ whiteSpace: "nowrap", px: 2.5, py: 1, fontWeight: 500 }}
                    >
                        {showFilters ? "Hide Filters" : "Show Filters"}
                    </Button>
                </Box>
            </Box>

            <FilterPanel
                showFilters={showFilters}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                sortBy={sortBy}
                setSortBy={setSortBy}
            />

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

