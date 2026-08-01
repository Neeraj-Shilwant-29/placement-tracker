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
  form: any = {
    question: '', optionA: '', optionB: '', optionC: '', optionD: '',
    correctAnswer: 'A', category: 'Quantitative', difficulty: 'Easy', explanation: ''
  };

  gridApi!: GridApi;
  defaultColDef: ColDef = { sortable: true, filter: true, resizable: true };
  columnDefs: ColDef[] = [
    {
      headerName: 'Question', field: 'question', flex: 3,
      cellRenderer: (params: any) => {
        const text = params.value || '';
        return text.length > 70 ? text.substring(0, 70) + '...' : text;
      }
    },
    {
      headerName: 'Category', field: 'category', flex: 1,
      cellRenderer: (params: any) => `<span class="badge bg-info">${params.value}</span>`
    },
    {
      headerName: 'Difficulty', field: 'difficulty', flex: 1,
      cellRenderer: (params: any) => {
        const cls = params.value === 'Easy' ? 'bg-success' : params.value === 'Medium' ? 'bg-warning' : 'bg-danger';
        return `<span class="badge ${cls}">${params.value}</span>`;
      }
    },
    { headerName: 'Answer', field: 'correctAnswer', flex: 0.5, cellStyle: { fontWeight: '700' } },
    {
      headerName: 'Actions', field: 'id', flex: 1, sortable: false, filter: false,
      cellRenderer: () => `
        <div class="action-btns">
          <button class="btn btn-sm btn-outline-primary ag-action-btn" data-action="edit"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-outline-danger ag-action-btn" data-action="delete"><i class="fas fa-trash"></i></button>
        </div>`
    }
  ];

  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api;
    this.gridApi.sizeColumnsToFit();
  }

  onCellClicked(event: any): void {
    const target = event.event?.target as HTMLElement;
    const actionBtn = target.closest('[data-action]') as HTMLElement;
    if (!actionBtn) return;
    const action = actionBtn.dataset['action'];
    if (action === 'edit') this.editQuestion(event.data);
    if (action === 'delete') this.deleteQuestion(event.data.id);
  }

  constructor(private aptitudeService: AptitudeService) {}

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.aptitudeService.getAllQuestions().subscribe({
      next: (data) => this.questions = data,
      error: (err) => console.error(err)
    });
  }

  saveQuestion(): void {
    if (this.editingQuestion) {
      this.aptitudeService.updateQuestion(this.editingQuestion.id, this.form).subscribe({
        next: () => { this.loadQuestions(); this.resetForm(); },
        error: (err) => console.error(err)
      });
    } else {
      this.aptitudeService.addQuestion(this.form).subscribe({
        next: () => { this.loadQuestions(); this.resetForm(); },
        error: (err) => console.error(err)
      });
    }
  }

  editQuestion(q: any): void {
    this.editingQuestion = q;
    this.form = { ...q };
    this.showForm = true;
  }

  deleteQuestion(id: number): void {
    if (confirm('Delete this question?')) {
      this.aptitudeService.deleteQuestion(id).subscribe({
        next: () => this.loadQuestions(),
        error: (err) => console.error(err)
      });
    }
  }

  resetForm(): void {
    this.showForm = false;
    this.editingQuestion = null;
    this.form = {
      question: '', optionA: '', optionB: '', optionC: '', optionD: '',
      correctAnswer: 'A', category: 'Quantitative', difficulty: 'Easy', explanation: ''
    };
  }
}
