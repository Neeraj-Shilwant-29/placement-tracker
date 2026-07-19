import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CodingService } from '../../services/coding.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-coding-practice',
  templateUrl: './coding-practice.component.html',
  styleUrls: ['./coding-practice.component.scss']
})
export class CodingPracticeComponent implements OnInit {
  questions: any[] = [];
  filteredQuestions: any[] = [];
  selectedQuestion: any = null;
  filterDifficulty = '';
  filterCategory = '';

  constructor(
    private codingService: CodingService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.codingService.getAllQuestions().subscribe({
      next: (data) => {
        this.questions = data;
        this.filteredQuestions = data;
      },
      error: (err) => console.error(err)
    });
  }

  filterQuestions(): void {
    this.filteredQuestions = this.questions.filter(q => {
      const matchDifficulty = !this.filterDifficulty || q.difficulty === this.filterDifficulty;
      const matchCategory = !this.filterCategory || q.category === this.filterCategory;
      return matchDifficulty && matchCategory;
    });
  }

  selectQuestion(q: any): void {
    this.selectedQuestion = q;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
