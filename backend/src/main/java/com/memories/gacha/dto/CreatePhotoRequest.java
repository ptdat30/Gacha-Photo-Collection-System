package com.memories.gacha.dto;

import com.memories.gacha.model.Photo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreatePhotoRequest {
    
    @NotBlank(message = "Image URL is required")
    private String imageUrl;
    
    private String thumbnailUrl;
    
    @NotNull(message = "Rarity is required")
    private Photo.PhotoRarity rarity;
    
    private Integer collectionId;
    
    private String metadata; // JSON string
}

