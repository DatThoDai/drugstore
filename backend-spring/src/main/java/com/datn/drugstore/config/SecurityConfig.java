package com.datn.drugstore.config;

import com.datn.drugstore.filter.AuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final AuthenticationFilter authenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig
    ) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource) throws Exception {
            http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers("/api/users/profile").permitAll()
                        .requestMatchers("GET", "/api/products").permitAll()
                        .requestMatchers("GET", "/api/products/{id}").permitAll()
                        .requestMatchers("GET", "/api/products/low-stock").hasRole("ADMIN")
                        .requestMatchers("POST", "/api/products").hasRole("ADMIN")
                        .requestMatchers("PUT", "/api/products/{id}").hasRole("ADMIN")
                        .requestMatchers("DELETE", "/api/products/{id}").hasRole("ADMIN")
                        .requestMatchers(
                                "/", "/api/users/login", "/api/users/google-login", "/api/users/register", "/api/users/get-only-email/**",
                                "/api/users/forgot-password", "/api/users/reset-password",
                                "/uploads/**",
                                "/api/products/search/**", "/api/products/searchHere/**",
                                "/api/products/all",
                                "/api/category/all", "/api/category/all/status", "/api/category/all/status/no",
                                "/api/category/all/status-detail/**", "/api/category/{id}",
                                "/api/orders/order-repair",
                                "/api/config/vnpay",
                                "/api/orders/vnpay-return"
                        ).permitAll()
                        .requestMatchers("POST", "/api/users").permitAll()
                        .requestMatchers("GET", "/api/users").hasRole("ADMIN")
                        .requestMatchers("DELETE", "/api/users/{id}").hasRole("ADMIN")
                        .requestMatchers(
                                "/api/users/profile", "/api/users/check-session",
                                "/api/users/{id}", "/api/orders", "/api/orders/{id}",
                                "/api/orders/{id}/pay",
                                "/api/orders/{id}/vnpay-url",
                                "/api/orders/{id}/delivered"
                        ).authenticated()
                        .requestMatchers(
                                "/api/orders/all",
                                "/api/orders/search/**", "/api/orders/status/**",
                                "/api/orders/option/**", "/api/orders/combine/**",
                                "/api/orders/filter/**", 
                                "/api/category/create", "/api/category/update/**", "/api/category/delete/**",
                                "/api/upload"
                        ).hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(authenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
