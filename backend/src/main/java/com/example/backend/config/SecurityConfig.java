package com.example.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)

                // Authorization rules: permissions on who can call which URLs
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/api/**").permitAll()
                        .requestMatchers("/", "/index.html", "/assets/**", "/static/**", "/favicon.ico").permitAll()
                        .requestMatchers("/health", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/api/catalog/**").permitAll()

                        // Customer only stuff (requires login)
                        .requestMatchers("/api/cart/**", "/api/orders/**").authenticated()

                        // Admin only stuff
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // all else defaults to allowed
                        .anyRequest().permitAll()
                )

                //How users log in, for now
                .httpBasic(Customizer.withDefaults())
                .formLogin(Customizer.withDefaults());

        return http.build();
    }

    // This may or may not be temporary
    // Tells Spring that we are not encoding passwords
    @Bean
    public PasswordEncoder passwordEncoder() {
        // Dev / assignment only: compare passwords as plain text
        return NoOpPasswordEncoder.getInstance();
    }
}