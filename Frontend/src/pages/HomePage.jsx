import React, { useState, useEffect } from "react";
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
import FilterPanel from "../components/FilterPanel"; // ✅ new import

export default function HomePage() {
  const genres = ["All", "Fiction", "Non-Fiction", "History", "Sci-Fi"];
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedAuthor, setSelectedAuthor] = useState("All");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
  const [sortBy, setSortBy] = useState("none");
  const [showFilters, setShowFilters] = useState(false);

  const dummyBooks = [
    { bookId: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", price: 12.99, genreList: "Fiction", imageURL: "https://images-na.ssl-images-amazon.com/images/I/81af+MCATTL.jpg" },
    { bookId: 2, title: "A Brief History of Time", author: "Stephen Hawking", price: 18.5, genreList: "Non-Fiction", imageURL: "https://images-na.ssl-images-amazon.com/images/I/71UypkUjStL.jpg" },
    { bookId: 3, title: "Sapiens", author: "Yuval Noah Harari", price: 21.0, genreList: "History", imageURL: "https://images-na.ssl-images-amazon.com/images/I/713jIoMO3UL.jpg" },
    { bookId: 4, title: "Dune", author: "Frank Herbert", price: 15.99, genreList: "Sci-Fi", imageURL: "https://images-na.ssl-images-amazon.com/images/I/91M9Zl9SroL.jpg" },
    { bookId: 5, title: "To Kill a Mockingbird", author: "Harper Lee", price: 10.99, genreList: "Fiction", imageURL: "https://images-na.ssl-images-amazon.com/images/I/81Ox45gdi5L.jpg" },
  ];

  const authors = ["All", ...new Set(dummyBooks.map((b) => b.author))];

  const fetchBooks = () => {
    setLoading(true);
    setTimeout(() => {
      let filtered = dummyBooks;

      if (selectedGenre !== "All") filtered = filtered.filter((b) => b.genreList === selectedGenre);
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (b) =>
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q)
        );
      }
      if (selectedAuthor !== "All") filtered = filtered.filter((b) => b.author === selectedAuthor);
      filtered = filtered.filter(
        (b) => b.price >= priceRange.min && b.price <= priceRange.max
      );

      if (sortBy === "priceLowHigh") filtered.sort((a, b) => a.price - b.price);
      else if (sortBy === "priceHighLow") filtered.sort((a, b) => b.price - a.price);
      else if (sortBy === "titleAZ") filtered.sort((a, b) => a.title.localeCompare(b.title));
      else if (sortBy === "titleZA") filtered.sort((a, b) => b.title.localeCompare(a.title));

      setBooks(filtered);
      setLoading(false);
    }, 400);
  };

  useEffect(() => {
    fetchBooks();
  }, [selectedGenre, searchQuery, selectedAuthor, priceRange, sortBy]);

  const handleAddToCart = (bookId) => alert(`Book ${bookId} added to cart!`);
  const handleViewDetails = (bookId) => alert(`Viewing book ${bookId}`);

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      {/* 🔎 Search Bar + Show Filters Button */}
<Box
  sx={{
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mb: 3,
    flexWrap: "wrap", // allows wrapping on small screens
    gap: 2,            // space between elements
  }}
>
  {/* Search section */}
  <Box
    sx={{
      flexGrow: 1,
      minWidth: { xs: "100%", sm: "60%", md: "70%" }, // full width on mobile
      display: "flex",
      justifyContent: "center",
    }}
  >
    <SearchBar
      genres={genres}
      selectedGenre={selectedGenre}
      onGenreChange={setSelectedGenre}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onSearchSubmit={fetchBooks}
    />
  </Box>

  {/* Show Filters button */}
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
      sx={{
        whiteSpace: "nowrap",
        px: 2.5,
        py: 1,
        fontWeight: 500,
      }}
    >
      {showFilters ? "Hide Filters" : "Show Filters"}
    </Button>
  </Box>
</Box>
      {/* 🎛 Collapsible FilterPanel */}
      <FilterPanel
        showFilters={showFilters}
        authors={authors}
        selectedAuthor={selectedAuthor}
        setSelectedAuthor={setSelectedAuthor}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* 📚 Books */}
      {loading ? (
        <Box textAlign="center" mt={5}>
          <CircularProgress />
          <Typography variant="body2" mt={2}>
            Loading books...
          </Typography>
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
