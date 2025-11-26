package com.example.backend.services;

import com.example.backend.dto.AddressDto;
import com.example.backend.dto.UserDto;
import com.example.backend.entity.Address;
import com.example.backend.entity.User;
import com.example.backend.repository.AddressRepo;
import com.example.backend.repository.UserRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

// Service for managing user addresses
@Service
@Transactional
public class AddressService {

    private final AddressRepo addressRepo;
    private final UserRepo userRepo;

    public AddressService(AddressRepo addressRepo, UserRepo userRepo) {
        this.addressRepo = addressRepo;
        this.userRepo = userRepo;
    }

    // Get all addresses
    public List<AddressDto> getAllAddresses() {
        return addressRepo.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Get address by ID
    public AddressDto getAddressById(Long id) {
        Address address = addressRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found with id: " + id));
        return convertToDto(address);
    }

    public AddressDto getAddressByUserId(Long userId){
        Address address = addressRepo.findAddressByUser_UserId(userId).orElseThrow(() -> new RuntimeException("Address not found for user: " + userId));
        return convertToDto(address);
    }

    // Create new address for user
    public AddressDto createAddress(Long userId, AddressDto addressDto) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Address address = new Address();
        address.setUser(user);
        address.setStreet(addressDto.getStreet());
        address.setCity(addressDto.getCity());
        address.setProvince(addressDto.getProvince());
        address.setPostalCode(addressDto.getPostalCode());
        address.setCountry(addressDto.getCountry());

        Address savedAddress = addressRepo.save(address);
        return convertToDto(savedAddress);
    }

    // Update existing address
    public AddressDto updateAddress(Long id, AddressDto addressDto) {
        Address address = addressRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found with id: " + id));

        // only update fields that are provided
        if (addressDto.getStreet() != null) address.setStreet(addressDto.getStreet());
        if (addressDto.getCity() != null) address.setCity(addressDto.getCity());
        if (addressDto.getProvince() != null) address.setProvince(addressDto.getProvince());
        if (addressDto.getPostalCode() != null) address.setPostalCode(addressDto.getPostalCode());
        if (addressDto.getCountry() != null) address.setCountry(addressDto.getCountry());

        Address updatedAddress = addressRepo.save(address);
        return convertToDto(updatedAddress);
    }

    // Delete address
    public void deleteAddress(Long id) {
        if (!addressRepo.existsById(id)) {
            throw new RuntimeException("Address not found with id: " + id);
        }
        addressRepo.deleteById(id);
    }

    // Convert Address entity to AddressDto
    private AddressDto convertToDto(Address address) {
        AddressDto dto = new AddressDto();
        dto.setAddressId(address.getAddressId());
        dto.setStreet(address.getStreet());
        dto.setCity(address.getCity());
        dto.setProvince(address.getProvince());
        dto.setPostalCode(address.getPostalCode());
        dto.setCountry(address.getCountry());
        return dto;
    }
}

