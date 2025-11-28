export const primaryButton = {
  variant: "contained",
  backgroundColor: "#3f51b5",
  borderRadius: "20px",
  textTransform: "none",
  px: 3,
  fontWeight: "bold",
  "&:hover": { backgroundColor: "#303f9f", transform: "scale(1.04)" }
};

export const secondaryButton = {
  variant: "outlined",
  borderRadius: "20px",
  textTransform: "none",
  px: 3,
  fontWeight: "bold",
  "&:hover": { transform: "scale(1.04)" }
};

export const errorButton = {
  variant: "contained",
  backgroundColor: "#d32f2f",
  color: "white",
  borderRadius: "20px",
  textTransform: "none",
  px: 3,
  fontWeight: "bold",
  "&:hover": { backgroundColor: "#9a0007", transform: "scale(1.04)" }
};