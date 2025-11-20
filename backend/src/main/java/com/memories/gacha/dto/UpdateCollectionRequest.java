package com.memories.gacha.dto;

import lombok.Data;

@Data
public class UpdateCollectionRequest {
    
    private String name;
    
    private String description;
    
    private String coverImageUrl;
}

