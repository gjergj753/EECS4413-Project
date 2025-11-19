import React from "react";
import {
  Box,
  TextField,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  onSearchSubmit
}) {

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSearchSubmit();
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        mt: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#fff",
          borderRadius: "30px",
          overflow: "hidden",
          boxShadow: 3,
          transition: "0.2s ease",
          width: "100%",
          maxWidth: { xs: 300, sm: 450, md: 600, lg: 700, xl: 800 },
          height: { xs: 44, md: 52 },
        }}
      >
        <TextField
          variant="standard"
          placeholder="Search by title, author, or ISBN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          InputProps={{
            disableUnderline: true,
            sx: {
              px: { xs: 1.5, md: 2 },
              fontSize: { xs: "0.9rem", md: "1.05rem" },
              height: "100%",
              display: "flex",
              alignItems: "center",
            },
          }}
          sx={{
            flexGrow: 1,
            backgroundColor: "#fff",
          }}
        />

        <IconButton
          onClick={onSearchSubmit}
          sx={{
            width: { xs: 48, md: 60 },
            height: "100%",
            borderRadius: 0,
            bgcolor: "#3f51b5",
            color: "white",
            transition: "0.25s ease",
            "&:hover": {
              bgcolor: "#303f9f",
              transform: "scale(1.05)",
            },
            borderTopRightRadius: "30px",
            borderBottomRightRadius: "30px",
          }}
        >
          <SearchIcon sx={{ fontSize: { xs: 22, md: 26 } }} />
        </IconButton>
      </Box>
    </Box>
  );
}

