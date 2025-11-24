package com.example.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@AllArgsConstructor
@NoArgsConstructor
public class CheckoutRequest {

    private Long userId;
    private Long addressId;

    //Use saved payment method
    private Long paymentMethodId;

    // Use temporary payment info
    private TemporaryPaymentInfo temporaryPayment;

    // should payment be saved for future use??
    private boolean savePaymentMethod = false;

    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonIgnoreProperties(ignoreUnknown = true)
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TemporaryPaymentInfo {
        private String cardNumber;
        private String cardBrand;
        private String cvv;
        private String expiryMonth;
        private String expiryYear;
        private String cardholderName;
    }
}

