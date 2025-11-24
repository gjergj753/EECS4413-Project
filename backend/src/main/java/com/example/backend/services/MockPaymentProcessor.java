package com.example.backend.services;

import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicInteger;


@Service
public class MockPaymentProcessor {

    // Counter to track payment attempts
    private final AtomicInteger paymentAttemptCounter = new AtomicInteger(0);

    // Returns true if payment accepted, false if denied
    public boolean processPayment(String cardNumber, String cardBrand, String cvv, String expiryMonth, String expiryYear, double amount) {

        int attemptNumber = paymentAttemptCounter.incrementAndGet();

        // deny every 3rd payment attempt
        if (attemptNumber % 3 == 0) {
            return false;
        }

        // Basic validation checks that fail payment
        if (cardNumber == null || cardNumber.length() < 13) {
            return false;
        }

        if (amount <= 0) {
            return false;
        }

        // Check if card is expired
        try {
            int expMonth = Integer.parseInt(expiryMonth);
            int expYear = Integer.parseInt(expiryYear);

            if (expMonth < 1 || expMonth > 12) {
                return false;
            }

            // accept cards expiring in 2025 or later
            if (expYear < 2025) {
                return false;
            }
        } catch (NumberFormatException e) {
            return false;
        }

        // Payment accepted
        return true;
    }

    // for saved payment methods (using token rather than card )
    public boolean processPaymentWithToken(String paymentToken, double amount) {

        int attemptNumber = paymentAttemptCounter.incrementAndGet();

        // deny every 3rd payment attempt
        if (attemptNumber % 3 == 0) {
            return false;
        }

        // Basic validation
        if (paymentToken == null || paymentToken.isEmpty()) {
            return false;
        }

        if (amount <= 0) {
            return false;
        }

        // Payment accepted
        return true;
    }

    // Reset counter
    public void resetCounter() {
        paymentAttemptCounter.set(0);
    }

    // Get current attempt count
    public int getAttemptCount() {
        return paymentAttemptCounter.get();
    }
}

