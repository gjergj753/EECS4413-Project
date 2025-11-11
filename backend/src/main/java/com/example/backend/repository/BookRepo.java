package com.example.backend.repository;

import com.example.backend.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * Repository interface for Book entity using Jpa
 */
public interface BookRepo extends JpaRepository<Book, Long> {


    Page<Book> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    Page<Book> findByAuthorContainingIgnoreCase(String author, Pageable pageable);

    Page<Book> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(
            String title, String author, Pageable pageable);

    @Query("SELECT b FROM Book b JOIN b.genres g WHERE g = :genre")
    Page<Book> findByGenre(@Param("genre") String genre, Pageable pageable);

    @Query("SELECT b FROM Book b JOIN b.genres g WHERE " +
           "(LOWER(b.title) LIKE LOWER(CONCAT('%', :title, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :author, '%'))) AND " +
           "g = :genre")
    Page<Book> findByTitleOrAuthorAndGenre(
            @Param("title") String title,
            @Param("author") String author,
            @Param("genre") String genre,
            Pageable pageable);

    Optional<Book> findByIsbn(String isbn);
}
