package com.placement.tracker.repository;

import com.placement.tracker.entity.CodingQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CodingQuestionRepository extends JpaRepository<CodingQuestion, Long> {
    List<CodingQuestion> findByCategoryAndActiveTrue(String category);
    List<CodingQuestion> findByActiveTrue();
    List<CodingQuestion> findByDifficultyAndActiveTrue(String difficulty);
    long countByActiveTrue();
}
