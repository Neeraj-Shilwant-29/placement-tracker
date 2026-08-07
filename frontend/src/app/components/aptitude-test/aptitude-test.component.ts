import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';
import { AptitudeService } from '../../services/aptitude.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-aptitude-test',
  templateUrl: './aptitude-test.component.html',
  styleUrls: ['./aptitude-test.component.scss']
})
export class AptitudeTestComponent implements OnInit, OnDestroy {

  // ================= TEST CONFIGURATION =================

  selectedCategory = 'Quantitative';
  selectedDifficulty = '';

  // Test duration in minutes
  selectedTime = 15;

  // Number of questions will automatically match selectedTime
  questionCount = 15;

  // ================= TEST DATA =================

  questions: any[] = [];
  answers: string[] = [];

  currentQuestionIndex = 0;

  testStarted = false;
  showResults = false;
  loading = false;

  result: any;
  results: any[] = [];

  // ================= TIMER =================

  timeElapsed = 0;

  // Remaining time in seconds
  timeRemaining = 15 * 60;

  timer: any = null;

  user: any;

  // ================= AG GRID =================

  gridApi!: GridApi;

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  historyColumnDefs: ColDef[] = [
    {
      headerName: 'Category',
      field: 'category',
      flex: 1,
      cellRenderer: (params: any) =>
        `<span class="badge bg-info">${params.value}</span>`
    },

    {
      headerName: 'Marks',
      field: 'marksObtained',
      flex: 1,
      cellStyle: {
        fontWeight: '700',
        color: '#4F46E5'
      }
    },

    {
      headerName: 'Correct',
      field: 'correctAnswers',
      flex: 1
    },

    {
      headerName: 'Total',
      field: 'totalQuestions',
      flex: 1
    },

    {
      headerName: 'Date',
      field: 'attemptedAt',
      flex: 1,
      valueFormatter: (params: any) => {

        if (!params.value) {
          return '';
        }

        return new Date(params.value).toLocaleDateString(
          'en-US',
          {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }
        );
      }
    }
  ];

  // ================= CONSTRUCTOR =================

  constructor(
    private aptitudeService: AptitudeService,
    private authService: AuthService,
    private router: Router
  ) {
    this.user = this.authService.getCurrentUser();
  }

  // ================= LIFECYCLE =================

  ngOnInit(): void {
    this.loadResults();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  // ================= GRID =================

  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api;
    this.gridApi.sizeColumnsToFit();
  }

  // ================= RESULTS =================

  loadResults(): void {

    if (this.user?.id) {

      this.aptitudeService
        .getResults(this.user.id)
        .subscribe({

          next: (data) => {
            this.results = data;
          },

          error: (err) => {
            console.error('Error loading results:', err);
          }

        });
    }
  }

  // ================= START TEST =================

  startTest(): void {

    this.loading = true;

    /*
     * Number of questions is automatically based
     * on selected test duration.
     *
     * 15 minutes = 15 questions
     * 30 minutes = 30 questions
     * 60 minutes = 60 questions
     */

    this.questionCount = this.selectedTime;

    // Convert minutes to seconds
    this.timeRemaining = this.selectedTime * 60;

    // Reset elapsed time
    this.timeElapsed = 0;

    // Stop any old timer
    this.stopTimer();

    this.aptitudeService
      .getQuestions(
        this.selectedCategory,
        this.selectedDifficulty,
        this.questionCount
      )
      .subscribe({

        next: (data) => {

          this.questions = data;

          this.answers = new Array(this.questions.length);

          this.currentQuestionIndex = 0;

          this.testStarted = true;
          this.showResults = false;

          this.loading = false;

          // Start countdown timer
          this.startTimer();
        },

        error: (err) => {

          console.error('Error loading questions:', err);

          this.loading = false;
        }

      });
  }

  // ================= TIMER =================

  startTimer(): void {

    // Make sure only one timer is running
    this.stopTimer();

    this.timer = setInterval(() => {

      if (this.timeRemaining > 0) {

        this.timeRemaining--;

        this.timeElapsed++;

      } else {

        // Time is over
        this.stopTimer();

        // Automatically submit the test
        if (this.testStarted) {
          this.submitTest();
        }
      }

    }, 1000);
  }

  stopTimer(): void {

    if (this.timer !== null) {

      clearInterval(this.timer);

      this.timer = null;
    }
  }

  // ================= FORMAT TIMER =================

  formatTime(totalSeconds: number): string {

    // Prevent NaN / invalid timer values
    if (
      totalSeconds === null ||
      totalSeconds === undefined ||
      isNaN(totalSeconds)
    ) {
      return '00:00';
    }

    const minutes = Math.floor(totalSeconds / 60);

    const seconds = totalSeconds % 60;

    return `${minutes
      .toString()
      .padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  // ================= NEXT QUESTION =================

  nextQuestion(): void {

    if (
      this.currentQuestionIndex <
      this.questions.length - 1
    ) {

      this.currentQuestionIndex++;
    }
  }

  // ================= PREVIOUS QUESTION =================

  previousQuestion(): void {

    if (this.currentQuestionIndex > 0) {

      this.currentQuestionIndex--;
    }
  }

  // ================= SUBMIT TEST =================

  submitTest(): void {

    // Prevent multiple submissions
    if (!this.testStarted && !this.questions.length) {
      return;
    }

    this.stopTimer();

    const submission = {

      category: this.selectedCategory,

      difficulty: this.selectedDifficulty,

      timeTakenSeconds: this.timeElapsed,

      answers: this.questions.map((q, i) => ({

        questionId: q.id,

        selectedAnswer: this.answers[i] || ''

      }))
    };

    this.aptitudeService
      .submitTest(
        submission,
        this.user.id
      )
      .subscribe({

        next: (data) => {

          this.result = data;

          this.showResults = true;

          this.testStarted = false;

          this.loadResults();
        },

        error: (err) => {

          console.error(
            'Error submitting test:',
            err
          );

        }

      });
  }

  // ================= RESET TEST =================

  resetTest(): void {

    this.stopTimer();

    this.testStarted = false;

    this.showResults = false;

    this.questions = [];

    this.answers = [];

    this.currentQuestionIndex = 0;

    this.timeElapsed = 0;

    // Reset timer to currently selected duration
    this.timeRemaining = this.selectedTime * 60;

    this.questionCount = this.selectedTime;
  }

  // ================= LOGOUT =================

  logout(): void {

    this.stopTimer();

    this.authService.logout();

    this.router.navigate(['/login']);
  }
}