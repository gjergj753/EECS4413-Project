package com.example.backend.services;

import com.example.backend.dto.PaymentDto;
import com.example.backend.entity.Order;
import com.example.backend.entity.Payment;
import com.example.backend.repository.OrderRepo;
import com.example.backend.repository.PaymentRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

// Handles payment logic that sits between controllers and the database
@Service
@Transactional
public class PaymentService {

    private final PaymentRepo paymentRepo;
    private final OrderRepo orderRepo;

    public PaymentService(PaymentRepo paymentRepo, OrderRepo orderRepo) {
        this.paymentRepo = paymentRepo;
        this.orderRepo = orderRepo;
    }

    public List<PaymentDto> getAllPayments() {
        return paymentRepo.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public PaymentDto getPaymentById(Long id) {
        Payment payment = paymentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
        return convertToDto(payment);
    }

    public PaymentDto getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepo.findByOrderOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for order: " + orderId));
        return convertToDto(payment);
    }

    public PaymentDto processPayment(Long orderId, BigDecimal amount) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        // validate that the amount matches the order total
        if (order.getTotalPrice().compareTo(amount) != 0) {
            throw new RuntimeException("Payment amount does not match order total");
        }

        // prevent creating multiple payments for the same order
        if (paymentRepo.findByOrderOrderId(orderId).isPresent()) {
            throw new RuntimeException("Payment already exists for this order");
        }

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentAmount(amount);

        Payment savedPayment = paymentRepo.save(payment);

        // update the order status after a successful payment
        order.setStatus("PAID");
        orderRepo.save(order);

        return convertToDto(savedPayment);
    }

    public void refundPayment(Long paymentId) {
        Payment payment = paymentRepo.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + paymentId));

        Order order = payment.getOrder();
        if (order != null) {
            // mark the order as refunded when the payment is removed
            order.setStatus("REFUNDED");
            orderRepo.save(order);
        }

        paymentRepo.delete(payment);
    }

    private PaymentDto convertToDto(Payment payment) {
        PaymentDto dto = new PaymentDto();
        dto.setPaymentId(payment.getPaymentId());
        dto.setPaymentAmount(payment.getPaymentAmount());
        dto.setCreatedAt(payment.getCreatedAt());

        if (payment.getPaymentMethod() != null) {
            dto.setPaymentMethodId(payment.getPaymentMethod().getPaymentMethodId());
        }
        dto.setCardLast4(payment.getCardLast4());
        dto.setCardBrand(payment.getCardBrand());

        return dto;
    }
}
