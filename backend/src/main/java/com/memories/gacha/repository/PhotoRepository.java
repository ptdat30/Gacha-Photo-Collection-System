package com.memories.gacha.repository;

import com.memories.gacha.model.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhotoRepository extends JpaRepository<Photo, Integer> {
    
    List<Photo> findByStatus(Photo.PhotoStatus status);
    
    List<Photo> findByRarity(Photo.PhotoRarity rarity);
    
    List<Photo> findByCollectionCollectionId(Integer collectionId);
    
    List<Photo> findByStatusAndRarity(Photo.PhotoStatus status, Photo.PhotoRarity rarity);
    
    @Query(value = "SELECT * FROM photos WHERE status = 'ACTIVE' AND rarity = :rarity ORDER BY RAND() LIMIT 1", nativeQuery = true)
    Photo findRandomByRarity(@Param("rarity") String rarity);
    
    List<Photo> findByUploadedByUserId(Integer userId);
    
    List<Photo> findByStatusAndUploadedByUserId(Photo.PhotoStatus status, Integer userId);
}

