import React from "react";
import { Box, TextField, InputAdornment, MenuItem, Select, FormControl } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function SearchBar({ genres, selectedGenre, onGenreChange, searchQuery, onSearchChange, onSearchSubmit }) {
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSearchSubmit();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: 1,
        width: "100%",
        maxWidth: 600,
      }}
    >
      {/* Genre Dropdown */}
      <FormControl sx={{ minWidth: 130, borderRight: "1px solid #ccc" }}>
        <Select
          value={selectedGenre}
          onChange={(e) => onGenreChange(e.target.value)}
          sx={{
            "& .MuiSelect-select": {
              py: 1.2,
              pl: 1.5,
            },
          }}
        >
          {genres.map((genre) => (
            <MenuItem key={genre} value={genre}>
              {genre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Search Field */}
      <TextField
        variant="standard"
        placeholder="Search by title, author, or keyword..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={handleKeyPress}
        InputProps={{
          disableUnderline: true,
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{
          flexGrow: 1,
          px: 1.5,
          backgroundColor: "#fff",
        }}
      />
    </Box>
  );
}