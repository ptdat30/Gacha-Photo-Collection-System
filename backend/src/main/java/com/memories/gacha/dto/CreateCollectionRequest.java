package com.memories.gacha.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateCollectionRequest {
    
    @NotBlank(message = "Collection name is required")
    private String name;
    
    private String description;
    
    private String coverImageUrl;
}

