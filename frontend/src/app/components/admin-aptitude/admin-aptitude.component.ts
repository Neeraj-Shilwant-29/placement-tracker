import { Component, OnInit } from '@angular/core';
import { ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';
import { AptitudeService } from '../../services/aptitude.service';

@Component({
  selector: 'app-admin-aptitude',
  templateUrl: './admin-aptitude.component.html',
  styleUrls: ['./admin-aptitude.component.scss']
})
export class AdminAptitudeComponent implements OnInit {

  questions: any[] = [];

  showForm = false;
  editingQuestion: any = null;

  successMessage = '';
  errorMessage = '';
  saving = false;

  form: any = {
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    category: 'Quantitative',
    difficulty: 'Easy',
    explanation: ''
  };

  gridApi!: GridApi;

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  columnDefs: ColDef[] = [

    {
      headerName: 'Question',
      field: 'question',
      flex: 3,
      cellRenderer: (params: any) => {
        const text = params.value || '';

        return text.length > 70
          ? text.substring(0, 70) + '...'
          : text;
      }
    },

    {
      headerName: 'Category',
      field: 'category',
      flex: 1,
      cellRenderer: (params: any) =>
        `<span class="badge bg-info">${params.value}</span>`
    },

    {
      headerName: 'Difficulty',
      field: 'difficulty',
      flex: 1,
      cellRenderer: (params: any) => {

        const cls =
          params.value === 'Easy'
            ? 'bg-success'
            : params.value === 'Medium'
              ? 'bg-warning'
              : 'bg-danger';

        return `
          <span class="badge ${cls}">
            ${params.value}
          </span>
        `;
      }
    },

    {
      headerName: 'Answer',
      field: 'correctAnswer',
      flex: 0.5,
      cellStyle: {
        fontWeight: '700'
      }
    },

    {
      headerName: 'Actions',
      field: 'id',
      flex: 1,
      sortable: false,
      filter: false,

      cellRenderer: () => `
        <div class="action-btns">

          <button
            type="button"
            class="btn btn-sm btn-outline-primary ag-action-btn"
            data-action="edit">
            <i class="fas fa-edit"></i>
          </button>

          <button
            type="button"
            class="btn btn-sm btn-outline-danger ag-action-btn"
            data-action="delete">
            <i class="fas fa-trash"></i>
          </button>

        </div>
      `
    }

  ];

  constructor(
    private aptitudeService: AptitudeService
  ) {}

  ngOnInit(): void {
    this.loadQuestions();
  }

  // ==========================================
  // LOAD QUESTIONS
  // ==========================================

  loadQuestions(): void {

    this.aptitudeService.getAllQuestions().subscribe({

      next: (data: any[]) => {

        console.log('Questions loaded:', data);

        this.questions = data || [];

      },

      error: (err) => {

        console.error('Error loading questions:', err);

        this.errorMessage =
          err?.error?.message ||
          'Failed to load aptitude questions.';

      }

    });
  }

  // ==========================================
  // AG GRID
  // ==========================================

  onGridReady(event: GridReadyEvent): void {

    this.gridApi = event.api;

    setTimeout(() => {
      this.gridApi.sizeColumnsToFit();
    });
  }

  onCellClicked(event: any): void {

    const target = event.event?.target as HTMLElement;

    if (!target) {
      return;
    }

    const actionBtn =
      target.closest('[data-action]') as HTMLElement;

    if (!actionBtn) {
      return;
    }

    const action = actionBtn.dataset['action'];

    if (action === 'edit') {
      this.editQuestion(event.data);
    }

    if (action === 'delete') {
      this.deleteQuestion(event.data.id);
    }
  }

  // ==========================================
  // OPEN ADD FORM
  // ==========================================

  openAddForm(): void {

    this.editingQuestion = null;

    this.form = {
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      category: 'Quantitative',
      difficulty: 'Easy',
      explanation: ''
    };

    this.errorMessage = '';
    this.successMessage = '';

    this.showForm = true;
  }

  // ==========================================
  // SAVE / UPDATE QUESTION
  // ==========================================

  saveQuestion(): void {

    console.log('Save button clicked');

    console.log('Form data:', this.form);

    this.errorMessage = '';
    this.successMessage = '';

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (!this.form.question?.trim()) {
      this.errorMessage = 'Please enter the question.';
      return;
    }

    if (!this.form.optionA?.trim()) {
      this.errorMessage = 'Please enter Option A.';
      return;
    }

    if (!this.form.optionB?.trim()) {
      this.errorMessage = 'Please enter Option B.';
      return;
    }

    if (!this.form.optionC?.trim()) {
      this.errorMessage = 'Please enter Option C.';
      return;
    }

    if (!this.form.optionD?.trim()) {
      this.errorMessage = 'Please enter Option D.';
      return;
    }

    if (!this.form.correctAnswer) {
      this.errorMessage = 'Please select the correct answer.';
      return;
    }

    if (!this.form.category) {
      this.errorMessage = 'Please select a category.';
      return;
    }

    if (!this.form.difficulty) {
      this.errorMessage = 'Please select difficulty.';
      return;
    }

    // -----------------------------
    // PREVENT DOUBLE CLICK
    // -----------------------------

    if (this.saving) {
      return;
    }

    this.saving = true;

    // -----------------------------
    // PAYLOAD
    // -----------------------------

    const payload = {
      question: this.form.question.trim(),

      optionA: this.form.optionA.trim(),
      optionB: this.form.optionB.trim(),
      optionC: this.form.optionC.trim(),
      optionD: this.form.optionD.trim(),

      correctAnswer: this.form.correctAnswer,

      category: this.form.category,

      difficulty: this.form.difficulty,

      explanation: this.form.explanation?.trim() || ''
    };

    console.log('Sending payload to backend:', payload);

    // ==========================================
    // UPDATE
    // ==========================================

    if (this.editingQuestion?.id) {

      console.log(
        'Updating question:',
        this.editingQuestion.id
      );

      this.aptitudeService
        .updateQuestion(
          this.editingQuestion.id,
          payload
        )
        .subscribe({

          next: (response) => {

            console.log(
              'Question updated successfully:',
              response
            );

            this.saving = false;

            this.loadQuestions();

            this.resetForm();

            this.showSuccess(
              'Aptitude question updated successfully!'
            );
          },

          error: (err) => {

            console.error(
              'Error updating question:',
              err
            );

            this.saving = false;

            this.showError(
              err?.error?.message ||
              'Failed to update question.'
            );
          }

        });

      return;
    }

    // ==========================================
    // ADD NEW QUESTION
    // ==========================================

    console.log('Adding new question...');

    this.aptitudeService
      .addQuestion(payload)
      .subscribe({

        next: (response) => {

          console.log(
            'Question added successfully:',
            response
          );

          this.saving = false;

          // Reload from database
          this.loadQuestions();

          // Close form
          this.resetForm();

          // Success message
          this.showSuccess(
            'Aptitude question added successfully!'
          );
        },

        error: (err) => {

          console.error(
            'Error adding question:',
            err
          );

          this.saving = false;

          console.error(
            'Backend error:',
            err?.error
          );

          this.showError(
            err?.error?.message ||
            err?.error ||
            'Failed to add aptitude question.'
          );
        }

      });
  }

  // ==========================================
  // EDIT QUESTION
  // ==========================================

  editQuestion(question: any): void {

    console.log('Editing question:', question);

    this.editingQuestion = question;

    this.form = {
      question: question.question || '',

      optionA: question.optionA || '',
      optionB: question.optionB || '',
      optionC: question.optionC || '',
      optionD: question.optionD || '',

      correctAnswer: question.correctAnswer || 'A',

      category: question.category || 'Quantitative',

      difficulty: question.difficulty || 'Easy',

      explanation: question.explanation || ''
    };

    this.errorMessage = '';
    this.successMessage = '';

    this.showForm = true;
  }

  // ==========================================
  // DELETE QUESTION
  // ==========================================

  deleteQuestion(id: number): void {

    if (!id) {
      return;
    }

    if (!confirm('Delete this question?')) {
      return;
    }

    this.aptitudeService
      .deleteQuestion(id)
      .subscribe({

        next: () => {

          console.log(
            'Question deleted successfully'
          );

          this.loadQuestions();

          this.showSuccess(
            'Aptitude question deleted successfully!'
          );
        },

        error: (err) => {

          console.error(
            'Error deleting question:',
            err
          );

          this.showError(
            err?.error?.message ||
            'Failed to delete question.'
          );
        }

      });
  }

  // ==========================================
  // SUCCESS MESSAGE
  // ==========================================

  showSuccess(message: string): void {

    this.successMessage = message;

    this.errorMessage = '';

    setTimeout(() => {

      this.successMessage = '';

    }, 3000);
  }

  // ==========================================
  // ERROR MESSAGE
  // ==========================================

  showError(message: string): void {

    this.errorMessage = message;

    this.successMessage = '';

    setTimeout(() => {

      this.errorMessage = '';

    }, 5000);
  }

  // ==========================================
  // RESET FORM
  // ==========================================

  resetForm(): void {

    this.showForm = false;

    this.editingQuestion = null;

    this.saving = false;

    this.errorMessage = '';

    this.form = {

      question: '',

      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',

      correctAnswer: 'A',

      category: 'Quantitative',

      difficulty: 'Easy',

      explanation: ''
    };
  }

}