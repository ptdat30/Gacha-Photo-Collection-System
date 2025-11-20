package com.memories.gacha.repository;

import com.memories.gacha.model.GachaHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GachaHistoryRepository extends JpaRepository<GachaHistory, Integer> {
    
    List<GachaHistory> findByUserUserId(Integer userId);
    
    List<GachaHistory> findByUserUserIdOrderByPulledAtDesc(Integer userId);
}

