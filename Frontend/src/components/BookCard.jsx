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
        width: { xs: 170, sm: 200, md: 240, lg: 260, xl: 300 },
        height: { xs: 330, sm: 360, md: 420, lg: 450, xl: 500 },
        m: 1,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRadius: "12px",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: 4,
        },
      }}
    >
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Bigger images on desktop */}
        <CardMedia
          component="img"
          image={book.imageUrl}
          alt={book.title}
          sx={{
            height: { xs: 160, sm: 180, md: 220, lg: 250, xl: 280 },
            objectFit: "cover",
          }}
        />

        <CardContent sx={{ flexGrow: 1, px: 2 }}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            noWrap
            sx={{ fontSize: { xs: "0.9rem", md: "1.05rem", lg: "1.15rem" } }}
          >
            {book.title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
            sx={{ fontSize: { xs: "0.75rem", md: "0.9rem" } }}
          >
            {book.author}
          </Typography>

          <Typography
            variant="body1"
            sx={{ mt: 1, fontSize: { xs: "0.9rem", md: "1rem" } }}
          >
            ${book.price.toFixed(2)}
          </Typography>
        </CardContent>
      </Box>

      <CardActions sx={{ justifyContent: "center", pb: 2, px: 2 }}>
        <Button
          size="small"
          variant="contained"
          fullWidth
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(book);
          }}
          sx={{
            borderRadius: "20px",
            backgroundColor: "#3f51b5",
            textTransform: "none",
            fontWeight: "bold",
            py: 1,
            fontSize: { xs: "0.75rem", md: "0.9rem" },
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
