package com.example.backend.dto;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@AllArgsConstructor
@NoArgsConstructor
public class CartDto {

    private Long cartId;

    // Prevents circular reference: Cart -> User -> Cart loop
    @JsonBackReference("user-cart")
    private UserDto user;

    // Allows serialization of cart items, paired with @JsonBackReference in CartItemDto
    @JsonManagedReference("cart-items")
    private List<CartItemDto> cartItemList;
}
