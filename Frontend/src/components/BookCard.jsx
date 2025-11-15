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
  return (
    <Card
      onClick={() => onViewDetails(book.bookId)}
      sx={{
        width: { xs: 160, sm: 200, md: 220 },
        height: { xs: 320, sm: 350, md: 370 },
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

      <CardActions sx={{ justifyContent: "center", pb: 1, px: 1 }}>
        <Button
          size="small"
          variant="contained"
          fullWidth
          onClick={(e) => {
            e.stopPropagation();        
            onAddToCart(book.bookId);
          }}
          sx={{
            borderRadius: "20px",       
            backgroundColor: "#3f51b5",
            textTransform: "none",
            fontWeight: "bold",
            py: 0.7,
            "&:hover": {
              backgroundColor: "#303f9f",
              transform: "scale(1.03)",
            },
            transition: "0.2s ease",
          }}
        >
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );
}