package com.datn.drugstore.service.impl;

import com.datn.drugstore.dto.UserDTO;
import com.datn.drugstore.request.LoginRequest;
import com.datn.drugstore.entity.User;
import com.datn.drugstore.exception.InvalidCredentialsException;
import com.datn.drugstore.repository.UserRepository;
import com.datn.drugstore.request.RegisterRequest;
import com.datn.drugstore.request.UpdateProfileRequest;
import com.datn.drugstore.service.EmailService;
import com.datn.drugstore.service.GoogleTokenVerifier;
import com.datn.drugstore.service.LoginAttemptService;
import com.datn.drugstore.service.TokenSessionService;
import com.datn.drugstore.service.UserService;
import com.datn.drugstore.utils.JWTHelper;
import com.datn.drugstore.kafka.producer.OtpProducer;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTHelper jwtHelper;
    private final LoginAttemptService loginAttemptService;
    private final TokenSessionService tokenSessionService;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final RedisTemplate<String, String> redisTemplate;
    private final OtpProducer otpProducer;

    @Override
    public UserDTO login(LoginRequest loginRequest) {
        String email = loginRequest.getEmail();
        loginAttemptService.checkLockStatus(email);

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            loginAttemptService.loginFailed(email);
            int currentAttempts = loginAttemptService.getAttempts(email);
            int remainingAttempts = 3 - currentAttempts;
            throw new InvalidCredentialsException(
                    "Sai tên đăng nhập hoặc mật khẩu",
                    currentAttempts,
                    remainingAttempts
            );
        }
        User user = userOpt.get();
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            loginAttemptService.loginFailed(email);
            int currentAttempts = loginAttemptService.getAttempts(email);
            int remainingAttempts = 3 - currentAttempts;
            throw new InvalidCredentialsException(
                    "Sai tên đăng nhập hoặc mật khẩu",
                    currentAttempts,
                    remainingAttempts
            );
        }
        loginAttemptService.loginSucceeded(email);
        String token = jwtHelper.generateToken(user.getId());
        
        tokenSessionService.saveActiveSession(email, token);

        return new UserDTO(user.getId(), user.getName(), user.getEmail(), user.getPhone(),
                user.getIsAdmin(), user.getCreatedAt(), token);
    }

    @Override
    @Transactional
    public UserDTO loginWithGoogle(String idToken) {
        GoogleTokenVerifier.GoogleUserInfo info = googleTokenVerifier.verify(idToken);
        String email = info.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = new User();
            user.setName(info.getName() != null && !info.getName().isBlank() ? info.getName() : email);
            user.setEmail(email);
            user.setPhone(null);
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            user.setIsAdmin(false);
            user = userRepository.save(user);
        }

        String token = jwtHelper.generateToken(user.getId());
        tokenSessionService.saveActiveSession(user.getEmail(), token);

        return new UserDTO(user.getId(), user.getName(), user.getEmail(), user.getPhone(),
                user.getIsAdmin(), user.getCreatedAt(), token);
    }

    @Override
    public UserDTO register(RegisterRequest registerRequest) {
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw new RuntimeException("Địa chỉ email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.");
        }

        User user = new User();
        user.setName(registerRequest.getName());
        user.setEmail(registerRequest.getEmail());
        user.setPhone(registerRequest.getPhone());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));

        User savedUser = userRepository.save(user);
        String token = jwtHelper.generateToken(savedUser.getId());
        
        tokenSessionService.saveActiveSession(savedUser.getEmail(), token);

        return new UserDTO(savedUser.getId(), savedUser.getName(), savedUser.getEmail(), savedUser.getPhone(), savedUser.getIsAdmin(), savedUser.getCreatedAt(), token);
    }

    @Override
    public UserDTO getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new UserDTO(user.getId(), user.getName(), user.getEmail(), user.getPhone(), user.getIsAdmin(), user.getCreatedAt(), null);
    }

    @Override
    @Transactional
    public UserDTO updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getPassword() != null) user.setPassword(passwordEncoder.encode(request.getPassword()));

        User updatedUser = userRepository.save(user);
        String token = jwtHelper.generateToken(updatedUser.getId());

        tokenSessionService.saveActiveSession(updatedUser.getEmail(), token);

        return new UserDTO(updatedUser.getId(), updatedUser.getName(), updatedUser.getEmail(), updatedUser.getPhone(), updatedUser.getIsAdmin(), updatedUser.getCreatedAt(), token);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }

    @Override
    public void sendForgotPasswordOtp(String email) {
        userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Địa chỉ email này chưa được đăng ký."));

        String otp = String.format("%06d", new SecureRandom().nextInt(1_000_000));
        String key = "forgot_otp:" + email;
        redisTemplate.opsForValue().set(key, otp, Duration.ofMinutes(5));

        otpProducer.sendOtpEvent(email, otp);
    }

    @Override
    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        String key = "forgot_otp:" + email;
        String stored = redisTemplate.opsForValue().get(key);

        if (stored == null) {
            throw new RuntimeException("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.");
        }
        if (!stored.equals(otp)) {
            throw new RuntimeException("Mã OTP không chính xác.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản."));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        redisTemplate.delete(key);
    }
}
