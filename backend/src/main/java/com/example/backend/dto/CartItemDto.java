package com.example.backend.dto;


import com.fasterxml.jackson.annotation.JsonBackReference;
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

    // Prevents circular reference: CartItem -> Cart -> CartItem loop
    @JsonBackReference("cart-items")
    private CartDto cart;

    private BookDto book;

    private int quantity;

}
