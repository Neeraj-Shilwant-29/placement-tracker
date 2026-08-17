package com.placement.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OpeningRoleResponse {

    private Long id;

    private Long companyId;

    private String companyName;

    private String roleName;

    private String skills;

    private String jd;

    private Integer openings;

    private String packageOffered;

    @Builder.Default
    private Set<String> eligibleBranches = new HashSet<>();

    private Double minCgpa;

    private Double minTenth;

    private Double minTwelfth;

    private String location;

    @Builder.Default
    private Boolean active = true;
}