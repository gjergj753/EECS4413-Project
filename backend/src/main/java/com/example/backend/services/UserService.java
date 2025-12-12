package com.example.backend.services;

import com.example.backend.dto.UserDto;
import com.example.backend.entity.User;
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

    public UserService(UserRepo userRepo) {
        this.userRepo = userRepo;
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

    // Delete user with all related entities using native SQL
    // This handles the circular FK constraint between users and addresses
    // Orders are preserved with user_id set to null for audit (or deleted if DB doesn't allow NULL)
    @Transactional
    public void deleteUser(Long id) {
        // Verify user exists
        if (!userRepo.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }

        // Delete in correct order to respect FK constraints
        // 1. Handle orders - try to nullify first (preserve for audit)
        try {
            userRepo.nullifyOrdersUserId(id);
        } catch (Exception e) {
            // If nullifying fails (orders.user_id is NOT NULL in DB),
            // delete orders and related data instead
            userRepo.deletePaymentsByUserId(id);
            userRepo.deleteOrderItemsByUserId(id);
            userRepo.deleteOrdersByUserId(id);
        }

        // 2. Delete cart items (FK to cart)
        userRepo.deleteCartItemsByUserId(id);

        // 3. Delete cart (FK to user)
        userRepo.deleteCartByUserId(id);

        // 4. Delete payment methods (FK to user)
        userRepo.deletePaymentMethodsByUserId(id);

        // 5. Delete addresses (FK to user)
        userRepo.deleteAddressesByUserId(id);

        // 6. Break circular FK by nullifying users.address_id
        userRepo.nullifyUserAddressId(id);

        // 7. Finally delete the user
        userRepo.deleteById(id);
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
