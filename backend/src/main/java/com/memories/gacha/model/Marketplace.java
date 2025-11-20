package com.memories.gacha.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "marketplace")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Marketplace {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "listing_id")
    private Integer listingId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "photo_id", nullable = false)
    private Photo photo;
    
    @Column(name = "price_coins", nullable = false)
    private Integer priceCoins;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ListingStatus status = ListingStatus.OPEN;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id")
    private User buyer;
    
    @Column(name = "sold_at")
    private LocalDateTime soldAt;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    public enum ListingStatus {
        OPEN, SOLD, CANCELLED
    }
}

