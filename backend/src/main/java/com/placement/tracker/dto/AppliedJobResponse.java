package com.placement.tracker.dto;

import java.time.LocalDateTime;

public record AppliedJobResponse(
        Long applicationId,
        Long companyId,
        String companyName,
        String status,
        LocalDateTime appliedAt
) {
}
