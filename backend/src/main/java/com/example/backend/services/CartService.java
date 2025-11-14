package com.example.backend.services;

import com.example.backend.dto.CartDto;
import com.example.backend.dto.CartItemDto;
import com.example.backend.dto.BookDto;
import com.example.backend.entity.Cart;
import com.example.backend.entity.CartItem;
import com.example.backend.entity.Book;
import com.example.backend.entity.User;
import com.example.backend.repository.CartRepo;
import com.example.backend.repository.CartItemRepo;
import com.example.backend.repository.BookRepo;
import com.example.backend.repository.UserRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

// Service for shopping cart operations like adding/removing items
@Service
@Transactional
public class CartService {

    private final CartRepo cartRepo;
    private final CartItemRepo cartItemRepo;
    private final BookRepo bookRepo;
    private final UserRepo userRepo;

    public CartService(CartRepo cartRepo, CartItemRepo cartItemRepo, BookRepo bookRepo, UserRepo userRepo) {
        this.cartRepo = cartRepo;
        this.cartItemRepo = cartItemRepo;
        this.bookRepo = bookRepo;
        this.userRepo = userRepo;
    }

    // Get user's cart by user ID
    public CartDto getCartByUserId(Long userId) {
        Cart cart = cartRepo.findByUserUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found for user: " + userId));
        return convertToDto(cart);
    }

    // Create a new cart for a user
    public CartDto createCart(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Cart cart = new Cart();
        cart.setUser(user);

        Cart savedCart = cartRepo.save(cart);
        return convertToDto(savedCart);
    }

    // Add item to cart (or update quantity if already exists)
    public CartDto addItemToCart(Long userId, Long bookId, int quantity) {
        Cart cart = cartRepo.findByUserUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found for user: " + userId));

        Book book = bookRepo.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + bookId));

        // Check if item already exists in cart
        CartItem existingItem = cart.getCartItemList().stream()
                .filter(item -> item.getBook().getBookId().equals(bookId))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            // Update quantity if item already in cart
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
        } else {
            // Add new item to cart
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setBook(book);
            newItem.setQuantity(quantity);
            cart.getCartItemList().add(newItem);
        }

        Cart updatedCart = cartRepo.save(cart);
        return convertToDto(updatedCart);
    }

    // Remove item from cart
    public CartDto removeItemFromCart(Long userId, Long cartItemId) {
        Cart cart = cartRepo.findByUserUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found for user: " + userId));

        CartItem itemToRemove = cart.getCartItemList().stream()
                .filter(item -> item.getCartItemId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Cart item not found: " + cartItemId));

        cart.getCartItemList().remove(itemToRemove);
        cartItemRepo.delete(itemToRemove);

        Cart updatedCart = cartRepo.save(cart);
        return convertToDto(updatedCart);
    }

    // Update cart item quantity
    public CartDto updateCartItemQuantity(Long userId, Long cartItemId, int quantity) {
        Cart cart = cartRepo.findByUserUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found for user: " + userId));

        CartItem item = cart.getCartItemList().stream()
                .filter(cartItem -> cartItem.getCartItemId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Cart item not found: " + cartItemId));

        item.setQuantity(quantity);
        Cart updatedCart = cartRepo.save(cart);
        return convertToDto(updatedCart);
    }

    // Clear all items from cart
    public CartDto clearCart(Long userId) {
        Cart cart = cartRepo.findByUserUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found for user: " + userId));

        cart.getCartItemList().clear();
        Cart clearedCart = cartRepo.save(cart);
        return convertToDto(clearedCart);
    }

    // Convert Cart entity to CartDto
    private CartDto convertToDto(Cart cart) {
        CartDto dto = new CartDto();
        dto.setCartId(cart.getCartId());

        // Convert cart items without circular references
        if (cart.getCartItemList() != null) {
            dto.setCartItemList(cart.getCartItemList().stream()
                    .map(this::convertCartItemToDto)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    // Convert CartItem to CartItemDto
    private CartItemDto convertCartItemToDto(CartItem cartItem) {
        CartItemDto dto = new CartItemDto();
        dto.setCartItemId(cartItem.getCartItemId());
        dto.setQuantity(cartItem.getQuantity());

        // Include book info but avoid circular references
        if (cartItem.getBook() != null) {
            dto.setBook(convertBookToDto(cartItem.getBook()));
        }

        return dto;
    }

    // Convert Book to BookDto (simplified to avoid pulling in CatalogService)
    private BookDto convertBookToDto(Book book) {
        BookDto dto = new BookDto();
        dto.setBookId(book.getBookId());
        dto.setTitle(book.getTitle());
        dto.setAuthor(book.getAuthor());
        dto.setPrice(book.getPrice());
        dto.setDescription(book.getDescription());
        dto.setIsbn(book.getIsbn());
        dto.setImageUrl(book.getImageUrl());
        dto.setQuantity(book.getQuantity());
        dto.setYear(book.getYear());
        dto.setGenres(book.getGenres());
        return dto;
    }
}

