package com.placement.tracker.repository;

import com.placement.tracker.entity.MockInterview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MockInterviewRepository extends JpaRepository<MockInterview, Long> {
    List<MockInterview> findByStudentIdOrderByInterviewDateDesc(Long studentId);
    
    @Query("SELECT AVG(mi.overallScore) FROM MockInterview mi WHERE mi.student.id = :studentId")
    Double getAverageScoreByStudentId(@Param("studentId") Long studentId);
    
    @Query("SELECT COUNT(mi) FROM MockInterview mi WHERE mi.student.id = :studentId")
    Long getInterviewCountByStudentId(@Param("studentId") Long studentId);
}
