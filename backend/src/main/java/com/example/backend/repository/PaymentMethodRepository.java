package com.example.backend.repository;

import com.example.backend.entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {

    List<PaymentMethod> findByUser_UserId(Long userId);

    Optional<PaymentMethod> findByPaymentMethodIdAndUser_UserId(Long paymentMethodId, Long userId);

    Optional<PaymentMethod> findByUser_UserIdAndIsDefaultTrue(Long userId);
}

