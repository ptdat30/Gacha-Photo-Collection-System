package com.memories.gacha.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "gacha_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class GachaHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Integer historyId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash"})
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "photo_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Photo photo;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "rarity_pulled")
    private Photo.PhotoRarity rarityPulled;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "pull_type")
    private PullType pullType = PullType.SINGLE;
    
    @Column(name = "tickets_used")
    private Integer ticketsUsed = 1;
    
    @Column(name = "pulled_at", updatable = false)
    private LocalDateTime pulledAt;
    
    @PrePersist
    protected void onCreate() {
        pulledAt = LocalDateTime.now();
    }
    
    public enum PullType {
        SINGLE, MULTI_10
    }
}

