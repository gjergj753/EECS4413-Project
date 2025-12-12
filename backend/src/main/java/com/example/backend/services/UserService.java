package com.example.backend.services;

import com.example.backend.dto.UserDto;
import com.example.backend.entity.Order;
import com.example.backend.entity.User;
import com.example.backend.repository.OrderRepo;
import com.example.backend.repository.UserRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

// Service for user-related operations like registration, profile updates, etc.
@Service
@Transactional
public class UserService {

    private final UserRepo userRepo;
    private final OrderRepo orderRepo;

    public UserService(UserRepo userRepo, OrderRepo orderRepo) {
        this.userRepo = userRepo;
        this.orderRepo = orderRepo;
    }

    // Get all users (admin function)
    public List<UserDto> getAllUsers() {
        return userRepo.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Get specific user by ID
    public UserDto getUserById(Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return convertToDto(user);
    }

    // Find user by email (useful for login)
    public UserDto getUserByEmail(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return convertToDto(user);
    }

    // Create new user (registration)
    public UserDto createUser(UserDto userDto) {
        User user = new User();
        user.setEmail(userDto.getEmail());
        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());
        user.setHashedPassword(userDto.getHashedPassword()); // Should be hashed before this
        user.setAdmin(userDto.isAdmin());

        User savedUser = userRepo.save(user);
        return convertToDto(savedUser);
    }

    // Update existing user
    public UserDto updateUser(Long id, UserDto userDto) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // only update fields that are provided
        if (userDto.getEmail() != null) user.setEmail(userDto.getEmail());
        if (userDto.getFirstName() != null) user.setFirstName(userDto.getFirstName());
        if (userDto.getLastName() != null) user.setLastName(userDto.getLastName());
        if (userDto.getHashedPassword() != null) user.setHashedPassword(userDto.getHashedPassword());

        User updatedUser = userRepo.save(user);
        return convertToDto(updatedUser);
    }

    // Delete user
    // Handles cascade deletion of addresses, cart, payment methods
    // Orders are preserved by setting user to null (for audit trail)
    public void deleteUser(Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Preserve orders by nullifying the user reference
        // This keeps order history for business records
        List<Order> userOrders = user.getOrders();
        if (userOrders != null && !userOrders.isEmpty()) {
            for (Order order : userOrders) {
                order.setUser(null);
            }
            orderRepo.saveAll(userOrders);
        }

        // Clear collections to help with cascade delete
        user.getAddressList().clear();
        user.getPaymentMethods().clear();
        if (user.getCart() != null) {
            user.setCart(null);
        }

        // Now delete the user - cascade will handle related entities
        userRepo.delete(user);
    }

    private UserDto convertToDto(User user) {
        UserDto dto = new UserDto();
        dto.setUserId(user.getUserId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setAdmin(user.isAdmin());
        dto.setHashedPassword(user.getHashedPassword());
        // password is write-only on the DTO
        return dto;
    }

    public UserDto login(String email, String password){
        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found with email: "+ email));
        if(!(user.getHashedPassword().equals(password))){
            throw new IllegalArgumentException("Invalid Password");
        }

        return convertToDto(user);
    }

    // Admin updates user info
    public UserDto updateUserInfo(Long userId, UserDto userDto) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Update fields if provided
        if (userDto.getEmail() != null) user.setEmail(userDto.getEmail());
        if (userDto.getFirstName() != null) user.setFirstName(userDto.getFirstName());
        if (userDto.getLastName() != null) user.setLastName(userDto.getLastName());

        // Admin can set admin/non admin  users
        user.setAdmin(userDto.isAdmin());

        User updatedUser = userRepo.save(user);
        return convertToDto(updatedUser);
    }

    // Admin resets user password
    public void updateUserPassword(Long userId, String newPassword) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (newPassword == null || newPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }

        user.setHashedPassword(newPassword);
        userRepo.save(user);
    }
}
