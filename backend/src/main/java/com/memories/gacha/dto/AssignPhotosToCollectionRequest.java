package com.memories.gacha.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class AssignPhotosToCollectionRequest {
    
    @NotNull(message = "Collection ID is required")
    private Integer collectionId;
    
    @NotNull(message = "Photo IDs are required")
    private List<Integer> photoIds;
}

