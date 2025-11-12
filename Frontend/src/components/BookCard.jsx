import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
} from "@mui/material";

export default function BookCard({ book, onAddToCart, onViewDetails}) {
  return (
    <Card
      onClick={(e) => {
        onViewDetails(book.bookId);
      }}
      sx={{
        width: { xs: 160, sm: 200, md: 220 },
        height: { xs: 300, sm: 340, md: 360 },
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
          image={book.imageUrl}
          alt={book.title}
          sx={{ height: 160, objectFit: "cover" }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold" noWrap>
            {book.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
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