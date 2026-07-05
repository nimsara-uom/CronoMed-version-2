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
import jakarta.validation.Valid;

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
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
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

    
}
