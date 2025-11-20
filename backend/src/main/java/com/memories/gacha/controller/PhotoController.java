package com.memories.gacha.controller;

import com.memories.gacha.model.Photo;
import com.memories.gacha.repository.PhotoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/photos")
@CrossOrigin(origins = "http://localhost:5173")
public class PhotoController {
    
    @Autowired
    private PhotoRepository photoRepository;
    
    @GetMapping
    public ResponseEntity<List<Photo>> getAllPhotos() {
        return ResponseEntity.ok(photoRepository.findAll());
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<Photo>> getActivePhotos() {
        return ResponseEntity.ok(photoRepository.findByStatus(Photo.PhotoStatus.ACTIVE));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Photo> getPhotoById(@PathVariable Integer id) {
        Optional<Photo> photo = photoRepository.findById(id);
        return photo.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/rarity/{rarity}")
    public ResponseEntity<List<Photo>> getPhotosByRarity(@PathVariable String rarity) {
        try {
            Photo.PhotoRarity photoRarity = Photo.PhotoRarity.valueOf(rarity.toUpperCase());
            return ResponseEntity.ok(photoRepository.findByRarity(photoRarity));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/collection/{collectionId}")
    public ResponseEntity<List<Photo>> getPhotosByCollection(@PathVariable Integer collectionId) {
        return ResponseEntity.ok(photoRepository.findByCollectionCollectionId(collectionId));
    }
}

