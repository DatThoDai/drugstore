package com.datn.drugstore.controller;

import com.datn.drugstore.dto.UserDTO;
import com.datn.drugstore.entity.User;
import com.datn.drugstore.exception.InvalidCredentialsException;
import com.datn.drugstore.request.GoogleLoginRequest;
import com.datn.drugstore.request.LoginRequest;
import com.datn.drugstore.request.UpdateProfileRequest;
import com.datn.drugstore.response.BaseResponse;
import com.datn.drugstore.service.UserService;
import com.datn.drugstore.exception.AccountLockedException;
import com.datn.drugstore.kafka.producer.RegistrationProducer;
import com.datn.drugstore.request.RegisterRequest;
import com.datn.drugstore.utils.ResponseFactory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final RegistrationProducer registrationProducer;

    @PostMapping("/login")
    public ResponseEntity<BaseResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            UserDTO userDTO = userService.login(loginRequest);
            return ResponseFactory.success(userDTO, "Đăng nhập thành công");

        } catch (InvalidCredentialsException e) {
            Map<String, Object> errorData = new HashMap<>();
            errorData.put("currentAttempts", e.getCurrentAttempts());
            errorData.put("remainingAttempts", e.getRemainingAttempts());

            BaseResponse response = new BaseResponse();
            response.setCode(HttpStatus.UNAUTHORIZED.value());
            response.setMessage(e.getMessage());
            response.setData(errorData);

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        } catch (AccountLockedException e) {
            Map<String, Object> lockData = new HashMap<>();
            lockData.put("lockType", e.getLockType());
            if (e.getRemainingSeconds() > 0) {
                lockData.put("remainingLockTime", e.getRemainingSeconds());
            }
            
            BaseResponse response = new BaseResponse();
            response.setCode(HttpStatus.FORBIDDEN.value());
            response.setMessage(e.getMessage());
            response.setData(lockData);
            
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }
    }

    @PostMapping("/google-login")
    public ResponseEntity<BaseResponse> loginWithGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        UserDTO userDTO = userService.loginWithGoogle(request.getIdToken());
        return ResponseFactory.success(userDTO, "Đăng nhập Google thành công");
    }

    @PostMapping
    public ResponseEntity<BaseResponse> registerCompat(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            UserDTO userDTO = userService.register(registerRequest);
            registrationProducer.sendRegistrationEvent(userDTO.getEmail(), userDTO.getName());
            return ResponseFactory.success(userDTO, "Đăng ký thành công");
        } catch (RuntimeException e) {
            BaseResponse res = new BaseResponse();
            res.setCode(409);
            res.setMessage(e.getMessage());
            return ResponseEntity.status(409).body(res);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<BaseResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            UserDTO userDTO = userService.register(registerRequest);
            registrationProducer.sendRegistrationEvent(userDTO.getEmail(), userDTO.getName());
            return ResponseFactory.success(userDTO, "Đăng ký thành công");
        } catch (RuntimeException e) {
            BaseResponse res = new BaseResponse();
            res.setCode(409);
            res.setMessage(e.getMessage());
            return ResponseEntity.status(409).body(res);
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<BaseResponse> getProfile(@AuthenticationPrincipal User user) {
        UserDTO userDTO = userService.getProfile(user.getId());
        return ResponseFactory.success(userDTO);
    }

    @GetMapping("/check-session")
    public ResponseEntity<BaseResponse> checkSession(@AuthenticationPrincipal User user) {
        return ResponseFactory.success(null, "ok");
    }

    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse> getUserById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        if (!user.getId().equals(id) && !user.getIsAdmin()) {
            return ResponseFactory.forbidden("Bạn không có quyền xem thông tin này");
        }
        UserDTO userDTO = userService.getProfile(id);
        return ResponseFactory.success(userDTO);
    }

    @PutMapping("/profile")
    public ResponseEntity<BaseResponse> updateProfile(@AuthenticationPrincipal User user,
                                                      @RequestBody UpdateProfileRequest request) {
        UserDTO userDTO = userService.updateProfile(user.getId(), request);
        return ResponseFactory.success(userDTO, "Cập nhật thành công");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseFactory.successMessage("Đã xóa người dùng");
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseFactory.success(users);
    }

    @GetMapping("/get-only-email/{email}")
    public ResponseEntity<BaseResponse> getUserByEmail(@PathVariable String email) {
        Optional<User> user = userService.findByEmail(email);
        if (user.isPresent()) {
            return ResponseFactory.success(user.get());
        }
        return ResponseFactory.notFound("Không tìm thấy user");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<BaseResponse> forgotPassword(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            if (email == null || email.isBlank()) {
                BaseResponse res = new BaseResponse();
                res.setCode(400); res.setMessage("Email không được để trống.");
                return ResponseEntity.badRequest().body(res);
            }
            userService.sendForgotPasswordOtp(email.trim().toLowerCase());
            return ResponseFactory.success(null, "Đã gửi mã OTP về email của bạn.");
        } catch (RuntimeException e) {
            BaseResponse res = new BaseResponse();
            res.setCode(404); res.setMessage(e.getMessage());
            return ResponseEntity.status(404).body(res);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<BaseResponse> resetPassword(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String otp   = body.get("otp");
            String newPassword = body.get("newPassword");
            if (email == null || otp == null || newPassword == null) {
                BaseResponse res = new BaseResponse();
                res.setCode(400); res.setMessage("Thiếu thông tin.");
                return ResponseEntity.badRequest().body(res);
            }
            userService.resetPassword(email.trim().toLowerCase(), otp.trim(), newPassword);
            return ResponseFactory.success(null, "Đặt lại mật khẩu thành công.");
        } catch (RuntimeException e) {
            BaseResponse res = new BaseResponse();
            res.setCode(400); res.setMessage(e.getMessage());
            return ResponseEntity.status(400).body(res);
        }
    }

}