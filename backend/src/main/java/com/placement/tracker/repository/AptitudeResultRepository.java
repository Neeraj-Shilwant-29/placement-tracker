package com.placement.tracker.repository;

import com.placement.tracker.entity.AptitudeResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AptitudeResultRepository extends JpaRepository<AptitudeResult, Long> {
    List<AptitudeResult> findByStudentIdOrderByAttemptedAtDesc(Long studentId);
    
    @Query("SELECT AVG(ar.marksObtained) FROM AptitudeResult ar WHERE ar.student.id = :studentId")
    Double getAverageMarksByStudentId(@Param("studentId") Long studentId);
    
    @Query("SELECT COUNT(ar) FROM AptitudeResult ar WHERE ar.student.id = :studentId")
    Long getTestCountByStudentId(@Param("studentId") Long studentId);
}
