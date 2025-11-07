package com.example.backend.repository;

import com.example.backend.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookRepo extends JpaRepository<Book, Long> {
//
//    List<Book> findByGenre(String genre);
//    List<Book> findByTitle(String title);
//    List<Book> findByDescription(String description);
//    List<Book> findByAuthor(String author);
//    Optional<Book> findByIsbn(String isbn);
}
