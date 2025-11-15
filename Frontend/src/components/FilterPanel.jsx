import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

export default function FilterPanel({ sortBy, setSortBy }) {
  return (
    <FormControl size="small" sx={{ minWidth: 160 }}>
      <InputLabel>Sort By</InputLabel>
      <Select
        value={sortBy}
        label="Sort By"
        onChange={(e) => setSortBy(e.target.value)}
      >
        <MenuItem value="none">None</MenuItem>
        <MenuItem value="priceLowHigh">Price: Low → High</MenuItem>
        <MenuItem value="priceHighLow">Price: High → Low</MenuItem>
        <MenuItem value="titleAZ">Title: A → Z</MenuItem>
        <MenuItem value="titleZA">Title: Z → A</MenuItem>
      </Select>
    </FormControl>
  );
}
