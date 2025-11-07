package com.example.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookId;

    @NotBlank(message = "Author is required")
    private String author;

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Price is required")
    private BigDecimal price;

    private String description;

    @NotBlank(message = "ISBN is required")
    @Column(unique = true)
    private String isbn;

    private String imageUrl;

    @NotNull(message = "Quantity is required")
    private int quantity;

    @NotNull(message = "Year is required")
    private int year;

    @ElementCollection
    @CollectionTable(name = "book_genres", joinColumns = @JoinColumn(name = "book_id"))
    @Column(name = "genre")
    private List<String> genres = new ArrayList<>();

}
