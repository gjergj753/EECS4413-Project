package com.example.backend.controllers;

import com.example.backend.dto.Response;
import com.example.backend.dto.PaymentDto;
import com.example.backend.services.PaymentService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

// REST controller for payment operations
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // Get all payments (admin function)
    @GetMapping
    public Response getAllPayments() {
        List<PaymentDto> payments = paymentService.getAllPayments();
        return Response.builder()
                .status(200)
                .message("Payments retrieved successfully")
                .paymentList(payments)
                .build();
    }

    // Get payment by ID
    @GetMapping("/{id}")
    public Response getPaymentById(@PathVariable Long id) {
        PaymentDto payment = paymentService.getPaymentById(id);
        return Response.builder()
                .status(200)
                .message("Payment found")
                .payment(payment)
                .build();
    }

    // Get payment for specific order
    @GetMapping("/order/{orderId}")
    public Response getPaymentByOrderId(@PathVariable Long orderId) {
        PaymentDto payment = paymentService.getPaymentByOrderId(orderId);
        return Response.builder()
                .status(200)
                .message("Payment found")
                .payment(payment)
                .build();
    }

    // Process payment for an order
    @PostMapping("/order/{orderId}")
    public Response processPayment(
            @PathVariable Long orderId,
            @RequestParam BigDecimal amount) {
        PaymentDto payment = paymentService.processPayment(orderId, amount);
        return Response.builder()
                .status(201)
                .message("Payment processed successfully")
                .payment(payment)
                .build();
    }

    // Refund payment
    @DeleteMapping("/{paymentId}")
    public Response refundPayment(@PathVariable Long paymentId) {
        paymentService.refundPayment(paymentId);
        return Response.builder()
                .status(200)
                .message("Payment refunded successfully")
                .build();
    }
}

