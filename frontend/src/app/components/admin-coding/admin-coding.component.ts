import { Component, OnInit } from '@angular/core';
import { ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';
import { CodingService } from '../../services/coding.service';

@Component({
  selector: 'app-admin-coding',
  templateUrl: './admin-coding.component.html',
  styleUrls: ['./admin-coding.component.scss']
})
export class AdminCodingComponent implements OnInit {
  questions: any[] = [];
  showForm = false;
  editingQuestion: any = null;
  form: any = {
    title: '', description: '', category: '', difficulty: 'Easy',
    sampleInput: '', sampleOutput: '', constraints: ''
  };

  gridApi!: GridApi;
  defaultColDef: ColDef = { sortable: true, filter: true, resizable: true };
  columnDefs: ColDef[] = [
    { headerName: 'Title', field: 'title', flex: 2, cellStyle: { fontWeight: '600' } },
    {
      headerName: 'Category', field: 'category', flex: 1,
      cellRenderer: (params: any) => params.value ? `<span class="badge bg-info">${params.value}</span>` : ''
    },
    {
      headerName: 'Difficulty', field: 'difficulty', flex: 1,
      cellRenderer: (params: any) => {
        const cls = params.value === 'Easy' ? 'bg-success' : params.value === 'Medium' ? 'bg-warning' : 'bg-danger';
        return `<span class="badge ${cls}">${params.value}</span>`;
      }
    },
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

  constructor(private codingService: CodingService) {}

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.codingService.getAllQuestions().subscribe({
      next: (data) => this.questions = data,
      error: (err) => console.error(err)
    });
  }

  saveQuestion(): void {
    if (this.editingQuestion) {
      this.codingService.updateQuestion(this.editingQuestion.id, this.form).subscribe({
        next: () => { this.loadQuestions(); this.resetForm(); },
        error: (err) => console.error(err)
      });
    } else {
      this.codingService.addQuestion(this.form).subscribe({
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
    if (confirm('Delete this coding question?')) {
      this.codingService.deleteQuestion(id).subscribe({
        next: () => this.loadQuestions(),
        error: (err) => console.error(err)
      });
    }
  }

  resetForm(): void {
    this.showForm = false;
    this.editingQuestion = null;
    this.form = {
      title: '', description: '', category: '', difficulty: 'Easy',
      sampleInput: '', sampleOutput: '', constraints: ''
    };
  }
}
