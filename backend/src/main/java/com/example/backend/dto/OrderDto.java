package com.example.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@AllArgsConstructor
@NoArgsConstructor
public class OrderDto {

    private Long orderId;

    private UserDto user;

    private BigDecimal totalPrice;

    // Allows serialization of order items, paired with @JsonBackReference in OrderItemDto
    @JsonManagedReference("order-items")
    private List<OrderItemDto> orderItemList;

    private String status;

    private LocalDateTime createdAt;

    private PaymentDto payment;

    private String shippingStreet;
    private String shippingCity;
    private String shippingProvince;
    private String shippingPostalCode;
    private String shippingCountry;


}
