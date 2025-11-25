package com.example.backend.dto;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@AllArgsConstructor
@NoArgsConstructor
public class PaymentMethodDto {

    private Long paymentMethodId;
    private Long userId;
    private String cardLast4;
    private String cardBrand;
    private String expiryMonth;
    private String expiryYear;
    private boolean isDefault;
    private LocalDateTime createdAt;

    @JsonBackReference("user-payment-method")
    private UserDto user;

    //paymentToken is not included for security
}

