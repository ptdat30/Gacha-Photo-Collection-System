package com.memories.gacha.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_inventory", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "photo_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class UserInventory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inventory_id")
    private Integer inventoryId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash"})
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "photo_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Photo photo;
    
    @Column(name = "quantity")
    private Integer quantity = 1;
    
    @Column(name = "is_favorite")
    private Boolean isFavorite = false;
    
    @Column(name = "obtained_at", updatable = false)
    private LocalDateTime obtainedAt;
    
    @PrePersist
    protected void onCreate() {
        obtainedAt = LocalDateTime.now();
    }
}

