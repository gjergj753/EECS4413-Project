package com.example.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Response {

    private int status;
    private String message;
    private final LocalDateTime timestamp = LocalDateTime.now();
    private String token;
    private String role;
    private String expirationTime;
    private int totalPage;
    private long totalElements;

    private AddressDto address;

    private UserDto user;
    private List<UserDto> userList;

    private BookDto book;
    private List<BookDto> bookList;

    private OrderDto order;
    private List<OrderDto> orderList;

    private PaymentDto payment;
    private List<PaymentDto> paymentList;

    private OrderItemDto orderItem;
    private List<OrderItemDto> orderItemList;

    private CartDto cart;
    private List<CartDto> cartList;

    private CartItemDto cartItem;
    private List<CartItemDto> cartItemList;


}
