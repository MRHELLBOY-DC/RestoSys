package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.infrastructure.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> {})
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/payments").hasAnyRole("cliente", "restaurante", "admin")
                        .requestMatchers(HttpMethod.PATCH, "/api/payments/*/confirm").hasAnyRole("restaurante", "admin")
                        .requestMatchers(HttpMethod.PATCH, "/api/payments/*/simulate-qr").hasAnyRole("cliente", "restaurante", "admin")
                        .requestMatchers(HttpMethod.GET, "/api/payments").hasAnyRole("restaurante", "admin")
                        .requestMatchers(HttpMethod.GET, "/api/payments/*/receipt.html").hasAnyRole("cliente", "restaurante", "admin")
                        .requestMatchers(HttpMethod.GET, "/api/payments/order/*").hasAnyRole("cliente", "restaurante", "admin")
                        .requestMatchers(HttpMethod.GET, "/api/payments/*").hasAnyRole("cliente", "restaurante", "admin")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
