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
      onSearchSubmit();   // calls HomePage search
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: 1,
        width: "100%",
        maxWidth: 600,
        height: 44, 
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
            px: 1.5,
            py: 0,
            height: "44px",       
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
          width: 50,
          height: "44px",       
          borderRadius: 0,
          bgcolor: "#3f51b5",
          color: "white",
          "&:hover": { bgcolor: "#303f9f" },
          borderTopRightRadius: "8px",
          borderBottomRightRadius: "8px",
        }}
      >
        <SearchIcon />
      </IconButton>
    </Box>

  );
}
