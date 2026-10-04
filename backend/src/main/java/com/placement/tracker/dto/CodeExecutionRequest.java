package com.placement.tracker.dto;

import java.util.List;

public record CodeExecutionRequest(
        String code,
        String language,
        List<TestCase> testCases
) {
    public record TestCase(String input, String expected) {
    }
}