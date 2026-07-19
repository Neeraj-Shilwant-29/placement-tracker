package com.placement.tracker.repository;

import com.placement.tracker.entity.AptitudeQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AptitudeQuestionRepository extends JpaRepository<AptitudeQuestion, Long> {
    List<AptitudeQuestion> findByCategoryAndActiveTrue(String category);
    List<AptitudeQuestion> findByActiveTrue();
    List<AptitudeQuestion> findByCategoryAndDifficultyAndActiveTrue(String category, String difficulty);
    long countByActiveTrue();
}
