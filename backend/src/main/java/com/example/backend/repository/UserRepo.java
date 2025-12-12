package com.example.backend.repository;

import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepo extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    // Delete user's cart items
    @Modifying
    @Query(value = "DELETE FROM cart_items WHERE cart_id IN (SELECT cart_id FROM cart WHERE user_id = :userId)", nativeQuery = true)
    void deleteCartItemsByUserId(@Param("userId") Long userId);

    // Delete user's cart
    @Modifying
    @Query(value = "DELETE FROM cart WHERE user_id = :userId", nativeQuery = true)
    void deleteCartByUserId(@Param("userId") Long userId);

    // Delete user's addresses
    @Modifying
    @Query(value = "DELETE FROM addresses WHERE user_id = :userId", nativeQuery = true)
    void deleteAddressesByUserId(@Param("userId") Long userId);

    // Delete user's payment methods
    @Modifying
    @Query(value = "DELETE FROM payment_methods WHERE user_id = :userId", nativeQuery = true)
    void deletePaymentMethodsByUserId(@Param("userId") Long userId);

    // Nullify orders.user_id (requires ALTER TABLE orders MODIFY COLUMN user_id BIGINT NULL)
    @Modifying
    @Query(value = "UPDATE orders SET user_id = NULL WHERE user_id = :userId", nativeQuery = true)
    void nullifyOrdersUserId(@Param("userId") Long userId);

    // Delete user's orders (use only if orders.user_id cannot be made nullable)
    @Modifying
    @Query(value = "DELETE FROM order_items WHERE order_id IN (SELECT order_id FROM orders WHERE user_id = :userId)", nativeQuery = true)
    void deleteOrderItemsByUserId(@Param("userId") Long userId);

    @Modifying
    @Query(value = "DELETE FROM payments WHERE order_id IN (SELECT order_id FROM orders WHERE user_id = :userId)", nativeQuery = true)
    void deletePaymentsByUserId(@Param("userId") Long userId);

    @Modifying
    @Query(value = "DELETE FROM orders WHERE user_id = :userId", nativeQuery = true)
    void deleteOrdersByUserId(@Param("userId") Long userId);

    // Break circular FK by setting users.address_id to null
    @Modifying
    @Query(value = "UPDATE users SET address_id = NULL WHERE user_id = :userId", nativeQuery = true)
    void nullifyUserAddressId(@Param("userId") Long userId);

}
