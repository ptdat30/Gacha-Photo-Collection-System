package com.memories.gacha.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "drop_rate_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DropRateConfig {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "config_id")
    private Integer configId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "rarity", nullable = false, unique = true)
    private Photo.PhotoRarity rarity;
    
    @Column(name = "drop_rate", nullable = false)
    private Double dropRate; // Tỷ lệ phần trăm (ví dụ: 30.00 = 30%)
}

