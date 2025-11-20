package com.memories.gacha.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;
    
    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;
    
    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;
    
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
    
    @Column(name = "full_name", length = 100)
    private String fullName;
    
    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;
    
    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private UserRole role = UserRole.MEMBER;
    
    @Column(name = "class_id", length = 50)
    private String classId;
    
    @Column(name = "facebook_id", length = 100)
    private String facebookId;
    
    @Column(name = "ticket_balance")
    private Integer ticketBalance = 10;
    
    @Column(name = "coin_balance")
    private Integer coinBalance = 0;
    
    @Column(name = "pity_counter")
    private Integer pityCounter = 0;
    
    @Column(name = "is_banned")
    private Boolean isBanned = false;
    
    @Column(name = "ban_reason", columnDefinition = "TEXT")
    private String banReason;
    
    @Column(name = "banned_until")
    private LocalDateTime bannedUntil;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum UserRole {
        MEMBER,
        CONTENT_ADMIN,
        SYSTEM_ADMIN
    }
}

