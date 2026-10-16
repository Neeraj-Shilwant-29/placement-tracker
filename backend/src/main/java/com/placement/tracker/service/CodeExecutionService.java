package com.placement.tracker.service;

import com.placement.tracker.dto.CodeExecutionRequest;
import com.placement.tracker.dto.CodeExecutionResponse;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
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
        } catch (ProcessStartException exception) {
            return failure(missingExecutableMessage(exception.executable()));
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

        if (!compileCommand.isEmpty()) {
            ProcessResult compilation = runProcess(compileCommand, directory, "");
            if (compilation.exitCode() != 0) {
                return failure(compilation.errorOrOutput());
            }
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
        case "cpp" -> List.of(
            cppCompilerExecutable(),
            "-std=c++17",
            "Main.cpp",
            "-o",
            isWindows() ? "Main.exe" : "Main"
        );

        case "java" -> List.of("javac", "Main.java");

        case "python", "javascript" -> List.of();

        default -> null;
    };
}

private List<String> runCommand(Path directory, String language) {
    return switch (language) {
        case "cpp" -> List.of(
            directory.resolve(
                isWindows() ? "Main.exe" : "Main"
            ).toString()
        );

        case "java" -> List.of("java", "Main");

        case "python" -> List.of(
            isWindows() ? "python" : "python3",
            "Main.py"
        );

        case "javascript" -> List.of("node", "Main.js");

        default -> List.of();
    };
}

    private boolean isWindows() {
        return System.getProperty("os.name").toLowerCase(Locale.ROOT).contains("win");
    }
    private String cppCompilerExecutable() {
    String configuredPath = System.getenv("CPP_COMPILER_PATH");

    if (configuredPath != null && !configuredPath.isBlank()) {
        return configuredPath;
    }

    Path windowsCompiler = Path.of(
        "C:\\msys64\\ucrt64\\bin\\g++.exe"
    );

    if (isWindows() && Files.isRegularFile(windowsCompiler)) {
        return windowsCompiler.toString();
    }

    return "g++";
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
Process process;

try {
    ProcessBuilder builder = new ProcessBuilder(command)
        .directory(directory.toFile())
        .redirectErrorStream(false);

    // Make MSYS2 GCC and its runtime DLLs available
    if (isWindows()) {
        String ucrtBin = "C:\\msys64\\ucrt64\\bin";

        if (Files.isDirectory(Path.of(ucrtBin))) {
            String currentPath = builder.environment()
                .getOrDefault("PATH", "");

            if (!currentPath.toLowerCase(Locale.ROOT)
                    .contains(ucrtBin.toLowerCase(Locale.ROOT))) {
                builder.environment().put(
                    "PATH",
                    ucrtBin + ";" + currentPath
                );
            }
        }
    }

    process = builder.start();

} catch (IOException exception) {
    throw new ProcessStartException(command.get(0), exception);
}
        CompletableFuture<String> output = readStream(process.getInputStream());
        CompletableFuture<String> error = readStream(process.getErrorStream());

        try {
            process.getOutputStream().write((input == null ? "" : input).getBytes(StandardCharsets.UTF_8));
            process.getOutputStream().close();

            boolean finished = process.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                process.waitFor();
                return new ProcessResult(-1, awaitStream(output), "Execution timed out.");
            }

            return new ProcessResult(process.exitValue(), awaitStream(output), awaitStream(error));
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            process.destroyForcibly();
            return new ProcessResult(-1, "", "Execution was interrupted.");
        }
    }

    private String missingExecutableMessage(String executable) {
        if (executable.equals("g++")) {
            return "C++ compiler 'g++' was not found. Install GCC/MinGW and add its bin directory to PATH, then restart the backend. On Windows, install the MSYS2 UCRT64 GCC package with 'pacman -S mingw-w64-ucrt-x86_64-gcc'.";
        }
        return "Required execution tool '" + executable + "' was not found. Install it and add it to PATH, then restart the backend.";
    }

    private CompletableFuture<String> readStream(java.io.InputStream stream) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
            } catch (IOException exception) {
                throw new UncheckedIOException(exception);
            }
        });
    }

    private String awaitStream(CompletableFuture<String> stream) throws IOException, InterruptedException {
        try {
            return stream.get();
        } catch (ExecutionException exception) {
            Throwable cause = exception.getCause();
            if (cause instanceof UncheckedIOException ioException) {
                throw ioException.getCause();
            }
            throw new IOException("Unable to read code execution output.", cause);
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

    private static final class ProcessStartException extends IOException {
        private final String executable;

        private ProcessStartException(String executable, IOException cause) {
            super(cause);
            this.executable = executable;
        }

        private String executable() {
            return executable;
        }
    }
}