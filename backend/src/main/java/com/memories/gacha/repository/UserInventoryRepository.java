package com.memories.gacha.repository;

import com.memories.gacha.model.UserInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserInventoryRepository extends JpaRepository<UserInventory, Integer> {
    
    List<UserInventory> findByUserUserId(Integer userId);
    
    Optional<UserInventory> findByUserUserIdAndPhotoPhotoId(Integer userId, Integer photoId);
    
    boolean existsByUserUserIdAndPhotoPhotoId(Integer userId, Integer photoId);
}

