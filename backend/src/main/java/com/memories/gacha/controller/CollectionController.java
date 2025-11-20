package com.memories.gacha.controller;

import com.memories.gacha.model.Collection;
import com.memories.gacha.repository.CollectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/collections")
@CrossOrigin(origins = "http://localhost:5173")
public class CollectionController {
    
    @Autowired
    private CollectionRepository collectionRepository;
    
    @GetMapping
    public ResponseEntity<List<Collection>> getAllCollections() {
        return ResponseEntity.ok(collectionRepository.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Collection> getCollectionById(@PathVariable Integer id) {
        Optional<Collection> collection = collectionRepository.findById(id);
        return collection.map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
    }
}

