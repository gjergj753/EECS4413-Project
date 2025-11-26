package com.example.backend.controllers;

import com.example.backend.dto.Response;
import com.example.backend.dto.AddressDto;
import com.example.backend.services.AddressService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// REST controller for address management
@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    // Get all addresses (admin function)
    @GetMapping
    public Response getAllAddresses() {
        List<AddressDto> addresses = addressService.getAllAddresses();
        return Response.builder()
                .status(200)
                .message("Addresses retrieved successfully")
                .addressList(addresses)
                .build();
    }

    // Get address by ID
    @GetMapping("/{id}")
    public Response getAddressById(@PathVariable Long id) {
        AddressDto address = addressService.getAddressById(id);
        return Response.builder()
                .status(200)
                .message("Address found")
                .address(address)
                .build();
    }

    // Get address by UserId
    @GetMapping("/user/{userId}")
    public Response getAddressByUserId(@PathVariable Long userId){
        AddressDto address = addressService.getAddressByUserId(userId);
        return Response.builder()
                .status(200)
                .message("Address found")
                .address(address)
                .build();
    }

    // Create new address for user
    @PostMapping("/user/{userId}")
    public Response createAddress(
            @PathVariable Long userId,
            @RequestBody AddressDto addressDto) {
        AddressDto address = addressService.createAddress(userId, addressDto);
        return Response.builder()
                .status(201)
                .message("Address created successfully")
                .address(address)
                .build();
    }

    // Update existing address
    @PutMapping("/{id}")
    public Response updateAddress(
            @PathVariable Long id,
            @RequestBody AddressDto addressDto) {
        AddressDto address = addressService.updateAddress(id, addressDto);
        return Response.builder()
                .status(200)
                .message("Address updated successfully")
                .address(address)
                .build();
    }

    // Delete address
    @DeleteMapping("/{id}")
    public Response deleteAddress(@PathVariable Long id) {
        addressService.deleteAddress(id);
        return Response.builder()
                .status(200)
                .message("Address deleted successfully")
                .build();
    }
}

