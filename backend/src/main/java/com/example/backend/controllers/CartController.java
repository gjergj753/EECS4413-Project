package com.example.backend.controllers;

import com.example.backend.dto.Response;
import com.example.backend.dto.CartDto;
import com.example.backend.services.CartService;
import org.springframework.web.bind.annotation.*;

// REST controller for shopping cart operations
@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // Get user's cart
    @GetMapping("/user/{userId}")
    public Response getCartByUserId(@PathVariable Long userId) {
        CartDto cart = cartService.getCartByUserId(userId);
        return Response.builder()
                .status(200)
                .message("Cart retrieved successfully")
                .cart(cart)
                .build();
    }

    // Create new cart for user
    @PostMapping("/user/{userId}")
    public Response createCart(@PathVariable Long userId) {
        CartDto cart = cartService.createCart(userId);
        return Response.builder()
                .status(201)
                .message("Cart created successfully")
                .cart(cart)
                .build();
    }

    // Add item to cart
    @PostMapping("/user/{userId}/items")
    public Response addItemToCart(
            @PathVariable Long userId,
            @RequestParam Long bookId,
            @RequestParam(defaultValue = "1") int quantity) {
        CartDto cart = cartService.addItemToCart(userId, bookId, quantity);
        return Response.builder()
                .status(200)
                .message("Item added to cart")
                .cart(cart)
                .build();
    }

    // Update cart item quantity
    @PutMapping("/user/{userId}/items/{cartItemId}")
    public Response updateCartItemQuantity(
            @PathVariable Long userId,
            @PathVariable Long cartItemId,
            @RequestParam int quantity) {
        CartDto cart = cartService.updateCartItemQuantity(userId, cartItemId, quantity);
        return Response.builder()
                .status(200)
                .message("Cart item updated")
                .cart(cart)
                .build();
    }

    // Remove item from cart
    @DeleteMapping("/user/{userId}/items/{cartItemId}")
    public Response removeItemFromCart(
            @PathVariable Long userId,
            @PathVariable Long cartItemId) {
        CartDto cart = cartService.removeItemFromCart(userId, cartItemId);
        return Response.builder()
                .status(200)
                .message("Item removed from cart")
                .cart(cart)
                .build();
    }

    // Clear entire cart
    @DeleteMapping("/user/{userId}")
    public Response clearCart(@PathVariable Long userId) {
        CartDto cart = cartService.clearCart(userId);
        return Response.builder()
                .status(200)
                .message("Cart cleared")
                .cart(cart)
                .build();
    }
}

