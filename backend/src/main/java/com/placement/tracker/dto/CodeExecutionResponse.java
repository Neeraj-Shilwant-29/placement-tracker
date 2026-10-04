package com.placement.tracker.dto;

import java.util.List;

public record CodeExecutionResponse(
        boolean success,
        List<Result> results,
        String output,
        String error
) {
    public record Result(
            int testCase,
            String input,
            String expected,
            String actual,
            boolean passed,
            String error
    ) {
    }
}