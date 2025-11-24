package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "payment_methods")
public class PaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentMethodId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String cardLast4;
    private String cardBrand;
    private String expiryMonth;
    private String expiryYear;

    // Token from payment gateway
    private String paymentToken;

    private boolean isDefault = false;

    @Column(name = "created_at")
    private final LocalDateTime createdAt = LocalDateTime.now();
}

