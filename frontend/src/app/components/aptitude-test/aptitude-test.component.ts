import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AptitudeService } from '../../services/aptitude.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-aptitude-test',
  templateUrl: './aptitude-test.component.html',
  styleUrls: ['./aptitude-test.component.scss']
})
export class AptitudeTestComponent implements OnInit {
  selectedCategory = 'Quantitative';
  selectedDifficulty = '';
  questionCount = 10;
  questions: any[] = [];
  answers: string[] = [];
  currentQuestionIndex = 0;
  testStarted = false;
  showResults = false;
  loading = false;
  result: any;
  results: any[] = [];
  timeElapsed = 0;
  timer: any;
  user: any;

  constructor(
    private aptitudeService: AptitudeService,
    private authService: AuthService,
    private router: Router
  ) {
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadResults();
  }

  loadResults(): void {
    if (this.user?.id) {
      this.aptitudeService.getResults(this.user.id).subscribe({
        next: (data) => this.results = data,
        error: (err) => console.error(err)
      });
    }
  }

  startTest(): void {
    this.loading = true;
    this.aptitudeService.getQuestions(this.selectedCategory, this.selectedDifficulty, this.questionCount).subscribe({
      next: (data) => {
        this.questions = data;
        this.answers = new Array(data.length);
        this.currentQuestionIndex = 0;
        this.testStarted = true;
        this.timeElapsed = 0;
        this.startTimer();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  startTimer(): void {
    this.timer = setInterval(() => {
      this.timeElapsed++;
    }, 1000);
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  submitTest(): void {
    clearInterval(this.timer);
    const submission = {
      category: this.selectedCategory,
      difficulty: this.selectedDifficulty,
      timeTakenSeconds: this.timeElapsed,
      answers: this.questions.map((q, i) => ({
        questionId: q.id,
        selectedAnswer: this.answers[i] || ''
      }))
    };

    this.aptitudeService.submitTest(submission, this.user.id).subscribe({
      next: (data) => {
        this.result = data;
        this.showResults = true;
        this.testStarted = false;
        this.loadResults();
      },
      error: (err) => console.error(err)
    });
  }

  resetTest(): void {
    this.testStarted = false;
    this.showResults = false;
    this.questions = [];
    this.answers = [];
    this.currentQuestionIndex = 0;
  }

  logout(): void {
    clearInterval(this.timer);
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
