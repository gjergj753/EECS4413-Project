package com.example.backend.controllers;

import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.Response;
import com.example.backend.dto.UserDto;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepo;
import com.example.backend.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<Response> registerUser(@RequestBody UserDto registrationRequest){

        UserDto registeredUser = userService.createUser(registrationRequest);

        Response response = Response.builder()
                .status(201)
                .message("User registered successfully")
                .user(registeredUser)
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<Response> loginUser(@RequestBody LoginRequest registrationRequest) {

        try {
            // Delegate login logic to service
            UserDto user = userService.login(
                    registrationRequest.getEmail(),
                    registrationRequest.getPassword()
            );

            Response success = Response.builder()
                    .status(200)
                    .message("Login successful")
                    .user(user)
                    .build();

            return ResponseEntity.ok(success);

        } catch (IllegalArgumentException e) {
            // Invalid password
            Response errorResponse = Response.builder()
                    .status(401)
                    .message("Invalid password")
                    .build();
            return ResponseEntity.status(401).body(errorResponse);

        } catch (RuntimeException e) {
            // User not found
            Response errorResponse = Response.builder()
                    .status(404)
                    .message("User not found: " + registrationRequest.getEmail())
                    .build();
            return ResponseEntity.status(404).body(errorResponse);

        }
    }

}
