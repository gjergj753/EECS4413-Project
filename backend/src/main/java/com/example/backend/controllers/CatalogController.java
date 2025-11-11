package com.example.backend.catalog;

import com.example.backend.catalog.dto.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalog")
public class CatalogController {

    private final CatalogService svc;
    public CatalogController(CatalogService svc) { this.svc = svc; }

    // GET /api/catalog/books?page=0&size=20&sort=title&q=clean&category=programming
    @GetMapping("/books")
    public Paged<BookSummaryDto> listBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "title") String sort,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category
    ) {
        return svc.listBooks(page, size, sort, q, category);
    }

    @GetMapping("/books/{id}")
    public BookDetailDto getBook(@PathVariable Long id) {
        return svc.getBook(id);
    }

    @GetMapping("/categories")
    public List<CategoryDto> categories() {
        return svc.categories();
    }
}
