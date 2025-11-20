package com.memories.gacha.dto;

import com.memories.gacha.model.Photo;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdatePhotoRarityRequest {
    
    @NotNull(message = "Photo ID is required")
    private Integer photoId;
    
    @NotNull(message = "Rarity is required")
    private Photo.PhotoRarity rarity;
    
    private Integer collectionId; // Optional: assign to collection
}

