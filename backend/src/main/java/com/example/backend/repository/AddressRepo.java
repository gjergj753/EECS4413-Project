package com.example.backend.repository;

import com.example.backend.entity.Address;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AddressRepo extends JpaRepository<Address, Long> {
    Optional<Address> findAddressByUser_UserId(Long userId);
}
