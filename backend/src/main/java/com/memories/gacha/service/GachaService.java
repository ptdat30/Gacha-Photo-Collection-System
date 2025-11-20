package com.memories.gacha.service;

import com.memories.gacha.model.*;
import com.memories.gacha.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class GachaService {
    
    @Autowired
    private PhotoRepository photoRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserInventoryRepository userInventoryRepository;
    
    @Autowired
    private GachaHistoryRepository gachaHistoryRepository;
    
    @Autowired
    private DropRateConfigRepository dropRateConfigRepository;
    
    private final Random random = new Random();
    
    /**
     * Quay đơn (1 ảnh)
     */
    @Transactional
    public GachaResult performSinglePull(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Kiểm tra vé
        if (user.getTicketBalance() == null || user.getTicketBalance() < 1) {
            throw new RuntimeException("Không đủ vé để quay");
        }
        
        // Trừ vé
        user.setTicketBalance(user.getTicketBalance() - 1);
        user.setPityCounter((user.getPityCounter() == null ? 0 : user.getPityCounter()) + 1);
        userRepository.save(user);
        
        // Quay ảnh
        Photo photo = pullPhoto(user);
        
        // Thêm vào inventory (hoặc tăng quantity nếu đã có)
        addToInventory(user, photo);
        
        // Lưu lịch sử
        saveGachaHistory(user, photo, GachaHistory.PullType.SINGLE, 1);
        
        return new GachaResult(photo, user.getTicketBalance(), user.getCoinBalance());
    }
    
    /**
     * Quay 10 (10 ảnh)
     */
    @Transactional
    public MultiGachaResult performMultiPull(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Kiểm tra vé
        if (user.getTicketBalance() == null || user.getTicketBalance() < 10) {
            throw new RuntimeException("Không đủ vé để quay (cần 10 vé)");
        }
        
        // Trừ vé
        user.setTicketBalance(user.getTicketBalance() - 10);
        user.setPityCounter((user.getPityCounter() == null ? 0 : user.getPityCounter()) + 10);
        userRepository.save(user);
        
        // Quay 10 ảnh
        List<Photo> photos = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            Photo photo = pullPhoto(user);
            photos.add(photo);
            addToInventory(user, photo);
            saveGachaHistory(user, photo, GachaHistory.PullType.MULTI_10, 10);
        }
        
        return new MultiGachaResult(photos, user.getTicketBalance(), user.getCoinBalance());
    }
    
    /**
     * Logic quay ảnh dựa trên drop rate
     */
    private Photo pullPhoto(User user) {
        // Lấy tất cả drop rates
        List<DropRateConfig> dropRates = dropRateConfigRepository.findAll();
        
        if (dropRates.isEmpty()) {
            // Nếu chưa có config, dùng default rates
            return pullWithDefaultRates();
        }
        
        // Tính tổng drop rate
        double totalRate = dropRates.stream()
                .mapToDouble(DropRateConfig::getDropRate)
                .sum();
        
        // Random số từ 0 đến totalRate
        double randomValue = random.nextDouble() * totalRate;
        
        // Xác định rarity dựa trên random value
        double cumulativeRate = 0.0;
        Photo.PhotoRarity selectedRarity = Photo.PhotoRarity.C; // Default
        
        for (DropRateConfig config : dropRates) {
            cumulativeRate += config.getDropRate();
            if (randomValue <= cumulativeRate) {
                selectedRarity = config.getRarity();
                break;
            }
        }
        
        // Lấy random ảnh với rarity đã chọn
        List<Photo> photosWithRarity = photoRepository.findByStatusAndRarity(
                Photo.PhotoStatus.ACTIVE, selectedRarity);
        
        if (photosWithRarity.isEmpty()) {
            // Nếu không có ảnh với rarity này, lấy random ảnh ACTIVE
            List<Photo> allActivePhotos = photoRepository.findByStatus(Photo.PhotoStatus.ACTIVE);
            if (allActivePhotos.isEmpty()) {
                throw new RuntimeException("Không có ảnh nào trong hệ thống");
            }
            // Shuffle list để random
            java.util.Collections.shuffle(allActivePhotos);
            return allActivePhotos.get(0);
        }
        
        // Shuffle list để random
        java.util.Collections.shuffle(photosWithRarity);
        return photosWithRarity.get(0);
    }
    
    /**
     * Default drop rates nếu chưa có config
     */
    private Photo pullWithDefaultRates() {
        List<Photo> allActivePhotos = photoRepository.findByStatus(Photo.PhotoStatus.ACTIVE);
        if (allActivePhotos.isEmpty()) {
            throw new RuntimeException("Không có ảnh nào trong hệ thống");
        }
        return allActivePhotos.get(random.nextInt(allActivePhotos.size()));
    }
    
    /**
     * Thêm ảnh vào inventory (hoặc tăng quantity nếu đã có)
     */
    private void addToInventory(User user, Photo photo) {
        Optional<UserInventory> existingInventory = userInventoryRepository
                .findByUserUserIdAndPhotoPhotoId(user.getUserId(), photo.getPhotoId());
        
        if (existingInventory.isPresent()) {
            // Đã có ảnh này, tăng quantity
            UserInventory inventory = existingInventory.get();
            inventory.setQuantity(inventory.getQuantity() + 1);
            userInventoryRepository.save(inventory);
        } else {
            // Chưa có, tạo mới
            UserInventory inventory = new UserInventory();
            inventory.setUser(user);
            inventory.setPhoto(photo);
            inventory.setQuantity(1);
            inventory.setIsFavorite(false);
            userInventoryRepository.save(inventory);
        }
    }
    
    /**
     * Lưu lịch sử gacha
     */
    private void saveGachaHistory(User user, Photo photo, GachaHistory.PullType pullType, Integer ticketsUsed) {
        GachaHistory history = new GachaHistory();
        history.setUser(user);
        history.setPhoto(photo);
        history.setRarityPulled(photo.getRarity());
        history.setPullType(pullType);
        history.setTicketsUsed(ticketsUsed);
        gachaHistoryRepository.save(history);
    }
    
    // DTO classes
    public static class GachaResult {
        private Photo photo;
        private Integer ticketBalance;
        private Integer coinBalance;
        private boolean isDuplicate;
        
        public GachaResult(Photo photo, Integer ticketBalance, Integer coinBalance) {
            this.photo = photo;
            this.ticketBalance = ticketBalance;
            this.coinBalance = coinBalance;
        }
        
        // Getters and setters
        public Photo getPhoto() { return photo; }
        public void setPhoto(Photo photo) { this.photo = photo; }
        public Integer getTicketBalance() { return ticketBalance; }
        public void setTicketBalance(Integer ticketBalance) { this.ticketBalance = ticketBalance; }
        public Integer getCoinBalance() { return coinBalance; }
        public void setCoinBalance(Integer coinBalance) { this.coinBalance = coinBalance; }
        public boolean isDuplicate() { return isDuplicate; }
        public void setDuplicate(boolean duplicate) { isDuplicate = duplicate; }
    }
    
    public static class MultiGachaResult {
        private List<Photo> photos;
        private Integer ticketBalance;
        private Integer coinBalance;
        
        public MultiGachaResult(List<Photo> photos, Integer ticketBalance, Integer coinBalance) {
            this.photos = photos;
            this.ticketBalance = ticketBalance;
            this.coinBalance = coinBalance;
        }
        
        // Getters and setters
        public List<Photo> getPhotos() { return photos; }
        public void setPhotos(List<Photo> photos) { this.photos = photos; }
        public Integer getTicketBalance() { return ticketBalance; }
        public void setTicketBalance(Integer ticketBalance) { this.ticketBalance = ticketBalance; }
        public Integer getCoinBalance() { return coinBalance; }
        public void setCoinBalance(Integer coinBalance) { this.coinBalance = coinBalance; }
    }
}

