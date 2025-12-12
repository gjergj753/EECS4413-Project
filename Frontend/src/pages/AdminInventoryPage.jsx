import React, { useEffect, useState, useMemo } from "react";
import {
  Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Divider, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Alert, Snackbar, Pagination,
  CircularProgress, LinearProgress
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { primaryButton, secondaryButton, errorButton } from "../utils/buttonStyles";
import { useAuth } from "../context/AuthContext";
import { getAllBooks, createBook, updateBookStock, deleteBook } from "../api/adminApi";

export default function AdminInventoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth(); 
  const authToken = user?.authToken;

  const [alert, setAlert] = useState({ open: false, severity: "success", message: "" });
  
  // book states
  const [allBooks, setAllBooks] = useState([]);
  const [filters, setFilters] = useState({ bookId: "", title: "", author: "", isbn: ""});
  const [selectedBook, setSelectedBook] = useState(null);
  const [newStock, setNewStock] = useState("");
  const [newBookModalOpen, setNewBookModalOpen] = useState(false);
  const [newBookData, setNewBookData] = useState({
    title: "", author: "", isbn: "", price: "", description: "",
    imageUrl: "", thumbnailUrl: "", quantity: "", year: "", genres: []
  });

  // page states
  const [page, setPage] = useState(0);
  const [pageSize] = useState(100);
  const [initialLoading, setInitialLoading] = useState(true);
  

  // ---------------------- ALERT HANDLERS ----------------------
  const showAlert = (severity, message) => {
    setAlert({ open: true, severity, message });
  };

  const closeAlert = () => {
    setAlert({ open: false, severity: "success", message: "" });
  };

  // ------------------- LOAD ALL BOOKS -------------------
  async function loadAllBooks() {
    setInitialLoading(true);
    try {
        const books = await getAllBooks();
        setAllBooks(books);
    } catch (err) {
        console.error(err);
        showAlert("error", "Failed to load books. Please refresh the page.");
        setAllBooks([]);
    } finally {
        setInitialLoading(false);
    }
  }

  useEffect(() => {
    loadAllBooks();
  }, []);


  // ------------------- FILTER LOGIC -------------------
  useEffect(() => {
    setPage(0); // Reset to first page when filters change
  }, [filters.bookId, filters.title, filters.author, filters.isbn]);

  const filteredBooks = useMemo(() => {
    return allBooks.filter((book) => {
      if (filters.bookId && !book.bookId.toString().includes(filters.bookId)) return false;
      if (filters.title && !book.title.toLowerCase().includes(filters.title.toLowerCase())) return false;
      if (filters.author && !book.author.toLowerCase().includes(filters.author.toLowerCase())) return false;
      if (filters.isbn && !book.isbn.toLowerCase().includes(filters.isbn.toLowerCase())) return false;
      return true;
    });
  }, [allBooks, filters]);

  // ------------------- PAGINATE FILTERED RESULTS -------------------
  const totalFilteredBooks = filteredBooks.length;
  const totalPages = Math.ceil(totalFilteredBooks / pageSize);
  const paginatedBooks = useMemo(() => {
    return filteredBooks.slice(page * pageSize, (page + 1) * pageSize);
  }, [filteredBooks, page, pageSize]);

  // ------------------- PAGINATION HANDLER -------------------
  const handlePageChange = (event, value) => {
    setPage(value - 1); // mui Pagination is 1-indexed, API is 0-indexed
  };


  // ------------------- ADJUST INVENTORY HANDLER -------------------
  async function handleSaveStock() {
    if (newStock === "") return alert("Enter a quantity.");

    try {
      await updateBookStock(authToken, selectedBook.bookId, Number(newStock));
      showAlert("success", "Stock updated successfully!");
      setSelectedBook(null);
      setNewStock("");
      loadAllBooks();
    } catch (err) {
      console.error(err);
      showAlert("error", "Error updating stock.");
    }
  }

  // ------------------- DELETE BOOK HANDLER -------------------
  async function handleDeleteBook() {
    if (!window.confirm("Are you sure you want to delete this book?")) return;

    try {
      await deleteBook(authToken, selectedBook.bookId);
      showAlert("success", "Book deleted successfully!");
      setSelectedBook(null);
      loadAllBooks();
    } catch (err) {
      console.error(err);
      showAlert("error", "Error deleting book.");
    }
  }

  // ------------------- ADD NEW BOOK HANDLER -------------------
  async function handleAddBook(e) {
    e.preventDefault();
    try {
      const payload = {
        title: newBookData.title,
        author: newBookData.author,
        isbn: newBookData.isbn,
        price: Number(newBookData.price),
        description: newBookData.description,
        imageUrl: newBookData.imageUrl,
        thumbnailUrl: newBookData.thumbnailUrl,
        quantity: Number(newBookData.quantity),
        year: Number(newBookData.year),
        genres: newBookData.genres.length ? newBookData.genres : []
      };

      await createBook(authToken, payload);
      showAlert("success", "Book created successfully!");
      
      setNewBookModalOpen(false);
      setNewBookData({
        title: "", author: "", isbn: "", price: "", description: "",
        imageUrl: "", thumbnailUrl: "", quantity: "", year: "", genres: []
      });
      loadAllBooks();
    } catch (err) {
      console.error(err);
      showAlert("error", "Error creating book.");
    }
  }


  // Show loading screen on initial load
  if (initialLoading) {
    return (
      <Box sx={{ 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center", 
        minHeight: "60vh",
        gap: 3
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading inventory... ({allBooks.length} books loaded)
        </Typography>
        <Box sx={{ width: "300px" }}>
          <LinearProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ ml: 0, px: { xs: 2, md: 5 }, py: 4 }}>
      <Box sx={{ width: "100%", maxWidth: { xs: "100%", md: "70%" } }}></Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold", textAlign: "center" }}>Maintain Inventory</Typography>

      {/* FILTERS */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>Filter By</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr 1fr" }, gap: 2 }}>
          <TextField 
            label="Book ID" 
            value={filters.bookId} 
            onChange={(e) => setFilters({ ...filters, bookId: e.target.value })}
            placeholder="Search by ID..."
          />
          <TextField 
            label="Title" 
            value={filters.title} 
            onChange={(e) => setFilters({ ...filters, title: e.target.value })}
            placeholder="Search by title..."
          />
          <TextField 
            label="Author" 
            value={filters.author} 
            onChange={(e) => setFilters({ ...filters, author: e.target.value })}
            placeholder="Search by author..."
          />
          <TextField 
            label="ISBN" 
            value={filters.isbn} 
            onChange={(e) => setFilters({ ...filters, isbn: e.target.value })}
            placeholder="Search by ISBN..."
          />
        </Box>
        {(filters.bookId || filters.title || filters.author || filters.isbn) && (
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="outlined" 
              sx={secondaryButton} 
              onClick={() => setFilters({ bookId: "", title: "", author: "", isbn: ""})}
            >
              Clear All Filters
            </Button>
          </Box>
        )}
      </Paper>

      {/* ADD BOOK BUTTON & PAGINATION INFO */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 2 }}>
        <Button variant="contained" sx={primaryButton} onClick={() => setNewBookModalOpen(true)}>Add New Book</Button>
        <Typography variant="body2" sx={{ color: "gray" }}>
          Showing {paginatedBooks.length > 0 ? page * pageSize + 1 : 0} - {Math.min((page + 1) * pageSize, totalFilteredBooks)} of {totalFilteredBooks} books
          {/* e.g. Showing 1-20 of 38 books */}
          {totalFilteredBooks !== allBooks.length && (
            <span style={{ fontWeight: "bold", marginLeft: "8px" }}>
              (filtered from {allBooks.length} total)
            </span>
          )}
          {/* e.g. Showing 1-20 of 22 books (filtered from 38 total) */}
        </Typography>
      </Box>

      {/* BOOK TABLE */}
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f3f3f3" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Book ID</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Title</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Author</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>ISBN</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Stock</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedBooks.map((book) => (
              <TableRow key={book.bookId}>
                <TableCell>{book.bookId}</TableCell>
                <TableCell>{book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>{book.isbn}</TableCell>
                <TableCell>{book.quantity}</TableCell>
                <TableCell>
                  <Button variant="outlined" sx={secondaryButton} onClick={() => { setSelectedBook(book); setNewStock(book.quantity ?? book.stock ?? 0); }}>Edit</Button>
                </TableCell>
              </TableRow>
            ))}
            {paginatedBooks.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: "center", color: "gray", py: 4 }}>
                  {filters.bookId || filters.title || filters.author || filters.isbn
                    ? "No books match your filters." 
                    : "No books available."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination 
            count={totalPages} 
            page={page + 1} 
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* EDIT BOOK MODAL */}
      {selectedBook && (
        <Dialog open onClose={() => setSelectedBook(null)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: "bold" }}>Book #{selectedBook.bookId}: {selectedBook.title}</DialogTitle>
          <DialogContent dividers>
            <Typography sx={{ mb: 1 }}>Current Stock: <strong>{selectedBook.quantity ?? selectedBook.stock}</strong></Typography>
            <Divider sx={{ my: 2 }} />
            <TextField label="Set Stock To:" type="number" fullWidth value={newStock} onChange={(e) => setNewStock(e.target.value)} />
          </DialogContent>
          <DialogActions sx={{ justifyContent: "space-between" }}>
            <Button onClick={handleDeleteBook} variant="contained" sx={errorButton} >Delete Book</Button>
            <Box sx={{display: "flex", gap: 2 }} >
              <Button variant="outlined" sx={secondaryButton} onClick={() => setSelectedBook(null)}>Cancel</Button>
              <Button onClick={handleSaveStock} variant="contained" sx={primaryButton} >Save</Button>
            </Box>
          </DialogActions>
        </Dialog>
      )}

      {/* NEW BOOK MODAL */}
      {newBookModalOpen && (
        <Dialog open onClose={() => setNewBookModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: "bold" }}>Add New Book</DialogTitle>
          <DialogContent dividers>
          <Box component="form" onSubmit={handleAddBook}>
            <TextField required label="Title" fullWidth sx={{ mb: 2 }} value={newBookData.title} onChange={e => setNewBookData({ ...newBookData, title: e.target.value })} />
            <TextField required label="Author" fullWidth sx={{ mb: 2 }} value={newBookData.author} onChange={e => setNewBookData({ ...newBookData, author: e.target.value })} />
            <TextField required label="ISBN" fullWidth sx={{ mb: 2 }} value={newBookData.isbn} onChange={e => setNewBookData({ ...newBookData, isbn: e.target.value })} />
            <TextField required label="Price" type="number" fullWidth sx={{ mb: 2 }} value={newBookData.price} onChange={e => setNewBookData({ ...newBookData, price: parseFloat(e.target.value) || 0.0 })} />
            <TextField required label="Description" fullWidth multiline rows={3} sx={{ mb: 2 }} value={newBookData.description} onChange={e => setNewBookData({ ...newBookData, description: e.target.value })} />
            <TextField required label="Image URL" fullWidth sx={{ mb: 2 }} value={newBookData.imageUrl} onChange={e => setNewBookData({ ...newBookData, imageUrl: e.target.value })} />
            <TextField required label="Thumbnail URL" fullWidth sx={{ mb: 2 }} value={newBookData.thumbnailUrl} onChange={e => setNewBookData({ ...newBookData, thumbnailUrl: e.target.value })} />
            <TextField required label="Quantity" type="number" fullWidth sx={{ mb: 2 }} value={newBookData.quantity} onChange={e => setNewBookData({ ...newBookData, quantity: parseInt(e.target.value, 10) || 0 })} />
            <TextField required label="Year" type="number" fullWidth sx={{ mb: 2 }} value={newBookData.year} onChange={e => setNewBookData({ ...newBookData, year: parseInt(e.target.value, 10)})} />
            <TextField required label="Genres (comma separated)" fullWidth sx={{ mb: 2 }} value={newBookData.genres.join(", ")} onChange={e => setNewBookData({ ...newBookData, genres: e.target.value.split(",").map(g => g.trim()) })} />
          
          <DialogActions>
            <Button onClick={() => setNewBookModalOpen(false)} variant="outlined" sx={secondaryButton} >Cancel</Button>
            <Button type="submit" variant="contained" sx={primaryButton} >Add Book</Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
      )}

      {/* UNIFIED ALERT SNACKBAR */}
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={closeAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}