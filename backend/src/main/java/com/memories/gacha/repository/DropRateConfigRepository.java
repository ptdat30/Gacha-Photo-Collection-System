package com.memories.gacha.repository;

import com.memories.gacha.model.DropRateConfig;
import com.memories.gacha.model.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DropRateConfigRepository extends JpaRepository<DropRateConfig, Integer> {
    
    Optional<DropRateConfig> findByRarity(Photo.PhotoRarity rarity);
}

