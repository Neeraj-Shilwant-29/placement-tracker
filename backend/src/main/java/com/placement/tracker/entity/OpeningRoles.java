package com.placement.tracker.entity;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "job_openings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OpeningRoles {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    private String role;

    private String skills;

    private String description;

    private Integer openings;

    private String packageOffered;

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "opening_role_eligible_branches", joinColumns = @JoinColumn(name = "opening_role_id"))
    private Set<String> eligibleBranches = new HashSet<>();

    private Double minCgpa;

    private Double minTenth;

    private Double minTwelfth;

    private String location;

    private Boolean active;
}
