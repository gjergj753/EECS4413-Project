package com.example.backend.dto;


import com.example.backend.entity.Book;
import com.example.backend.entity.Cart;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@AllArgsConstructor
@NoArgsConstructor
public class CartItemDto {

    private Long cartItemId;

    private CartDto cart;

    private BookDto book;

    private int quantity;

}
