package com.example.backend.controllers;

import com.example.backend.dto.Response;
import com.example.backend.dto.UserDto;
import com.example.backend.services.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// REST controller for user management operations
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Get all users
    @GetMapping
    public Response getAllUsers() {
        List<UserDto> users = userService.getAllUsers();
        return Response.builder()
                .status(200)
                .message("Users retrieved successfully")
                .userList(users)
                .build();
    }

    // Get specific user by ID
    @GetMapping("/{id}")
    public Response getUserById(@PathVariable Long id) {
        UserDto user = userService.getUserById(id);
        return Response.builder()
                .status(200)
                .message("User found")
                .user(user)
                .build();
    }

    // Get user by email
    @GetMapping("/email/{email}")
    public Response getUserByEmail(@PathVariable String email) {
        UserDto user = userService.getUserByEmail(email);
        return Response.builder()
                .status(200)
                .message("User found")
                .user(user)
                .build();
    }

    // Create new user (registration)
    @PostMapping
    public Response createUser(@RequestBody UserDto userDto) {
        UserDto createdUser = userService.createUser(userDto);
        return Response.builder()
                .status(201)
                .message("User created successfully")
                .user(createdUser)
                .build();
    }

    // Update existing user
    @PutMapping("/{id}")
    public Response updateUser(@PathVariable Long id, @RequestBody UserDto userDto) {
        UserDto updatedUser = userService.updateUser(id, userDto);
        return Response.builder()
                .status(200)
                .message("User updated successfully")
                .user(updatedUser)
                .build();
    }

    // Delete user
    @DeleteMapping("/{id}")
    public Response deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return Response.builder()
                .status(200)
                .message("User deleted successfully")
                .build();
    }
}

