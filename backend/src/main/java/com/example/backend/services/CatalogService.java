package com.example.backend.catalog;

import com.example.backend.catalog.dto.*;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
public class CatalogService {

    public Paged<BookSummaryDto> listBooks(int page, int size, String sort, String q, String category) {
        var items = List.of(
                new BookSummaryDto(1L, "Placeholder title 1", "firstName1 LastName1", new BigDecimal("39.99"), null),
                new BookSummaryDto(2L, "Placeholder title 2", "firstName2 LastName2", new BigDecimal("49.99"), null)
        );
        return new Paged<>(items, page, size, items.size(), 1);
    }

    public BookDetailDto getBook(Long id) {
        return new BookDetailDto(
                id,
                "book title",
                "Authors name here",
                "some description about the book here...",
                new BigDecimal("420.69"),
                12,
                List.of("categoryA", "best-seller"),
                null
        );
    }

    public List<CategoryDto> categories() {
        return List.of(
                new CategoryDto("categoryA","some book title", 2),
                new CategoryDto("CategoryB","another book title", 0)
        );
    }
}
