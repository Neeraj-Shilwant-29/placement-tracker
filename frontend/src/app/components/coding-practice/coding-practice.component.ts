import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { CodingService } from "../../services/coding.service";
import { AuthService } from "../../services/auth.service";
import { CodeEditorComponent } from "../code-editor/code-editor.component";
import { getCodingPracticeProblem } from "./coding-practice-problems";

interface TestCase {
  input: string;
  expected: string;
  actual: string;
  status: "pending" | "running" | "passed" | "failed" | "error";
  error?: string;
}

interface TestResult {
  testCase: number;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  error?: string;
}

interface CodeExecutionResponse {
  success: boolean;
  results: TestResult[];
  output?: string;
  error?: string;
}

@Component({
  selector: "app-coding-practice",
  templateUrl: "./coding-practice.component.html",
  styleUrls: ["./coding-practice.component.scss"],
})
export class CodingPracticeComponent implements OnInit {

  @ViewChild(CodeEditorComponent)
  private codeEditor?: CodeEditorComponent;

  questions: any[] = [];
  filteredQuestions: any[] = [];
  selectedQuestion: any = null;

  filterDifficulty = "";
  filterCategory = "";

  leftWidth = 60;
  isResizing = false;

  selectedLanguage = "cpp";

  code = `#include <iostream>
using namespace std;

int main() {

    int arr[10] = {2,3,4,6};
    int target = 5;

    cout << arr[0];

    return 0;
}`;

  // ─────────────────────────────────────────────
  // RUN / SUBMIT
  // ─────────────────────────────────────────────

  isRunning = false;
  isSubmitting = false;

  runResult: "" | "success" | "error" = "";
  resultMessage = "";

  // Actual output of complete program
  output = "";

  // Runtime / compilation error
  executionError = "";

  // ─────────────────────────────────────────────
  // TEST CASES
  // ─────────────────────────────────────────────

  testCases: TestCase[] = [];

  passedTestCases = 0;
  totalTestCases = 0;

  selectedTestCase = 0;
  activeTab = "testcase";

  // ─────────────────────────────────────────────
  // TOAST
  // ─────────────────────────────────────────────

  toast = {
    visible: false,
    type: "info" as "success" | "error" | "info" | "warning",
    title: "",
    message: "",
  };

  private toastTimeout: any;

  constructor(
    private codingService: CodingService,
    private authService: AuthService,
    private router: Router,
  ) {}

  // ─────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────

  ngOnInit(): void {

    this.codingService.getAllQuestions().subscribe({

      next: (data) => {

        this.questions = data || [];
        this.filteredQuestions = this.questions;

      },

      error: (err) => {

        console.error("Error loading coding questions:", err);

        this.showToast(
          "error",
          "Error",
          "Unable to load coding questions."
        );

      }

    });
  }

  // ─────────────────────────────────────────────
  // RESIZE
  // ─────────────────────────────────────────────

  startResize(event: MouseEvent): void {

    event.preventDefault();

    this.isResizing = true;

    const workspace = (event.target as HTMLElement).closest(
      ".workspace",
    ) as HTMLElement;

    if (!workspace) {
      return;
    }

    const onMouseMove = (e: MouseEvent) => {

      if (!this.isResizing) {
        return;
      }

      const rect = workspace.getBoundingClientRect();

      let newWidth =
        ((e.clientX - rect.left) / rect.width) * 100;

      newWidth = Math.max(
        25,
        Math.min(75, newWidth)
      );

      this.leftWidth = newWidth;
    };

    const onMouseUp = () => {

      this.isResizing = false;

      document.removeEventListener(
        "mousemove",
        onMouseMove
      );

      document.removeEventListener(
        "mouseup",
        onMouseUp
      );

      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    document.addEventListener(
      "mousemove",
      onMouseMove
    );

    document.addEventListener(
      "mouseup",
      onMouseUp
    );

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  // ─────────────────────────────────────────────
  // CODE EDITOR
  // ─────────────────────────────────────────────

  onCodeChange(code: string): void {
    this.code = code;
  }

  private getCurrentCode(): string {
    const editorCode = this.codeEditor?.getCode();

    if (editorCode !== undefined) {
      this.code = editorCode;
    }

    return this.code;
  }

  changeLanguage(): void {
    this.code = this.getCodeTemplate(this.selectedLanguage);
    this.resetResults();
  }

  private getCodeTemplate(language: string): string {
    const problem = this.selectedQuestion
      ? getCodingPracticeProblem(this.selectedQuestion.title)
      : undefined;
    return problem?.starterCode[language] || this.getDefaultCodeTemplate(language);
  }

  private getDefaultCodeTemplate(language: string): string {
    switch (language) {
      case "java":
        return `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        // Read input and print the answer.
    }
}`;
      case "python":
        return `import sys

data = sys.stdin.read()
# Read input and print the answer.`;
      case "javascript":
        return `const fs = require("fs");
const input = fs.readFileSync(0, "utf8");
// Read input and print the answer.`;
      case "cpp":
      default:
        return `#include <iostream>
using namespace std;

int main() {
    // Read input and print the answer.
    return 0;
}`;
    }
  }

  // ─────────────────────────────────────────────
  // LOAD TEST CASES
  // ─────────────────────────────────────────────

  private loadTestCases(): void {

    /*
      Your database question should ideally contain:

      testCases: [
        {
          input: "...",
          expected: "..."
        },
        {
          input: "...",
          expected: "..."
        }
      ]
    */

    const questionCases = Array.isArray(this.selectedQuestion?.testCases)
      ? this.selectedQuestion.testCases
      : undefined;
    const problem = this.selectedQuestion
      ? getCodingPracticeProblem(this.selectedQuestion.title)
      : undefined;
    const cases = questionCases?.length
      ? questionCases
      : problem?.testCases || [{
        input: this.selectedQuestion?.sampleInput || "",
        expected: this.selectedQuestion?.sampleOutput || "",
      }];

    this.testCases = cases.map((test: any) => ({
      input: test.input || "",
      expected: test.expected ?? test.expectedOutput ?? "",
      actual: "",
      status: "pending",
    }));

    this.totalTestCases = this.testCases.length;
    this.passedTestCases = 0;
    this.selectedTestCase = 0;

  }

  // ─────────────────────────────────────────────
  // RESET RESULTS
  // ─────────────────────────────────────────────

  private resetResults(): void {

    this.runResult = "";
    this.resultMessage = "";
    this.output = "";
    this.executionError = "";

    this.passedTestCases = 0;

    this.testCases.forEach((test) => {

      test.status = "pending";
      test.actual = "";
      test.error = undefined;

    });

  }

  // ─────────────────────────────────────────────
  // RUN CODE
  // ─────────────────────────────────────────────

  runCode(): void {

    const currentCode = this.getCurrentCode();

    // Empty code
    if (!currentCode || !currentCode.trim()) {

      this.showToast(
        "warning",
        "Code Required",
        "Please write some code before running."
      );

      return;
    }

    // No question selected
    if (!this.selectedQuestion) {

      this.showToast(
        "warning",
        "No Problem Selected",
        "Please select a coding problem first."
      );

      return;
    }

    // No test cases
    if (!this.testCases.length) {

      this.showToast(
        "error",
        "No Test Cases",
        "This problem does not have any test cases."
      );

      return;
    }

    this.isRunning = true;

    this.activeTab = "result";

    this.resetResults();

    this.showToast(
      "info",
      "Running Code",
      "Your code is being compiled and tested..."
    );

    /*
      IMPORTANT:

      Angular should NOT directly execute arbitrary
      C++ / Java / Python code in the browser.

      The backend should compile/run the code and
      return the result for every testcase.
    */

    this.codingService
      .runCode({
        code: currentCode,
        language: this.selectedLanguage,
        testCases: this.testCases.map((test) => ({
          input: test.input,
          expected: test.expected,
        })),
      })
      .subscribe({

        next: (response: CodeExecutionResponse) => {

          this.handleExecutionResponse(response);

          this.isRunning = false;

        },

        error: (err) => {

          console.error(
            "Code execution error:",
            err
          );

          this.isRunning = false;

          this.runResult = "error";

          this.executionError =
            err?.error?.message ||
            err?.error?.error ||
            "Unable to execute code.";

          this.resultMessage =
            this.executionError;

          this.showToast(
            "error",
            "Execution Failed",
            this.executionError
          );

        }

      });

  }

  // ─────────────────────────────────────────────
  // HANDLE RESULT
  // ─────────────────────────────────────────────

  private handleExecutionResponse(
    response: CodeExecutionResponse
  ): void {

    if (!response) {

      this.runResult = "error";

      this.resultMessage =
        "No response received from code execution server.";

      return;

    }

    // Runtime / compilation error
    if (
      !response.success &&
      response.error
    ) {

      this.runResult = "error";

      this.executionError =
        response.error;

      this.resultMessage =
        response.error;

      this.showToast(
        "error",
        "Compilation / Runtime Error",
        response.error
      );

      return;

    }

    // Clear old values
    this.output = "";

    this.passedTestCases = 0;

    // Process every testcase
    if (
      Array.isArray(response.results)
    ) {

      response.results.forEach(
        (result: TestResult, index: number) => {

          const test =
            this.testCases[index];

          if (!test) {
            return;
          }

          test.actual =
            result.actual || "";

          test.error =
            result.error;

          if (result.passed) {

            test.status = "passed";

            this.passedTestCases++;

          } else {
            test.status = result.error ? "error" : "failed";
          }

        }
      );

    }

    this.totalTestCases =
      this.testCases.length;

    // ─────────────────────────────────────
    // ALL TEST CASES PASSED
    // ─────────────────────────────────────

    if (
      this.passedTestCases ===
      this.totalTestCases
    ) {

      this.runResult = "success";

      this.resultMessage =
        "Accepted! All test cases passed.";

      /*
        Only show actual program output
        when all test cases are correct.
      */

      this.output =
        response.output ||
        this.testCases
          .map((test) => test.actual)
          .filter((value) => value !== "")
          .join("\n");

      this.showToast(
        "success",
        "Accepted",
        `All ${this.totalTestCases} test cases passed.`
      );

      return;
    }

    // ─────────────────────────────────────
    // SOME TEST CASE FAILED
    // ─────────────────────────────────────

    this.runResult = "error";

    const failedIndex =
      this.testCases.findIndex(
        (test) => test.status === "failed" || test.status === "error"
      );

    const failedTest =
      failedIndex >= 0
        ? this.testCases[failedIndex]
        : null;

    if (failedTest) {

      this.executionError = failedTest.error || "";
      this.resultMessage = failedTest.error
        ? `Test Case ${failedIndex + 1} runtime error: ${failedTest.error}`
        : `Test Case ${failedIndex + 1} failed. ` +
          `Expected: ${failedTest.expected} | ` +
          `Actual: ${failedTest.actual || "No output"}`;

    } else {

      this.resultMessage =
        "Your solution did not pass all test cases.";

    }

    this.showToast(
      "error",
      this.executionError ? "Execution Error" : "Wrong Answer",
      this.resultMessage
    );

  }

  // ─────────────────────────────────────────────
  // SUBMIT CODE
  // ─────────────────────────────────────────────

  submitCode(): void {

    const currentCode = this.getCurrentCode();

    if (!currentCode || !currentCode.trim()) {

      this.showToast(
        "warning",
        "Code Required",
        "Please write some code before submitting."
      );

      return;
    }

    if (!this.selectedQuestion) {

      this.showToast(
        "warning",
        "No Problem Selected",
        "Please select a coding problem."
      );

      return;
    }

    this.isSubmitting = true;

    this.activeTab = "result";

    this.resetResults();

    this.showToast(
      "info",
      "Submitting Solution",
      "Your solution is being evaluated..."
    );

    this.codingService
      .runCode({
        code: currentCode,
        language: this.selectedLanguage,
        testCases: this.testCases.map((test) => ({
          input: test.input,
          expected: test.expected,
        })),
      })
      .subscribe({

        next: (response: CodeExecutionResponse) => {

          this.handleExecutionResponse(
            response
          );

          this.isSubmitting = false;

          if (
            response.success &&
            this.passedTestCases ===
              this.totalTestCases
          ) {

            this.showToast(
              "success",
              "Accepted!",
              "Your solution passed all test cases."
            );

          }

        },

        error: (err) => {

          console.error(
            "Submission error:",
            err
          );

          this.isSubmitting = false;

          this.runResult = "error";

          this.executionError =
            err?.error?.message ||
            err?.error?.error ||
            "Submission failed.";

          this.resultMessage =
            this.executionError;

          this.showToast(
            "error",
            "Submission Failed",
            this.executionError
          );

        }

      });

  }

  // ─────────────────────────────────────────────
  // TOAST
  // ─────────────────────────────────────────────

  showToast(
    type:
      | "success"
      | "error"
      | "info"
      | "warning",
    title: string,
    message: string,
  ): void {

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.toast = {
      visible: true,
      type,
      title,
      message,
    };

    this.toastTimeout =
      setTimeout(() => {

        this.closeToast();

      }, 4000);

  }

  closeToast(): void {

    this.toast.visible = false;

    if (this.toastTimeout) {

      clearTimeout(
        this.toastTimeout
      );

    }

  }

  // ─────────────────────────────────────────────
  // FILTER QUESTIONS
  // ─────────────────────────────────────────────

  filterQuestions(): void {

    this.filteredQuestions =
      this.questions.filter((q) => {

        const matchDifficulty =
          !this.filterDifficulty ||
          q.difficulty ===
            this.filterDifficulty;

        const matchCategory =
          !this.filterCategory ||
          q.category ===
            this.filterCategory;

        return (
          matchDifficulty &&
          matchCategory
        );

      });

  }

  // ─────────────────────────────────────────────
  // SELECT QUESTION
  // ─────────────────────────────────────────────

  selectQuestion(q: any): void {

    this.selectedQuestion = q;

    /*
      Every question gets its own
      test cases.
    */

    this.loadTestCases();

    this.code = q.starterCode ||
      q.codeTemplate ||
      this.getCodeTemplate(this.selectedLanguage);

    this.resetResults();

  }

  // ─────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────

  logout(): void {

    this.authService.logout();

    this.router.navigate([
      "/login"
    ]);

  }

}
