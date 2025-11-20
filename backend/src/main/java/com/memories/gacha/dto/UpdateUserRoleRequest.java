package com.memories.gacha.dto;

import com.memories.gacha.model.User;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateUserRoleRequest {
    
    @NotNull(message = "User ID is required")
    private Integer userId;
    
    @NotNull(message = "Role is required")
    private User.UserRole role;
}

