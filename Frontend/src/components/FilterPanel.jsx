import React from "react";
import { FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";

export default function FilterPanel({ sortBy, setSortBy }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <FormControl
        size="small"
        sx={{
          minWidth: { xs: 150, sm: 180, md: 220 },
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: 2,
          transition: "0.2s ease",
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
          },
          "& .MuiSelect-select": {
            py: 1.2,
          },
        }}
      >
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
    </Box>
  );
}

