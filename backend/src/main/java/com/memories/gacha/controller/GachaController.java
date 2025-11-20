package com.memories.gacha.controller;

import com.memories.gacha.service.GachaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/gacha")
@CrossOrigin(origins = "http://localhost:5173")
public class GachaController {
    
    @Autowired
    private GachaService gachaService;
    
    @PostMapping("/single")
    public ResponseEntity<Map<String, Object>> singlePull(@RequestHeader("X-User-Id") Integer userId) {
        try {
            GachaService.GachaResult result = gachaService.performSinglePull(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("photo", result.getPhoto());
            response.put("ticketBalance", result.getTicketBalance());
            response.put("coinBalance", result.getCoinBalance());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/multi")
    public ResponseEntity<Map<String, Object>> multiPull(@RequestHeader("X-User-Id") Integer userId) {
        try {
            GachaService.MultiGachaResult result = gachaService.performMultiPull(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("photos", result.getPhotos());
            response.put("ticketBalance", result.getTicketBalance());
            response.put("coinBalance", result.getCoinBalance());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}

