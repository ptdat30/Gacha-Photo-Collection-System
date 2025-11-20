package com.memories.gacha.service;

import com.memories.gacha.dto.AuthResponse;
import com.memories.gacha.dto.LoginRequest;
import com.memories.gacha.dto.RegisterRequest;
import com.memories.gacha.model.User;
import com.memories.gacha.repository.UserRepository;
import com.memories.gacha.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            return new AuthResponse(null, null, null, null, null, null, 
                "Username already exists");
        }
        
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse(null, null, null, null, null, null, 
                "Email already exists");
        }
        
        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(request.getPassword()); // Lưu password dạng plain text
        user.setFullName(request.getFullName());
        // Cho phép chọn role, mặc định là MEMBER nếu không chọn hoặc không hợp lệ
        if (request.getRole() != null) {
            try {
                user.setRole(request.getRole());
            } catch (Exception e) {
                // Nếu role không hợp lệ, mặc định là MEMBER
                user.setRole(User.UserRole.MEMBER);
            }
        } else {
            user.setRole(User.UserRole.MEMBER);
        }
        user.setTicketBalance(10);
        user.setCoinBalance(0);
        user.setPityCounter(0);
        user.setIsBanned(false);
        
        user = userRepository.save(user);
        
        // Generate JWT token
        String token = jwtUtil.generateToken(user.getUsername());
        
        return new AuthResponse(
            token,
            "Bearer",
            user.getUserId(),
            user.getUsername(),
            user.getEmail(),
            user.getRole().name(),
            "Registration successful"
        );
    }
    
    public AuthResponse login(LoginRequest request) {
        // Find user by username or email
        Optional<User> userOpt = userRepository.findByUsername(request.getUsernameOrEmail());
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(request.getUsernameOrEmail());
        }
        
        if (userOpt.isEmpty()) {
            return new AuthResponse(null, null, null, null, null, null, 
                "Invalid username/email or password");
        }
        
        User user = userOpt.get();
        
        // Check if user is banned
        if (user.getIsBanned()) {
            if (user.getBannedUntil() != null && user.getBannedUntil().isBefore(java.time.LocalDateTime.now())) {
                // Ban expired, unban user
                user.setIsBanned(false);
                user.setBannedUntil(null);
                userRepository.save(user);
            } else {
                return new AuthResponse(null, null, null, null, null, null, 
                    "Account is banned");
            }
        }
        
        // Verify password (so sánh trực tiếp vì không mã hóa)
        if (!request.getPassword().equals(user.getPasswordHash())) {
            return new AuthResponse(null, null, null, null, null, null, 
                "Invalid username/email or password");
        }
        
        // Generate JWT token
        String token = jwtUtil.generateToken(user.getUsername());
        
        return new AuthResponse(
            token,
            "Bearer",
            user.getUserId(),
            user.getUsername(),
            user.getEmail(),
            user.getRole().name(),
            "Login successful"
        );
    }
}

