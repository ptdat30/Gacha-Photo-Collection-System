package com.memories.gacha.controller;

import com.memories.gacha.dto.*;
import com.memories.gacha.model.Collection;
import com.memories.gacha.model.Photo;
import com.memories.gacha.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {
    
    @Autowired
    private AdminService adminService;
    
    // ========== Photo Management ==========
    
    @PostMapping("/photos")
    public ResponseEntity<Photo> createPhoto(
            @Valid @RequestBody com.memories.gacha.dto.CreatePhotoRequest request,
            @RequestHeader("X-User-Id") Integer adminId) {
        try {
            Photo photo = adminService.createPhoto(request, adminId);
            return ResponseEntity.ok(photo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/photos")
    public ResponseEntity<List<Photo>> getAllPhotos() {
        return ResponseEntity.ok(adminService.getAllPhotos());
    }
    
    @GetMapping("/photos/status/{status}")
    public ResponseEntity<List<Photo>> getPhotosByStatus(@PathVariable String status) {
        try {
            Photo.PhotoStatus photoStatus = Photo.PhotoStatus.valueOf(status.toUpperCase());
            return ResponseEntity.ok(adminService.getPhotosByStatus(photoStatus));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/photos/rarity")
    public ResponseEntity<Photo> updatePhotoRarity(
            @Valid @RequestBody UpdatePhotoRarityRequest request,
            @RequestHeader("X-User-Id") Integer adminId) {
        try {
            Photo photo = adminService.updatePhotoRarity(request, adminId);
            return ResponseEntity.ok(photo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/photos/{photoId}/approve")
    public ResponseEntity<Photo> approvePhoto(
            @PathVariable Integer photoId,
            @RequestHeader("X-User-Id") Integer adminId) {
        try {
            Photo photo = adminService.approvePhoto(photoId, adminId);
            return ResponseEntity.ok(photo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/photos/{photoId}/reject")
    public ResponseEntity<Photo> rejectPhoto(
            @PathVariable Integer photoId,
            @RequestBody Map<String, String> request,
            @RequestHeader("X-User-Id") Integer adminId) {
        try {
            String reason = request.getOrDefault("reason", "Photo rejected by admin");
            Photo photo = adminService.rejectPhoto(photoId, reason, adminId);
            return ResponseEntity.ok(photo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // ========== Collection Management ==========
    
    @PostMapping("/collections")
    public ResponseEntity<Collection> createCollection(
            @Valid @RequestBody CreateCollectionRequest request,
            @RequestHeader("X-User-Id") Integer adminId) {
        try {
            Collection collection = adminService.createCollection(request, adminId);
            return ResponseEntity.ok(collection);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/collections")
    public ResponseEntity<List<Collection>> getAllCollections() {
        return ResponseEntity.ok(adminService.getAllCollections());
    }
    
    @GetMapping("/collections/{id}")
    public ResponseEntity<Collection> getCollectionById(@PathVariable Integer id) {
        try {
            Collection collection = adminService.getCollectionById(id);
            return ResponseEntity.ok(collection);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/collections/{id}")
    public ResponseEntity<Collection> updateCollection(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateCollectionRequest request) {
        try {
            Collection collection = adminService.updateCollection(id, request);
            return ResponseEntity.ok(collection);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/collections/{id}")
    public ResponseEntity<Map<String, String>> deleteCollection(@PathVariable Integer id) {
        try {
            adminService.deleteCollection(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Collection deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/collections/assign-photos")
    public ResponseEntity<Map<String, String>> assignPhotosToCollection(
            @Valid @RequestBody AssignPhotosToCollectionRequest request) {
        try {
            adminService.assignPhotosToCollection(request);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Photos assigned to collection successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/photos/{photoId}/collection")
    public ResponseEntity<Map<String, String>> removePhotoFromCollection(
            @PathVariable Integer photoId) {
        try {
            adminService.removePhotoFromCollection(photoId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Photo removed from collection successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // ========== User Management ==========
    
    @GetMapping("/users")
    public ResponseEntity<List<com.memories.gacha.model.User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }
    
    @GetMapping("/users/{id}")
    public ResponseEntity<com.memories.gacha.model.User> getUserById(@PathVariable Integer id) {
        try {
            com.memories.gacha.model.User user = adminService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/users/role")
    public ResponseEntity<com.memories.gacha.model.User> updateUserRole(
            @Valid @RequestBody com.memories.gacha.dto.UpdateUserRoleRequest request) {
        try {
            com.memories.gacha.model.User user = adminService.updateUserRole(request);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/users/{userId}/ban")
    public ResponseEntity<Map<String, String>> banUser(
            @PathVariable Integer userId,
            @RequestBody Map<String, Object> request) {
        try {
            String reason = (String) request.getOrDefault("reason", "Violation of terms");
            java.time.LocalDateTime bannedUntil = null;
            if (request.containsKey("bannedUntil")) {
                String dateStr = (String) request.get("bannedUntil");
                if (dateStr != null && !dateStr.isEmpty()) {
                    bannedUntil = java.time.LocalDateTime.parse(dateStr);
                }
            }
            adminService.banUser(userId, reason, bannedUntil);
            Map<String, String> response = new HashMap<>();
            response.put("message", "User banned successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/users/{userId}/unban")
    public ResponseEntity<Map<String, String>> unbanUser(@PathVariable Integer userId) {
        try {
            adminService.unbanUser(userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "User unbanned successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

