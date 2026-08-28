package com.placement.tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyDTO {
    private Long id;
    private String name;
    private String logo;
    private String website;
    private String description;
    private String industry;
    private String location;
    private String bond;
    private Set<String> eligibleBranches;
    private boolean active;
}
