package com.datn.drugstore.service.impl;

import com.datn.drugstore.exception.AccountLockedException;
import com.datn.drugstore.service.LoginAttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class LoginAttemptServiceImpl implements LoginAttemptService {

    private final RedisTemplate<String, String> redisTemplate;
    
    private static final String ATTEMPTS_PREFIX = "login:attempts:";
    private static final String TEMP_LOCK_PREFIX = "login:templock:";
    private static final String PERM_LOCK_PREFIX = "login:permlock:";
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Override
    public void checkLockStatus(String email) {
        if (isPermanentlyLocked(email)) {
            throw new AccountLockedException(
                "Tài khoản đã bị khóa vĩnh viễn do đăng nhập sai quá nhiều lần",
                "PERMANENT",
                0
            );
        }

        String lockTimeStr = redisTemplate.opsForValue().get(TEMP_LOCK_PREFIX + email);
        if (lockTimeStr != null) {
            LocalDateTime lockTime = LocalDateTime.parse(lockTimeStr, FORMATTER);
            LocalDateTime now = LocalDateTime.now();
            long secondsRemaining = Duration.between(now, lockTime).getSeconds();
            
            if (secondsRemaining > 0) {
                throw new AccountLockedException(
                    String.format("Tài khoản bị khóa tạm thời. Vui lòng thử lại sau %d giây", secondsRemaining),
                    "TEMPORARY",
                    secondsRemaining
                );
            } else {
                redisTemplate.delete(TEMP_LOCK_PREFIX + email);
            }
        }
    }

    @Override
    public void loginFailed(String email) {
        String attemptsKey = ATTEMPTS_PREFIX + email;
        String attemptsStr = redisTemplate.opsForValue().get(attemptsKey);
        int attempts = (attemptsStr != null) ? Integer.parseInt(attemptsStr) + 1 : 1;
        
        redisTemplate.opsForValue().set(attemptsKey, String.valueOf(attempts), 24, TimeUnit.HOURS);

        if (attempts >= MAX_ATTEMPT) {
            String tempLockKey = TEMP_LOCK_PREFIX + email;
            
            if (redisTemplate.hasKey(tempLockKey) || attempts > MAX_ATTEMPT) {
                redisTemplate.opsForValue().set(PERM_LOCK_PREFIX + email, "true");
                redisTemplate.delete(tempLockKey);
                redisTemplate.delete(attemptsKey);
            } else {
                LocalDateTime unlockTime = LocalDateTime.now().plusSeconds(LOCK_TIME_DURATION);
                redisTemplate.opsForValue().set(
                    tempLockKey, 
                    unlockTime.format(FORMATTER), 
                    LOCK_TIME_DURATION, 
                    TimeUnit.SECONDS
                );
            }
        }
    }

    @Override
    public void loginSucceeded(String email) {
        redisTemplate.delete(ATTEMPTS_PREFIX + email);
        redisTemplate.delete(TEMP_LOCK_PREFIX + email);
    }

    @Override
    public int getAttempts(String email) {
        String attemptsStr = redisTemplate.opsForValue().get(ATTEMPTS_PREFIX + email);
        return (attemptsStr != null) ? Integer.parseInt(attemptsStr) : 0;
    }

    @Override
    public boolean isPermanentlyLocked(String email) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(PERM_LOCK_PREFIX + email));
    }
}
