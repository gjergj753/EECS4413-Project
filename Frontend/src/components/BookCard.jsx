import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
} from "@mui/material";

export default function BookCard({ book, onAddToCart, onViewDetails }) {
  const handleCardClick = (e) => {
    if (e.target.closest(".add-to-cart-btn")) return;
    onViewDetails(book.bookId);
  };

  return (
    <Card
      onClick={handleCardClick}
      sx={{
        width: 220, 
        height: 360, 
        m: 1,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: 4,
        },
      }}
    >
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <CardMedia
          component="img"
          image={book.imageURL}
          alt={book.title}
          sx={{
            height: 160, // ✅ consistent image area
            objectFit: "cover",
          }}
        />
        <CardContent
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {book.title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {book.author}
          </Typography>

          <Typography variant="body2" sx={{ mt: 1 }}>
            ${book.price.toFixed(2)}
          </Typography>
        </CardContent>
      </Box>

      <CardActions sx={{ justifyContent: "center", pb: 1 }}>
        <Button
          className="add-to-cart-btn"
          size="small"
          variant="contained"
          onClick={() => onAddToCart(book.bookId)}
        >
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );
}
