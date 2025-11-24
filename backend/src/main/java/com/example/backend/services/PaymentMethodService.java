package com.example.backend.services;

import com.example.backend.dto.PaymentMethodDto;
import com.example.backend.dto.Response;
import com.example.backend.entity.PaymentMethod;
import com.example.backend.entity.User;
import com.example.backend.repository.PaymentMethodRepository;
import com.example.backend.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentMethodService {

    private final PaymentMethodRepository paymentMethodRepository;
    private final UserRepo userRepo;

    public Response getAllPaymentMethods(Long userId) {
        List<PaymentMethod> methods = paymentMethodRepository.findByUser_UserId(userId);
        List<PaymentMethodDto> methodDtos = methods.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return Response.builder()
                .status(200)
                .message("Payment methods retrieved")
                .paymentMethodList(methodDtos)
                .build();
    }

    @Transactional
    public Response addPaymentMethod(Long userId, PaymentMethodDto dto) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        PaymentMethod method = new PaymentMethod();
        method.setUser(user);
        method.setCardLast4(dto.getCardLast4());
        method.setCardBrand(dto.getCardBrand());
        method.setExpiryMonth(dto.getExpiryMonth());
        method.setExpiryYear(dto.getExpiryYear());

        // Generate mock token (demo)
        method.setPaymentToken("pm_" + System.currentTimeMillis() + "_" + dto.getCardLast4());

        // If this is the first payment method, make it default
        List<PaymentMethod> existing = paymentMethodRepository.findByUser_UserId(userId);
        method.setDefault(existing.isEmpty());

        PaymentMethod saved = paymentMethodRepository.save(method);

        return Response.builder()
                .status(200)
                .message("Payment method added")
                .paymentMethod(convertToDto(saved))
                .build();
    }

    @Transactional
    public Response setDefaultPaymentMethod(Long userId, Long paymentMethodId) {
        PaymentMethod method = paymentMethodRepository
                .findByPaymentMethodIdAndUser_UserId(paymentMethodId, userId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Payment method with ID " + paymentMethodId + " not found for user " + userId));

        // Unset current default
        paymentMethodRepository.findByUser_UserIdAndIsDefaultTrue(userId)
                .ifPresent(current -> {
                    current.setDefault(false);
                    paymentMethodRepository.save(current);
                });

        // Set new default
        method.setDefault(true);
        PaymentMethod saved = paymentMethodRepository.save(method);

        return Response.builder()
                .status(200)
                .message("Default payment method updated")
                .paymentMethod(convertToDto(saved))
                .build();
    }

    @Transactional
    public Response deletePaymentMethod(Long userId, Long paymentMethodId) {
        PaymentMethod method = paymentMethodRepository
                .findByPaymentMethodIdAndUser_UserId(paymentMethodId, userId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Payment method with ID " + paymentMethodId + " not found for user " + userId));

        boolean wasDefault = method.isDefault();
        paymentMethodRepository.delete(method);

        // If deleted card was default, make another one default
        if (wasDefault) {
            List<PaymentMethod> remaining = paymentMethodRepository.findByUser_UserId(userId);
            if (!remaining.isEmpty()) {
                PaymentMethod newDefault = remaining.get(0);
                newDefault.setDefault(true);
                paymentMethodRepository.save(newDefault);
            }
        }

        return Response.builder()
                .status(200)
                .message("Payment method deleted")
                .build();
    }

    public Response getDefaultPaymentMethod(Long userId) {
        PaymentMethod defaultMethod = paymentMethodRepository
                .findByUser_UserIdAndIsDefaultTrue(userId)
                .orElse(null);

        if (defaultMethod == null) {
            return Response.builder()
                    .status(404)
                    .message("No default payment method found")
                    .build();
        }

        return Response.builder()
                .status(200)
                .message("Default payment method retrieved")
                .paymentMethod(convertToDto(defaultMethod))
                .build();
    }

    private PaymentMethodDto convertToDto(PaymentMethod method) {
        PaymentMethodDto dto = new PaymentMethodDto();
        dto.setPaymentMethodId(method.getPaymentMethodId());
        dto.setUserId(method.getUser().getUserId());
        dto.setCardLast4(method.getCardLast4());
        dto.setCardBrand(method.getCardBrand());
        dto.setExpiryMonth(method.getExpiryMonth());
        dto.setExpiryYear(method.getExpiryYear());
        dto.setDefault(method.isDefault());
        dto.setCreatedAt(method.getCreatedAt());
        return dto;
    }
}

