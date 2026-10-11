package com.placement.tracker.repository;

import com.placement.tracker.entity.InterviewSlot;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewSlotRepository extends JpaRepository<InterviewSlot, Long> {
    List<InterviewSlot> findByStartTimeBetweenOrderByStartTimeAsc(LocalDateTime start, LocalDateTime end);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM InterviewSlot s WHERE s.id = :id")
    Optional<InterviewSlot> findByIdForUpdate(@Param("id") Long id);

    @Query("""
            SELECT COUNT(s) FROM InterviewSlot s
            WHERE s.id <> :slotId
              AND s.status <> 'CANCELLED'
              AND (
                    (:interviewerId IS NOT NULL AND s.interviewerId = :interviewerId)
                    OR (:interviewerId IS NULL AND LOWER(s.interviewerName) = LOWER(:interviewerName))
                  )
              AND s.startTime < :endTime
              AND s.endTime > :startTime
            """)
    long countOverlappingInterviewerSlots(
            @Param("slotId") Long slotId,
            @Param("interviewerId") Long interviewerId,
            @Param("interviewerName") String interviewerName,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);
}
