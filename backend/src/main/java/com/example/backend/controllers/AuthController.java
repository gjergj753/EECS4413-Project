package com.example.backend.controllers;

import com.example.backend.dto.*;
import com.example.backend.services.AddressService;
import com.example.backend.services.PaymentMethodService;
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
    private final AddressService addressService;
    private final PaymentMethodService paymentMethodService;

    @PostMapping("/register")
    public ResponseEntity<Response> registerUser(@RequestBody RegisterRequest request){

        UserDto registeredUser = userService.createUser(request.getUser());
        AddressDto registeredAddress = addressService.createAddress(registeredUser.getUserId(), request.getAddress());

        Response paymentResponse = paymentMethodService.addPaymentMethod(registeredUser.getUserId(), request.getPaymentMethod());
        PaymentMethodDto registeredPaymentMethod = paymentResponse.getPaymentMethod();


        Response response = Response.builder()
                .status(201)
                .message("User registered successfully")
                .user(registeredUser)
                .address(registeredAddress)
                .paymentMethod(registeredPaymentMethod)
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
