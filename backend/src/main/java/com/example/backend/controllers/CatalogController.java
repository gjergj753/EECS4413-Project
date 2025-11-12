package com.example.backend.controllers;

import com.example.backend.dto.BookDto;
import com.example.backend.dto.Response;
import com.example.backend.services.CatalogService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;


//REST controller for the book catalog. Handles HTTP requests for browsing and searching books.
@RestController
@RequestMapping("/api/catalog")
public class CatalogController {

    // Service layer handles business logic and data access
    private final CatalogService catalogService;

    // Constructor injection for better testability and dependency management
    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    /**
     * List all books with pagination and optional search filtering.
     *
     * @param page Current page number
     * @param size Number of items per page
     * @param sort Field to sort by ("title", "price", "author")
     * @param search Search query for filtering books by title or author
     * @param genre Filter books by specific genre
     * @return Response object containing a paginated list of books
     *
     * Example: GET /api/catalog/books?page=0&size=20&sort=title&search=java&genre=programming
     */
    @GetMapping("/books")
    public Response listBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "title") String sort,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String genre
    ) {
        // Delegate to service layer to retrieve paginated books
        Page<BookDto> books = catalogService.listBooks(page, size, sort, search, genre);

        // Wrap the result in a Response object
        return Response.builder()
                .status(200)
                .message("Books retrieved successfully")
                .bookList(books.getContent())  // List of books on current page
                .totalPage(books.getTotalPages())  // Total number of pages
                .totalElements(books.getTotalElements())  // Total number of books
                .build();
    }

    /**
     * Get detailed information about a specific book by its ID.
     * Example: GET /api/catalog/books/1
     */
    @GetMapping("/books/{id}")
    public Response getBook(@PathVariable Long id) {

        BookDto book = catalogService.getBookById(id);

        // Wrap the result in a Response object
        return Response.builder()
                .status(200)
                .message("Book found successfully")
                .book(book)
                .build();
    }
}
