package com.example.backend.controllers;

import com.example.backend.dto.PaymentMethodDto;
import com.example.backend.dto.Response;
import com.example.backend.services.PaymentMethodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment-methods")
@RequiredArgsConstructor
public class PaymentMethodController {

    private final PaymentMethodService paymentMethodService;

    // Get all saved payment methods for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<Response> getAllPaymentMethods(@PathVariable Long userId) {
        Response response = paymentMethodService.getAllPaymentMethods(userId);
        return ResponseEntity.ok(response);
    }

    // Add a new payment method to user's saved cards
    @PostMapping("/user/{userId}")
    public ResponseEntity<Response> addPaymentMethod(
            @PathVariable Long userId,
            @RequestBody PaymentMethodDto dto) {
        try {
            Response response = paymentMethodService.addPaymentMethod(userId, dto);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Response errorResponse = Response.builder()
                    .status(404)
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    // Set a payment method as default
    @PatchMapping("/{paymentMethodId}/default")
    public ResponseEntity<Response> setDefaultPaymentMethod(
            @PathVariable Long paymentMethodId,
            @RequestParam Long userId) {
        try {
            Response response = paymentMethodService.setDefaultPaymentMethod(userId, paymentMethodId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Response errorResponse = Response.builder()
                    .status(404)
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    // Delete a saved payment method
    @DeleteMapping("/{paymentMethodId}")
    public ResponseEntity<Response> deletePaymentMethod(
            @PathVariable Long paymentMethodId,
            @RequestParam Long userId) {
        try {
            Response response = paymentMethodService.deletePaymentMethod(userId, paymentMethodId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Response errorResponse = Response.builder()
                    .status(404)
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    // Get default payment method
    @GetMapping("/user/{userId}/default")
    public ResponseEntity<Response> getDefaultPaymentMethod(@PathVariable Long userId) {
        Response response = paymentMethodService.getDefaultPaymentMethod(userId);
        return ResponseEntity.ok(response);
    }
}

