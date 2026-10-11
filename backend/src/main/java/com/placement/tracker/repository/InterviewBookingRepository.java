package com.placement.tracker.repository;

import com.placement.tracker.entity.InterviewBooking;
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
public interface InterviewBookingRepository extends JpaRepository<InterviewBooking, Long> {
    List<InterviewBooking> findByStudentIdOrderBySlotStartTimeAsc(Long studentId);

    Optional<InterviewBooking> findFirstBySlotIdAndStatus(Long slotId, String status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM InterviewBooking b WHERE b.id = :id")
    Optional<InterviewBooking> findByIdForUpdate(@Param("id") Long id);

    @Query("""
            SELECT COUNT(b) FROM InterviewBooking b
            WHERE b.student.id = :studentId
              AND b.status = 'CONFIRMED'
              AND (:excludeBookingId IS NULL OR b.id <> :excludeBookingId)
              AND b.slot.startTime < :endTime
              AND b.slot.endTime > :startTime
            """)
    long countOverlappingConfirmedBookings(
            @Param("studentId") Long studentId,
            @Param("excludeBookingId") Long excludeBookingId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);
}
