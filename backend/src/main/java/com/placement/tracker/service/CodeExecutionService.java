package com.placement.tracker.service;

import com.placement.tracker.dto.CodeExecutionRequest;
import com.placement.tracker.dto.CodeExecutionResponse;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

@Service
public class CodeExecutionService {

    private static final long TIMEOUT_SECONDS = 5;

    public CodeExecutionResponse execute(CodeExecutionRequest request) {
        if (request == null || request.code() == null || request.code().isBlank()) {
            return failure("Code is required.");
        }

        String language = request.language() == null
                ? ""
                : request.language().toLowerCase(Locale.ROOT);

        try {
            Path workingDirectory = Files.createTempDirectory("placement-code-");
            try {
                return executeInDirectory(workingDirectory, request, language);
            } finally {
                deleteDirectory(workingDirectory);
            }
        } catch (IOException exception) {
            return failure("Unable to prepare code execution: " + exception.getMessage());
        }
    }

    private CodeExecutionResponse executeInDirectory(
            Path directory,
            CodeExecutionRequest request,
            String language
    ) throws IOException {
        List<String> compileCommand = compileCommand(directory, language);
        if (compileCommand == null) {
            return failure("Unsupported language: " + request.language());
        }

        Files.writeString(sourceFile(directory, language), request.code(), StandardCharsets.UTF_8);

        ProcessResult compilation = runProcess(compileCommand, directory, "");
        if (compilation.exitCode() != 0) {
            return failure(compilation.errorOrOutput());
        }

        List<CodeExecutionResponse.Result> results = new ArrayList<>();
        List<CodeExecutionRequest.TestCase> testCases = request.testCases() == null
                ? List.of()
                : request.testCases();

        for (int index = 0; index < testCases.size(); index++) {
            CodeExecutionRequest.TestCase testCase = testCases.get(index);
            ProcessResult execution = runProcess(
                    runCommand(directory, language),
                    directory,
                    testCase.input()
            );

            String actual = execution.output().trim();
            String error = execution.exitCode() == 0
                    ? null
                    : execution.errorOrOutput();
            boolean passed = execution.exitCode() == 0
                    && normalize(actual).equals(normalize(testCase.expected()));

            results.add(new CodeExecutionResponse.Result(
                    index + 1,
                    testCase.input(),
                    testCase.expected(),
                    actual,
                    passed,
                    error
            ));
        }

        boolean success = results.stream().allMatch(CodeExecutionResponse.Result::passed);
        String output = results.stream()
                .map(CodeExecutionResponse.Result::actual)
                .filter(value -> !value.isBlank())
                .reduce((left, right) -> left + "\n" + right)
                .orElse("");

        return new CodeExecutionResponse(success, results, output, null);
    }

    private List<String> compileCommand(Path directory, String language) {
        return switch (language) {
            case "cpp" -> List.of("g++", "-std=c++17", "Main.cpp", "-o", "Main.exe");
            case "java" -> List.of("javac", "Main.java");
            case "python", "javascript" -> List.of("cmd", "/c", "exit", "0");
            default -> null;
        };
    }

    private List<String> runCommand(Path directory, String language) {
        return switch (language) {
            case "cpp" -> List.of("Main.exe");
            case "java" -> List.of("java", "Main");
            case "python" -> List.of("python", "Main.py");
            case "javascript" -> List.of("node", "Main.js");
            default -> List.of();
        };
    }

    private Path sourceFile(Path directory, String language) {
        String extension = switch (language) {
            case "cpp" -> "cpp";
            case "java" -> "java";
            case "python" -> "py";
            case "javascript" -> "js";
            default -> "txt";
        };
        return directory.resolve("Main." + extension);
    }

    private ProcessResult runProcess(List<String> command, Path directory, String input) throws IOException {
        Process process = new ProcessBuilder(command)
                .directory(directory.toFile())
                .redirectErrorStream(false)
                .start();

        try {
            process.getOutputStream().write((input == null ? "" : input).getBytes(StandardCharsets.UTF_8));
            process.getOutputStream().close();

            boolean finished = process.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                return new ProcessResult(-1, "", "Execution timed out.");
            }

            String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            String error = new String(process.getErrorStream().readAllBytes(), StandardCharsets.UTF_8);
            return new ProcessResult(process.exitValue(), output, error);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            process.destroyForcibly();
            return new ProcessResult(-1, "", "Execution was interrupted.");
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().replaceAll("\\s+", " ");
    }

    private CodeExecutionResponse failure(String message) {
        return new CodeExecutionResponse(false, List.of(), "", message);
    }

    private void deleteDirectory(Path directory) throws IOException {
        try (var paths = Files.walk(directory)) {
            paths.sorted((left, right) -> right.compareTo(left)).forEach(path -> {
                try {
                    Files.deleteIfExists(path);
                } catch (IOException ignored) {
                }
            });
        }
    }

    private record ProcessResult(int exitCode, String output, String error) {
        private String errorOrOutput() {
            return error == null || error.isBlank() ? output : error;
        }
    }
}