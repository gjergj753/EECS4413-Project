import React from "react";
import {
  Box,
  Grid,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";

export default function FilterPanel({
  showFilters,
  authors,
  selectedAuthor,
  setSelectedAuthor,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
}) {
  return (
    <Collapse in={showFilters}>
      <Box
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          boxShadow: 1,
          backgroundColor: "#fafafa",
        }}
      >
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Author</InputLabel>
              <Select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
              >
                {authors.map((a) => (
                  <MenuItem key={a} value={a}>
                    {a}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} sm={3} md={2}>
            <TextField
              label="Min Price"
              type="number"
              value={priceRange.min}
              onChange={(e) =>
                setPriceRange((p) => ({ ...p, min: Number(e.target.value) }))
              }
              fullWidth
            />
          </Grid>

          <Grid item xs={6} sm={3} md={2}>
            <TextField
              label="Max Price"
              type="number"
              value={priceRange.max}
              onChange={(e) =>
                setPriceRange((p) => ({ ...p, max: Number(e.target.value) }))
              }
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="priceLowHigh">Price: Low → High</MenuItem>
                <MenuItem value="priceHighLow">Price: High → Low</MenuItem>
                <MenuItem value="titleAZ">Title: A → Z</MenuItem>
                <MenuItem value="titleZA">Title: Z → A</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
    </Collapse>
  );
}
