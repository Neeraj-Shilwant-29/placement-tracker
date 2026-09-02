import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CodingService } from "../../services/coding.service";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-coding-practice",
  templateUrl: "./coding-practice.component.html",
  styleUrls: ["./coding-practice.component.scss"],
})
export class CodingPracticeComponent implements OnInit {
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

  // ─── RUN / SUBMIT ────────────────────────────────────────

  isRunning = false;
  isSubmitting = false;

  runResult = "";
  resultMessage = "";

  // ─── TEST CASES ──────────────────────────────────────────

  testCases = [
    {
      input: "nums = [2, 7, 11, 15], target = 9",
      expected: "[0, 1]",
      actual: "",
      status: "pending",
    },
    {
      input: "nums = [3, 2, 4], target = 6",
      expected: "[1, 2]",
      actual: "",
      status: "pending",
    },
    {
      input: "nums = [3, 3], target = 6",
      expected: "[0, 1]",
      actual: "",
      status: "pending",
    },
  ];

  passedTestCases = 0;
  totalTestCases = this.testCases.length;

  // ─── TOAST ────────────────────────────────────────────────

  toast = {
    visible: false,
    type: "info",
    title: "",
    message: "",
  };

  private toastTimeout: any;

  constructor(
    private codingService: CodingService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.codingService.getAllQuestions().subscribe({
      next: (data) => {
        this.questions = data;
        this.filteredQuestions = data;
      },
      error: (err) => console.error(err),
    });
  }

  // ─── RESIZE ──────────────────────────────────────────────

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

      // Calculate left panel width as percentage
      let newWidth = ((e.clientX - rect.left) / rect.width) * 100;

      // Minimum 25%, maximum 75%
      newWidth = Math.max(25, Math.min(75, newWidth));

      this.leftWidth = newWidth;
    };

    const onMouseUp = () => {
      this.isResizing = false;

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  // ─── CODE EDITOR ─────────────────────────────────────────

  onCodeChange(code: string): void {
    this.code = code;
  }

  changeLanguage(): void {
    console.log("Language:", this.selectedLanguage);
  }

  // ─── RUN CODE ────────────────────────────────────────────

  runCode(): void {
    // Check if code is empty
    if (!this.code || !this.code.trim()) {
      this.showToast(
        "warning",
        "Code Required",
        "Please write some code before running.",
      );

      return;
    }

    this.isRunning = true;

    this.runResult = "";
    this.resultMessage = "";
    this.passedTestCases = 0;

    // Reset test cases
    this.testCases.forEach((test) => {
      test.status = "pending";
      test.actual = "";
    });

    // Show running popup
    this.showToast(
      "info",
      "Running Code",
      "Your code is being executed...",
    );

    // Temporary simulation
    setTimeout(() => {
      this.testCases.forEach((test) => {
        test.status = "passed";
        test.actual = test.expected;

        this.passedTestCases++;
      });

      this.isRunning = false;

      this.runResult = "success";

      this.resultMessage =
        "Your code executed successfully and passed all test cases.";

      this.showToast(
        "success",
        "Code Executed",
        "All test cases passed successfully.",
      );
    }, 1500);
  }

  // ─── SUBMIT CODE ─────────────────────────────────────────

  submitCode(): void {
    // Check if code is empty
    if (!this.code || !this.code.trim()) {
      this.showToast(
        "warning",
        "Code Required",
        "Please write some code before submitting.",
      );

      return;
    }

    this.isSubmitting = true;

    // Show submitting popup
    this.showToast(
      "info",
      "Submitting Solution",
      "Your solution is being evaluated...",
    );

    // Temporary simulation
    setTimeout(() => {
      this.isSubmitting = false;

      this.runResult = "success";

      this.resultMessage =
        "Accepted! Your solution passed all test cases.";

      this.testCases.forEach((test) => {
        test.status = "passed";
        test.actual = test.expected;
      });

      this.passedTestCases = this.totalTestCases;

      this.showToast(
        "success",
        "Accepted!",
        "Your solution passed all test cases.",
      );
    }, 2000);
  }

  // ─── TOAST ───────────────────────────────────────────────

  showToast(
    type: "success" | "error" | "info" | "warning",
    title: string,
    message: string,
  ): void {
    // Clear previous timeout
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    // Update toast
    this.toast = {
      visible: true,
      type: type,
      title: title,
      message: message,
    };

    // Automatically close after 4 seconds
    this.toastTimeout = setTimeout(() => {
      this.closeToast();
    }, 4000);
  }

  closeToast(): void {
    this.toast.visible = false;

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  // ─── FILTER QUESTIONS ───────────────────────────────────

  filterQuestions(): void {
    this.filteredQuestions = this.questions.filter((q) => {
      const matchDifficulty =
        !this.filterDifficulty || q.difficulty === this.filterDifficulty;

      const matchCategory =
        !this.filterCategory || q.category === this.filterCategory;

      return matchDifficulty && matchCategory;
    });
  }

  // ─── SELECT QUESTION ────────────────────────────────────

  selectQuestion(q: any): void {
    this.selectedQuestion = q;
  }

  // ─── LOGOUT ──────────────────────────────────────────────

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }
}