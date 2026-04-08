package com.datn.drugstore.service.impl;

import com.datn.drugstore.service.TokenSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class TokenSessionServiceImpl implements TokenSessionService {

    private final RedisTemplate<String, String> redisTemplate;
    
    private static final String SESSION_PREFIX = "user:session:";
    private static final long SESSION_EXPIRATION = 24 * 60 * 60;

    @Override
    public void saveActiveSession(String email, String token) {
        redisTemplate.opsForValue().set(
            SESSION_PREFIX + email, 
            token, 
            SESSION_EXPIRATION, 
            TimeUnit.SECONDS
        );
    }

    @Override
    public boolean isValidSession(String email, String token) {
        String activeToken = redisTemplate.opsForValue().get(SESSION_PREFIX + email);
        return token != null && token.equals(activeToken);
    }

    @Override
    public void invalidateSession(String email) {
        redisTemplate.delete(SESSION_PREFIX + email);
    }
}
