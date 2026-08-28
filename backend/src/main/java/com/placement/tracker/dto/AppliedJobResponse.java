package com.placement.tracker.dto;

import java.time.LocalDateTime;

public record AppliedJobResponse(
        Long applicationId,
        String status,
        OpeningRoleDTO openingRoles,
        LocalDateTime appliedAt
) {
}
