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

  // Default selected time
  selectedTime: number = 15;

  // 1 minute = 1 question
  questionCount: number = 15;

  // ================= TEST DATA =================

  questions: any[] = [];
  answers: string[] = [];

  currentQuestionIndex = 0;

  testStarted = false;
  showResults = false;
  loading = false;

  // Prevent duplicate submission
  isSubmitting = false;

  result: any;
  results: any[] = [];

  // ================= TIMER =================

  // Total time already used
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

    // Initialize timer according to selected time
    this.setTestConfiguration();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  // ================= TEST CONFIGURATION =================

  setTestConfiguration(): void {

    // Make absolutely sure selectedTime is a number
    this.selectedTime = Number(this.selectedTime);

    // 1 minute = 1 question
    this.questionCount = this.selectedTime;

    // Convert minutes to seconds
    this.timeRemaining = this.selectedTime * 60;

    // Reset elapsed time
    this.timeElapsed = 0;

    console.log(
      'Selected Time:',
      this.selectedTime,
      'minutes'
    );

    console.log(
      'Question Count:',
      this.questionCount
    );

    console.log(
      'Time Remaining:',
      this.timeRemaining,
      'seconds'
    );
  }

  // ================= GRID =================

  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api;
    this.gridApi.sizeColumnsToFit();
  }

  // ================= RESULTS =================

  loadResults(): void {

    if (!this.user?.id) {
      return;
    }

    this.aptitudeService
      .getResults(this.user.id)
      .subscribe({

        next: (data) => {
          this.results = data;
        },

        error: (err) => {
          console.error(
            'Error loading results:',
            err
          );
        }

      });
  }

  // ================= START TEST =================

  startTest(): void {

    if (this.loading || this.isSubmitting) {
      return;
    }

    // Make sure selected time is a number
    this.selectedTime = Number(this.selectedTime);

    /*
     * Configure test.
     *
     * 15 minutes -> 15 questions
     * 30 minutes -> 30 questions
     * 60 minutes -> 60 questions
     */
    this.setTestConfiguration();

    // Stop any previous timer
    this.stopTimer();

    // Reset test data
    this.questions = [];
    this.answers = [];
    this.currentQuestionIndex = 0;

    this.testStarted = false;
    this.showResults = false;
    this.isSubmitting = false;

    this.loading = true;

    console.log('Starting test...');
    console.log('Selected time:', this.selectedTime);
    console.log('Questions:', this.questionCount);
    console.log(
      'Timer:',
      this.formatTime(this.timeRemaining)
    );

    // ================= GET QUESTIONS =================

    this.aptitudeService
      .getQuestions(
        this.selectedCategory,
        this.selectedDifficulty,
        this.questionCount
      )
      .subscribe({

        next: (data) => {

          /*
           * Only use the required number of questions.
           */
          this.questions = data.slice(
            0,
            this.questionCount
          );

          /*
           * Create empty answer array.
           */
          this.answers = new Array(
            this.questions.length
          ).fill('');

          this.currentQuestionIndex = 0;

          /*
           * IMPORTANT:
           * Set timer AGAIN immediately before
           * starting the test.
           */
          this.timeRemaining =
            this.selectedTime * 60;

          this.timeElapsed = 0;

          // Test is now running
          this.testStarted = true;
          this.showResults = false;
          this.loading = false;

          console.log(
            'Test started with timer:',
            this.formatTime(this.timeRemaining)
          );

          // Start timer
          this.startTimer();
        },

        error: (err) => {

          console.error(
            'Error loading questions:',
            err
          );

          this.loading = false;
          this.testStarted = false;

          this.setTestConfiguration();
        }

      });
  }

  // ================= TIMER =================

  startTimer(): void {

    // Stop any existing timer
    this.stopTimer();

    /*
     * Safety check.
     *
     * If somehow timer is 0, initialize it
     * from selectedTime.
     */
    if (
      !this.timeRemaining ||
      this.timeRemaining <= 0
    ) {
      this.timeRemaining =
        Number(this.selectedTime) * 60;
    }

    console.log(
      'TIMER START:',
      this.formatTime(this.timeRemaining)
    );

    /*
     * Run every second.
     */
    this.timer = setInterval(() => {

      // Stop timer if test is no longer active
      if (!this.testStarted) {
        this.stopTimer();
        return;
      }

      // Countdown
      if (this.timeRemaining > 0) {

        this.timeRemaining--;

        this.timeElapsed++;

        console.log(
          'Time remaining:',
          this.formatTime(this.timeRemaining)
        );

        /*
         * Time has reached 00:00.
         * Automatically submit.
         */
        if (this.timeRemaining === 0) {

          console.log(
            'TIME OVER - AUTO SUBMIT'
          );

          this.stopTimer();

          this.submitTest();
        }

      } else {

        // Safety fallback
        this.stopTimer();

        if (this.testStarted) {
          this.submitTest();
        }
      }

    }, 1000);
  }

  // ================= STOP TIMER =================

  stopTimer(): void {

    if (this.timer !== null) {

      clearInterval(this.timer);

      this.timer = null;
    }
  }

  // ================= FORMAT TIMER =================

  formatTime(totalSeconds: number): string {

    if (
      totalSeconds === null ||
      totalSeconds === undefined ||
      isNaN(totalSeconds)
    ) {
      return '00:00';
    }

    const minutes = Math.floor(
      totalSeconds / 60
    );

    const seconds = totalSeconds % 60;

    return (
      minutes
        .toString()
        .padStart(2, '0')
      +
      ':' +
      seconds
        .toString()
        .padStart(2, '0')
    );
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

    /*
     * Prevent duplicate submission.
     */
    if (
      this.isSubmitting ||
      this.questions.length === 0
    ) {
      return;
    }

    this.isSubmitting = true;

    // Stop timer
    this.stopTimer();

    /*
     * Submit ALL questions.
     *
     * Unanswered questions:
     * selectedAnswer = ''
     */
    const submission = {

      category: this.selectedCategory,

      difficulty: this.selectedDifficulty,

      timeTakenSeconds: this.timeElapsed,

      answers: this.questions.map((q, i) => ({

        questionId: q.id,

        selectedAnswer:
          this.answers[i] || ''

      }))
    };

    console.log(
      'Submitting test:',
      submission
    );

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

          this.isSubmitting = false;

          this.loadResults();
        },

        error: (err) => {

          console.error(
            'Error submitting test:',
            err
          );

          this.isSubmitting = false;
        }

      });
  }

  // ================= RESET TEST =================

  resetTest(): void {

    this.stopTimer();

    this.testStarted = false;
    this.showResults = false;
    this.loading = false;
    this.isSubmitting = false;

    this.questions = [];
    this.answers = [];

    this.currentQuestionIndex = 0;

    /*
     * Reset timer according to
     * currently selected time.
     */
    this.setTestConfiguration();
  }

  // ================= LOGOUT =================

  logout(): void {

    this.stopTimer();

    this.authService.logout();

    this.router.navigate(['/login']);
  }
}