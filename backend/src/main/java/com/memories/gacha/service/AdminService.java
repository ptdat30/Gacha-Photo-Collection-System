package com.memories.gacha.service;

import com.memories.gacha.dto.*;
import com.memories.gacha.model.Collection;
import com.memories.gacha.model.Photo;
import com.memories.gacha.model.User;
import com.memories.gacha.repository.CollectionRepository;
import com.memories.gacha.repository.PhotoRepository;
import com.memories.gacha.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AdminService {
    
    @Autowired
    private PhotoRepository photoRepository;
    
    @Autowired
    private CollectionRepository collectionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // Photo Management
    public Photo createPhoto(com.memories.gacha.dto.CreatePhotoRequest request, Integer adminId) {
        Photo photo = new Photo();
        photo.setImageUrl(request.getImageUrl());
        photo.setThumbnailUrl(request.getThumbnailUrl());
        photo.setRarity(request.getRarity());
        photo.setStatus(Photo.PhotoStatus.ACTIVE);
        
        if (request.getCollectionId() != null) {
            Optional<Collection> collectionOpt = collectionRepository.findById(request.getCollectionId());
            if (collectionOpt.isPresent()) {
                photo.setCollection(collectionOpt.get());
            }
        }
        
        Optional<User> adminOpt = userRepository.findById(adminId);
        if (adminOpt.isPresent()) {
            photo.setUploadedBy(adminOpt.get());
            photo.setApprovedBy(adminOpt.get());
            photo.setApprovedAt(java.time.LocalDateTime.now());
        }
        
        return photoRepository.save(photo);
    }
    
    public Photo updatePhotoRarity(UpdatePhotoRarityRequest request, Integer adminId) {
        Optional<Photo> photoOpt = photoRepository.findById(request.getPhotoId());
        if (photoOpt.isEmpty()) {
            throw new RuntimeException("Photo not found");
        }
        
        Photo photo = photoOpt.get();
        photo.setRarity(request.getRarity());
        
        // Assign to collection if provided
        if (request.getCollectionId() != null) {
            Optional<Collection> collectionOpt = collectionRepository.findById(request.getCollectionId());
            if (collectionOpt.isPresent()) {
                photo.setCollection(collectionOpt.get());
            }
        }
        
        return photoRepository.save(photo);
    }
    
    public List<Photo> getAllPhotos() {
        return photoRepository.findAll();
    }
    
    public List<Photo> getPhotosByStatus(Photo.PhotoStatus status) {
        return photoRepository.findByStatus(status);
    }
    
    public Photo approvePhoto(Integer photoId, Integer adminId) {
        Optional<Photo> photoOpt = photoRepository.findById(photoId);
        if (photoOpt.isEmpty()) {
            throw new RuntimeException("Photo not found");
        }
        
        Photo photo = photoOpt.get();
        photo.setStatus(Photo.PhotoStatus.ACTIVE);
        
        Optional<User> adminOpt = userRepository.findById(adminId);
        if (adminOpt.isPresent()) {
            photo.setApprovedBy(adminOpt.get());
        }
        photo.setApprovedAt(java.time.LocalDateTime.now());
        
        return photoRepository.save(photo);
    }
    
    public Photo rejectPhoto(Integer photoId, String reason, Integer adminId) {
        Optional<Photo> photoOpt = photoRepository.findById(photoId);
        if (photoOpt.isEmpty()) {
            throw new RuntimeException("Photo not found");
        }
        
        Photo photo = photoOpt.get();
        photo.setStatus(Photo.PhotoStatus.REJECTED);
        photo.setRejectionReason(reason);
        
        return photoRepository.save(photo);
    }
    
    // Collection Management
    @Transactional
    public Collection createCollection(CreateCollectionRequest request, Integer adminId) {
        Optional<User> adminOpt = userRepository.findById(adminId);
        if (adminOpt.isEmpty()) {
            throw new RuntimeException("Admin not found");
        }
        
        Collection collection = new Collection();
        collection.setName(request.getName());
        collection.setDescription(request.getDescription());
        collection.setCoverImageUrl(request.getCoverImageUrl());
        collection.setCreatedBy(adminOpt.get());
        
        return collectionRepository.save(collection);
    }
    
    public List<Collection> getAllCollections() {
        return collectionRepository.findAll();
    }
    
    public Collection getCollectionById(Integer collectionId) {
        return collectionRepository.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found"));
    }
    
    @Transactional
    public Collection updateCollection(Integer collectionId, UpdateCollectionRequest request) {
        Collection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found"));
        
        if (request.getName() != null) {
            collection.setName(request.getName());
        }
        if (request.getDescription() != null) {
            collection.setDescription(request.getDescription());
        }
        if (request.getCoverImageUrl() != null) {
            collection.setCoverImageUrl(request.getCoverImageUrl());
        }
        
        return collectionRepository.save(collection);
    }
    
    @Transactional
    public void deleteCollection(Integer collectionId) {
        Collection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found"));
        
        // Remove collection from photos (set to null)
        List<Photo> photos = photoRepository.findByCollectionCollectionId(collectionId);
        for (Photo photo : photos) {
            photo.setCollection(null);
            photoRepository.save(photo);
        }
        
        collectionRepository.delete(collection);
    }
    
    @Transactional
    public void assignPhotosToCollection(AssignPhotosToCollectionRequest request) {
        Optional<Collection> collectionOpt = collectionRepository.findById(request.getCollectionId());
        if (collectionOpt.isEmpty()) {
            throw new RuntimeException("Collection not found");
        }
        
        Collection collection = collectionOpt.get();
        
        for (Integer photoId : request.getPhotoIds()) {
            Optional<Photo> photoOpt = photoRepository.findById(photoId);
            if (photoOpt.isPresent()) {
                Photo photo = photoOpt.get();
                photo.setCollection(collection);
                photoRepository.save(photo);
            }
        }
    }
    
    @Transactional
    public Photo removePhotoFromCollection(Integer photoId) {
        Optional<Photo> photoOpt = photoRepository.findById(photoId);
        if (photoOpt.isEmpty()) {
            throw new RuntimeException("Photo not found");
        }
        
        Photo photo = photoOpt.get();
        photo.setCollection(null);
        return photoRepository.save(photo);
    }
    
    // User Management
    public User updateUserRole(UpdateUserRoleRequest request) {
        Optional<User> userOpt = userRepository.findById(request.getUserId());
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        user.setRole(request.getRole());
        
        return userRepository.save(user);
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public User getUserById(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    @Transactional
    public void banUser(Integer userId, String reason, java.time.LocalDateTime bannedUntil) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        user.setIsBanned(true);
        user.setBanReason(reason);
        user.setBannedUntil(bannedUntil);
        
        userRepository.save(user);
    }
    
    @Transactional
    public void unbanUser(Integer userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        user.setIsBanned(false);
        user.setBanReason(null);
        user.setBannedUntil(null);
        
        userRepository.save(user);
    }
}

