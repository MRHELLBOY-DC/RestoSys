package com.herman.springcloud.msvc.orders_services.msvc_orders_services.orders.infrastructure.security;

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
                        .requestMatchers(HttpMethod.POST, "/api/orders").hasAnyRole("cliente", "restaurante", "admin")
                        .requestMatchers(HttpMethod.PATCH, "/api/orders/*/status").hasAnyRole("restaurante", "admin", "empleado")
                        .requestMatchers(HttpMethod.GET, "/api/orders/client/*").hasAnyRole("cliente", "admin")
                        .requestMatchers(HttpMethod.GET, "/api/orders/active").hasAnyRole("restaurante", "admin", "empleado")
                        .requestMatchers(HttpMethod.GET, "/api/orders/history").hasAnyRole("restaurante", "admin", "empleado")
                        .requestMatchers(HttpMethod.GET, "/api/orders/code/*").hasAnyRole("cliente", "restaurante", "admin")
                        .requestMatchers(HttpMethod.GET, "/api/orders/*").hasAnyRole("cliente", "restaurante", "admin", "empleado")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}