import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

export default function GenreFilter({ genres, selectedGenre, onChange }) {
  return (
    <FormControl sx={{ minWidth: 200, mb: 3 }}>
      <InputLabel>Filter by Genre</InputLabel>
      <Select value={selectedGenre} label="Genre" onChange={(e) => onChange(e.target.value)}>
        <MenuItem value="">All</MenuItem>
        {genres.map((genre) => (
          <MenuItem key={genre} value={genre}>
            {genre}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}