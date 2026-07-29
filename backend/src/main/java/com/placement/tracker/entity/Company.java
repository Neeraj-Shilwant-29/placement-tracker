package com.placement.tracker.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "companies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String logo;
    private String website;
    private String description;

    @Column(nullable = false)
    private String industry;

    private String location;
    private String packageOffered;
    private String bond;

    private double minCgpa;
    private double minTenth;
    private double minTwelfth;

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "company_eligible_branches", joinColumns = @JoinColumn(name = "company_id"))
    private Set<String> eligibleBranches = new HashSet<>();

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
