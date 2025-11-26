package com.example.backend.controllers;

import com.example.backend.dto.CheckoutRequest;
import com.example.backend.dto.Response;
import com.example.backend.dto.OrderDto;
import com.example.backend.services.OrderService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// REST controller for order management
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Get orders for by userId ( non admin users can only see their own orders)
    @GetMapping("/user/{userId}")
    public Response getUserOrders(@PathVariable Long userId) {
        List<OrderDto> orders = orderService.getUserOrders(userId);
        return Response.builder()
                .status(200)
                .message("User orders retrieved successfully")
                .orderList(orders)
                .build();
    }

    // Get specific order by ID
    @GetMapping("/{id}")
    public Response getOrderById(@PathVariable Long id) {
        OrderDto order = orderService.getOrderById(id);
        return Response.builder()
                .status(200)
                .message("Order found")
                .order(order)
                .build();
    }

    // Create order from user's cart
    @PostMapping("/user/{userId}")
    public Response createOrderFromCart(@PathVariable Long userId) {
        OrderDto order = orderService.createOrderFromCart(userId);
        return Response.builder()
                .status(201)
                .message("Order created successfully")
                .order(order)
                .build();
    }

    // Checkout with payment processing
    @PostMapping("/checkout")
    public Response checkout(@RequestBody CheckoutRequest request) {
        try {
            OrderDto order = orderService.checkout(request);
            return Response.builder()
                    .status(200)
                    .message("Order placed successfully")
                    .order(order)
                    .build();
        } catch (RuntimeException e) {
            // Handle payment failure
            if (e.getMessage().equals("Credit Card Authorization Failed")) {
                return Response.builder()
                        .status(402)
                        .message("Credit Card Authorization Failed")
                        .build();
            }
            // Other errors
            return Response.builder()
                    .status(400)
                    .message(e.getMessage())
                    .build();
        }
    }

    // Update order status
    @PutMapping("/{orderId}/status")
    public Response updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {
        OrderDto order = orderService.updateOrderStatus(orderId, status);
        return Response.builder()
                .status(200)
                .message("Order status updated")
                .order(order)
                .build();
    }

    // Cancel order
    @DeleteMapping("/{orderId}")
    public Response cancelOrder(@PathVariable Long orderId) {
        orderService.cancelOrder(orderId);
        return Response.builder()
                .status(200)
                .message("Order cancelled successfully")
                .build();
    }
}

