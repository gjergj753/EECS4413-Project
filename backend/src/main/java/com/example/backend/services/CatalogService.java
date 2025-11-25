package com.example.backend.services;

import com.example.backend.dto.BookDto;
import com.example.backend.entity.Book;
import com.example.backend.repository.BookRepo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Service layer for catalog operations.
 * logic for book browsing, searching, and retrieval.
 */
@Service
@Transactional
public class CatalogService {

    // Repo for db access. Spring Data JPA providing CRUD operations
    private final BookRepo bookRepo;

    public CatalogService(BookRepo bookRepo) {
        this.bookRepo = bookRepo;
    }

    public Page<BookDto> listBooks(int page, int size, String sortBy, String search, String genre) {
        //Create pagination configuration. PageRequest combines page number, size, and sort order
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));

        Page<Book> bookPage;

        // Apply filters based on provided parameters. Check search and genre to decide which query method to use
        if (genre != null && !genre.trim().isEmpty() && search != null && !search.trim().isEmpty()) {
            // Both search and genre filter are applied, search in both title and author fields, filtered by genre
            bookPage = bookRepo.findByTitleOrAuthorAndGenre(search, search, genre, pageable);
        } else if (genre != null && !genre.trim().isEmpty()) {
            // Only the genre filter applied
            bookPage = bookRepo.findByGenre(genre, pageable);
        } else if (search != null && !search.trim().isEmpty()) {
            // Only search term applied. search in both title and author fields
            bookPage = bookRepo.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(
                    search, search, pageable);
        } else {
            // No filters. retrieve all books with pagination.
            bookPage = bookRepo.findAll(pageable);
        }

        // Convert Page<Book> to Page<BookDto>, transforms each Book entity to BookDto.
        return bookPage.map(this::convertToDto);
    }

    public BookDto getBookById(Long id) {
        // findById returns Optional<Book> - we handle the case where book doesn't exist
        Book book = bookRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));

        // Convert entity to DTO before returning
        return convertToDto(book);
    }

    public BookDto createBook(BookDto bookDto){
        Book book = new Book();
        book.setAuthor(bookDto.getAuthor());
        book.setTitle(bookDto.getTitle());
        book.setPrice(bookDto.getPrice());
        book.setDescription(bookDto.getDescription());
        book.setIsbn(bookDto.getIsbn());

        // Full-size image and thumbnail
        book.setImageUrl(bookDto.getImageUrl());
        book.setThumbnailUrl(bookDto.getThumbnailUrl());

        book.setQuantity(bookDto.getQuantity());
        book.setYear(bookDto.getYear());
        book.setGenres(bookDto.getGenres() != null ? bookDto.getGenres() : new ArrayList<>());

        Book saved = bookRepo.save(book);

        return convertToDto(saved);
    }

    public void deleteBook(Long id){
        if (!bookRepo.existsById(id)) {
            throw new RuntimeException("Book not found with id: " + id);
        }
        bookRepo.deleteById(id);
    }

    public List<String> getAllGenres() {
        return bookRepo.findAllDistinctGenres();
    }

    // Admin updates book stock quantity
    public BookDto updateBookStock(Long bookId, int quantity) {
        Book book = bookRepo.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + bookId));

        if (quantity < 0) {
            throw new IllegalArgumentException("Stock quantity cannot be negative");
        }

        book.setQuantity(quantity);
        Book updatedBook = bookRepo.save(book);
        return convertToDto(updatedBook);
    }

    //Helper method to convert Book entity to BookDto.
    //DTOs are used to control what data is exposed via the API.
    private BookDto convertToDto(Book book) {
        BookDto dto = new BookDto();

        // Map each field from entity to DTO
        dto.setBookId(book.getBookId());
        dto.setTitle(book.getTitle());
        dto.setAuthor(book.getAuthor());
        dto.setPrice(book.getPrice());
        dto.setDescription(book.getDescription());
        dto.setIsbn(book.getIsbn());

        dto.setImageUrl(book.getImageUrl());
        dto.setThumbnailUrl(book.getThumbnailUrl());

        dto.setQuantity(book.getQuantity());
        dto.setYear(book.getYear());
        dto.setGenres(book.getGenres());

        return dto;
    }
}
