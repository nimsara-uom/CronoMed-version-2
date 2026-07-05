package com.smartcare.backend.controller;

import com.smartcare.backend.dto.LoginRequest;
import com.smartcare.backend.dto.LoginResponse;
import com.smartcare.backend.dto.RegisterRequest;
import com.smartcare.backend.dto.RegisterResponse;
import com.smartcare.backend.model.Role;
import com.smartcare.backend.model.User;
import com.smartcare.backend.repository.UserRepository;
import com.smartcare.backend.security.JwtTokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        User user = userOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).build();
        }

        String token = tokenProvider.generateToken(user.getUsername(), user.getRole());

        LoginResponse resp = new LoginResponse();
        resp.setSuccess(true);
        resp.setUsername(user.getUsername());
        resp.setRole(user.getRole().name());
        resp.setToken(token);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest request) {
        String pwdError = validatePassword(request.getPassword());
        if (pwdError != null) {
            RegisterResponse resp = new RegisterResponse();
            resp.setSuccess(false);
            resp.setMessage(pwdError);
            return ResponseEntity.badRequest().body(resp);
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            RegisterResponse resp = new RegisterResponse();
            resp.setSuccess(false);
            resp.setMessage("Username already exists");
            return ResponseEntity.status(409).body(resp);
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.PATIENT);
        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getUsername(), user.getRole());

        RegisterResponse resp = new RegisterResponse();
        resp.setSuccess(true);
        resp.setUsername(user.getUsername());
        resp.setRole(user.getRole().name());
        resp.setToken(token);
        resp.setMessage("Registration successful");
        return ResponseEntity.ok(resp);
    }

    // Returns null when password is strong, otherwise returns an error message
    private String validatePassword(String password) {
        if (password == null) return "Password must not be empty";
        if (password.length() < 8) return "Password must be at least 8 characters long";
        boolean hasUpper = false, hasLower = false, hasDigit = false, hasSpecial = false;
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isDigit(c)) hasDigit = true;
            else hasSpecial = true;
        }
        if (!hasUpper) return "Password must contain at least one uppercase letter";
        if (!hasLower) return "Password must contain at least one lowercase letter";
        if (!hasDigit) return "Password must contain at least one digit";
        if (!hasSpecial) return "Password must contain at least one special character";
        // optional: disallow common patterns
        String lower = password.toLowerCase();
        if (Pattern.compile("(password|123456|qwerty)").matcher(lower).find()) {
            return "Password is too common";
        }
        return null;
    }
}
