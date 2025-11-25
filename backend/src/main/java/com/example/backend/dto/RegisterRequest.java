package com.example.backend.dto;

import lombok.Data;

@Data
public class RegisterRequest {

    private UserDto user;
    private AddressDto address;
    private PaymentMethodDto paymentMethod;


}
