package com.memories.gacha.repository;

import com.memories.gacha.model.Marketplace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarketplaceRepository extends JpaRepository<Marketplace, Integer> {
    
    List<Marketplace> findByStatus(Marketplace.ListingStatus status);
    
    List<Marketplace> findBySellerUserId(Integer sellerId);
    
    List<Marketplace> findByBuyerUserId(Integer buyerId);
}

