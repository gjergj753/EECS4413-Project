package com.example.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@AllArgsConstructor
@NoArgsConstructor
public class BookDto {

    private Long bookId;

    private String author;

    private String title;

    private BigDecimal price;

    private String description;

    private String isbn;

    // Full-size image URL
    private String imageUrl;

    // Thumbnail image URL for cards / lists
    private String thumbnailUrl;

    private int quantity;

    private int year;

    private List<String> genres;
}
