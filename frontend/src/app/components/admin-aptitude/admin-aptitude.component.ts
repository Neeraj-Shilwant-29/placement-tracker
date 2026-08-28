import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';
import { AptitudeService } from '../../services/aptitude.service';

@Component({
  selector: 'app-admin-aptitude',
  templateUrl: './admin-aptitude.component.html',
  styleUrls: ['./admin-aptitude.component.scss']
})
export class AdminAptitudeComponent implements OnInit {

  questions: any[] = [];
  
  quantitativeTopics: string[] = [
  'Number System',
  'Percentage',
  'Profit and Loss',
  'Ratio and Proportion',
  'Average',
  'Time and Work',
  'Time, Speed and Distance'
];

logicalTopics: string[] = [
  'Number Series',
  'Coding-Decoding',
  'Blood Relations',
  'Direction Sense',
  'Logical Puzzles',
  'Syllogism'
];

availableTopics: string[] = [];

  showForm = false;
  editingQuestion: any = null;

  successMessage = '';
  errorMessage = '';
  saving = false;

  form: FormGroup;

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
    private aptitudeService: AptitudeService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      question: ['', Validators.required],
      optionA: ['', Validators.required],
      optionB: ['', Validators.required],
      optionC: ['', Validators.required],
      optionD: ['', Validators.required],
      correctAnswer: ['A', Validators.required],
      category: ['', Validators.required],
      topic: ['', Validators.required],
      difficulty: ['Easy', Validators.required],
      explanation: ['']
    });
  }

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

    this.form.reset({
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      category: 'Quantitative',
      topic: '',
      difficulty: 'Easy',
      explanation: ''
    });

    this.availableTopics = this.quantitativeTopics;
    this.errorMessage = '';
    this.successMessage = '';

    this.showForm = true;
  }

  // ==========================================
  // SAVE / UPDATE QUESTION
  // ==========================================

  saveQuestion(): void {

    console.log('Save button clicked');

    this.form.markAllAsTouched();

    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.errorMessage = 'Please fill all required fields.';
      return;
    }

    if (this.saving) {
      return;
    }

    this.saving = true;

    const f = this.form.value;
    const payload = {
      question: f.question.trim(),
      optionA: f.optionA.trim(),
      optionB: f.optionB.trim(),
      optionC: f.optionC.trim(),
      optionD: f.optionD.trim(),
      correctAnswer: f.correctAnswer,
      category: f.category,
      topic: f.topic,
      difficulty: f.difficulty,
      explanation: f.explanation?.trim() || ''
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

    const category = question.category || 'Quantitative';
    this.onChangeCategory(category);

    this.form.reset({
      question: question.question || '',
      optionA: question.optionA || '',
      optionB: question.optionB || '',
      optionC: question.optionC || '',
      optionD: question.optionD || '',
      correctAnswer: question.correctAnswer || 'A',
      category: category,
      topic: question.topic || '',
      difficulty: question.difficulty || 'Easy',
      explanation: question.explanation || ''
    });

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

  onChangeCategory(category: string): void {

  if (category === 'Quantitative') {
    this.availableTopics = this.quantitativeTopics;
  }
  else if (category === 'Logical') {
    this.availableTopics = this.logicalTopics;
  }
  else {
    this.availableTopics = [];
  }

  this.form.get('topic')?.setValue('');

  console.log('Available Topics:', this.availableTopics);
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

    this.form.reset({
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      category: 'Quantitative',
      topic: '',
      difficulty: 'Easy',
      explanation: ''
    });

    this.availableTopics = this.quantitativeTopics;
  }

}