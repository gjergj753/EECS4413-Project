import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import { dummyBooks } from "../data/dummyBooks";
import { useNavigate } from "react-router-dom";

export default function AdminInventoryPage() {
    const navigate = useNavigate();
  const [books, setBooks] = useState(dummyBooks);
  const [filters, setFilters] = useState({ bookId: "", title: "", author: "" });
  const [selectedBook, setSelectedBook] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [deleteBook, setDeleteBook] = useState(null);
  const [newBookModalOpen, setNewBookModalOpen] = useState(false);
  const [newBookData, setNewBookData] = useState({ title: "", author: "", quantity: 0 });

  // ------------------- FILTER LOGIC -------------------
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      if (filters.bookId && !book.bookId.toString().includes(filters.bookId)) return false;
      if (filters.title && !book.title.toLowerCase().includes(filters.title.toLowerCase())) return false;
      if (filters.author && !book.author.toLowerCase().includes(filters.author.toLowerCase())) return false;
      return true;
    });
  }, [books, filters]);

  // ------------------- ADJUST INVENTORY LOGIC -------------------
  const handleSave = () => {
    // replace later
    const amount = parseInt(adjustAmount, 10);
    if (isNaN(amount)) return;

    setBooks(prev =>
      prev.map(b =>
        b.bookId === selectedBook.bookId
          ? { ...b, quantity: Math.max(0, b.quantity + amount) }
          : b
      )
    );

    setSelectedBook(null);
    setAdjustAmount("");
  };

    // ------------------- DELETE BOOK LOGIC -------------------
     const confirmDelete = () => {
    setBooks(prev => prev.filter(b => b.bookId !== selectedBook.bookId));
    setSelectedBook(null);
    setAdjustAmount("");
  };


  // ------------------- ADD NEW BOOK LOGIC -------------------
//   replace later
  const handleAddBook = () => {
    const newBook = {
      bookId: books.length ? Math.max(...books.map(b => b.bookId)) + 1 : 1,
      title: newBookData.title,
      author: newBookData.author,
      quantity: parseInt(newBookData.quantity, 10) || 0
    };
    setBooks(prev => [...prev, newBook]);
    setNewBookData({ title: "", author: "", quantity: 0 });
    setNewBookModalOpen(false);
  };

  // ------------------- BUTTON STYLES (should export for all files) -------------------
  const primaryButton = {
    variant: "contained",
    sx: {
      backgroundColor: "#3f51b5",
      borderRadius: "20px",
      textTransform: "none",
      px: 3,
      fontWeight: "bold",
      "&:hover": { backgroundColor: "#303f9f", transform: "scale(1.04)" }
    }
  };

  const secondaryButton = {
    variant: "outlined",
    sx: {
      borderRadius: "20px",
      textTransform: "none",
      px: 3,
      fontWeight: "bold",
      "&:hover": { transform: "scale(1.04)" }
    }
  };

  const errorButton = {
    variant: "contained",
    color: "error",
    sx: {
      borderRadius: "20px",
      textTransform: "none",
      px: 3,
      fontWeight: "bold",
      "&:hover": { transform: "scale(1.04)" }
    }
  };



  return (
    <Box sx={{ ml: 0, px: { xs: 2, md: 5 }, py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold", textAlign: "center" }}>
        Maintain Inventory
      </Typography>

      {/* ----------------- ADD BUTTON ----------------- */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2, gap: 2 }}>
        <Button {...primaryButton} onClick={() => setNewBookModalOpen(true)}>
          Add New Book
        </Button>
      </Box>

      {/* ----------------- FILTER SECTION ----------------- */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Filter By
        </Typography>
        <Box
          sx={{
             display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 
          }}
        >
          <TextField
            label="Book ID"
            value={filters.bookId}
            onChange={e => setFilters({ ...filters, bookId: e.target.value })}
          />
          <TextField
            label="Title"
            value={filters.title}
            onChange={e => setFilters({ ...filters, title: e.target.value })}
          />
          <TextField
            label="Author"
            value={filters.author}
            onChange={e => setFilters({ ...filters, author: e.target.value })}
          />
        </Box>
      </Paper>


      {/* ----------------- BOOK TABLE ----------------- */}
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f3f3f3" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Book ID</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Title</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Author</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Stock</TableCell>
              <TableCell ></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredBooks.map(book => (
              <TableRow key={book.bookId}>
                <TableCell>{book.bookId}</TableCell>
                <TableCell>{book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>{book.quantity}</TableCell>
                <TableCell>
                  <Button {...secondaryButton} onClick={() => setSelectedBook(book)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {filteredBooks.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: "center", color: "gray" }}>
                  No books match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>


      {/* ----------------- ADJUST INVENTORY MODAL ----------------- */}
      {selectedBook && (
        <Dialog open={true} onClose={() => setSelectedBook(null)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: "bold" }}>
            Item #{selectedBook.bookId}: {selectedBook.title}
          </DialogTitle>
          <DialogContent dividers>
            <Typography sx={{ mb: 1 }}>
              Current Stock: <strong>{selectedBook.quantity}</strong>
            </Typography>
            <Divider sx={{ my: 2 }} />
            <TextField
              label="Amount (+ to increase, - to decrease)"
              type="number"
              fullWidth
              value={adjustAmount}
              onChange={e => setAdjustAmount(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedBook(null)} {...secondaryButton}>
              Cancel
            </Button>
            <Button onClick={confirmDelete} {...errorButton}>
              Delete Book
            </Button>
            <Button onClick={handleSave} {...primaryButton}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* ----------------- ADD NEW BOOK MODAL ----------------- */}
      {newBookModalOpen && (
        <Dialog open={true} onClose={() => setNewBookModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: "bold" }}>Add New Book</DialogTitle>
          <DialogContent dividers>
            <TextField
              label="Title"
              fullWidth
              sx={{ mb: 2 }}
              value={newBookData.title}
              onChange={e => setNewBookData({ ...newBookData, title: e.target.value })}
            />
            <TextField
              label="Author"
              fullWidth
              sx={{ mb: 2 }}
              value={newBookData.author}
              onChange={e => setNewBookData({ ...newBookData, author: e.target.value })}
            />
            <TextField
              label="Quantity"
              type="number"
              fullWidth
              value={newBookData.quantity}
              onChange={e => setNewBookData({ ...newBookData, quantity: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNewBookModalOpen(false)} {...secondaryButton}>
              Cancel
            </Button>
            <Button onClick={handleAddBook} {...primaryButton}>
              Add Book
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

