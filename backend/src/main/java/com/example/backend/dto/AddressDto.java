package com.example.backend.dto;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@AllArgsConstructor
@NoArgsConstructor
public class AddressDto {

    private Long addressId;

    private String street;
    private String city;
    private String province;
    private String postalCode;
    private String country;

    // Prevents circular reference: Address -> User -> Address loop
    @JsonBackReference("user-address")
    private UserDto user;

}
