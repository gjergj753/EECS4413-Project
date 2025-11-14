package com.example.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {

    private Long userId;

    private String email;

    private String firstName;

    private String lastName;

    // Only allow setting password on input (registration/update), never return it in responses
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String hashedPassword;

    private boolean isAdmin = false;

    // Allows serialization of address, paired with @JsonBackReference in AddressDto
    @JsonManagedReference("user-address")
    private AddressDto address;

    // Allows serialization of cart, paired with @JsonBackReference in CartDto
    @JsonManagedReference("user-cart")
    private CartDto cart;

}
