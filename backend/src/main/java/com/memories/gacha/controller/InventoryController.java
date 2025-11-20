package com.memories.gacha.controller;

import com.memories.gacha.model.UserInventory;
import com.memories.gacha.repository.UserInventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "http://localhost:5173")
public class InventoryController {
    
    @Autowired
    private UserInventoryRepository userInventoryRepository;
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserInventory>> getUserInventory(@PathVariable Integer userId) {
        List<UserInventory> inventory = userInventoryRepository.findByUserUserId(userId);
        return ResponseEntity.ok(inventory);
    }
    
    @GetMapping("/user/{userId}/photos")
    public ResponseEntity<List<UserInventory>> getUserPhotos(@PathVariable Integer userId) {
        List<UserInventory> inventory = userInventoryRepository.findByUserUserId(userId);
        return ResponseEntity.ok(inventory);
    }
}

