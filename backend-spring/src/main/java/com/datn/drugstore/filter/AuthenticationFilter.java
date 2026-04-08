package com.datn.drugstore.filter;

import com.datn.drugstore.entity.User;
import com.datn.drugstore.repository.UserRepository;
import com.datn.drugstore.service.TokenSessionService;
import com.datn.drugstore.utils.JWTHelper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class AuthenticationFilter extends OncePerRequestFilter {

    private final JWTHelper jwtHelper;
    private final UserRepository userRepository;
    private final TokenSessionService tokenSessionService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                jwtHelper.validateToken(token);
                Long userId = jwtHelper.extractUserId(token);
                Optional<User> userOpt = userRepository.findById(userId);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();

                    boolean validSession;
                    try {
                        validSession = tokenSessionService.isValidSession(user.getEmail(), token);
                    } catch (Exception redisEx) {
                        sendUnauthorized(response, "Service unavailable. Please try again.");
                        return;
                    }

                    if (!validSession) {
                        sendUnauthorized(response, "Session expired. You have been logged in from another device. Please login again.");
                        return;
                    }

                    List<SimpleGrantedAuthority> authorities = Boolean.TRUE.equals(user.getIsAdmin())
                            ? List.of(new SimpleGrantedAuthority("ROLE_ADMIN"), new SimpleGrantedAuthority("ROLE_USER"))
                            : List.of(new SimpleGrantedAuthority("ROLE_USER"));
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(user, null, authorities);
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                sendUnauthorized(response, "Invalid or expired token. Please login again.");
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    private void sendUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"code\": 401, \"message\": \"" + message + "\", \"data\": null}");
    }
}
