package com.memories.gacha.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "photos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Photo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "photo_id")
    private Integer photoId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collection_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Collection collection;
    
    @Column(name = "image_url", nullable = false, columnDefinition = "TEXT")
    private String imageUrl;
    
    @Column(name = "thumbnail_url", columnDefinition = "TEXT")
    private String thumbnailUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "rarity", nullable = false, length = 10)
    private PhotoRarity rarity = PhotoRarity.C;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "JSON")
    private Map<String, Object> metadata;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PhotoStatus status = PhotoStatus.ACTIVE;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash"})
    private User uploadedBy;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash"})
    private User approvedBy;
    
    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    public enum PhotoRarity {
        N,  // NPC (Quần Chúng) - Xám Tro - 30%
        C,  // Common (Thường Dân) - Xanh Lá - 25%
        R,  // Rare (Có Nét) - Xanh Dương - 20%
        SR, // Super Rare (Visual) - Tím - 10%
        SSR, // Squad (Hội Bạn Thân) - Cam - 8%
        UR, // Ultra Rare (Meme Lord) - Đỏ Rực - 4%
        L,  // Legendary (Góc Chết) - Vàng Kim - 2%
        X   // Forbidden (Tài Liệu Mật) - Đen Tuyền - 1%
    }
    
    public enum PhotoStatus {
        ACTIVE, HIDDEN, PENDING, REJECTED
    }
}

