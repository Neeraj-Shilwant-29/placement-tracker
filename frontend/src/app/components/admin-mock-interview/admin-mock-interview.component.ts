import { Component, OnInit } from '@angular/core';
import {
  InterviewSlot,
  MockInterviewService
} from '../../services/mock-interview.service';

@Component({
  selector: 'app-admin-mock-interview',
  templateUrl: './admin-mock-interview.component.html',
  styleUrls: ['./admin-mock-interview.component.scss']
})
export class AdminMockInterviewComponent implements OnInit {
  slots: InterviewSlot[] = [];
  filteredSlots: InterviewSlot[] = [];

  showForm = false;
  editingSlot: InterviewSlot | null = null;
  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  statusFilter = '';
  dateFilter = '';

  form = {
    interviewerId: '',
    interviewerName: '',
    interviewerEmail: '',
    interviewType: 'Technical Mock Interview',
    company: '',
    date: '',
    startTime: '',
    endTime: ''
  };

  constructor(private mockInterviewService: MockInterviewService) {}

  ngOnInit(): void {
    this.setDefaultDateFilter();
    this.loadSlots();
  }

  loadSlots(): void {
    this.loading = true;
    this.clearMessages();

    const date = this.dateFilter || this.toDateInputValue(new Date());

    this.mockInterviewService.getAdminSlots(date).subscribe({
      next: (data) => {
        this.slots = (data || []).map(slot => ({
          ...slot,
          status: String(slot.status || '').toUpperCase()
        }));
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err?.error?.message ||
          'Unable to load interview slots. Please check the backend API.';
      }
    });
  }

  applyFilters(): void {
    const normalizedStatus = this.statusFilter.toUpperCase();

    this.filteredSlots = this.slots
      .filter(slot => !normalizedStatus || String(slot.status).toUpperCase() === normalizedStatus)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }

  openAddForm(): void {
    this.editingSlot = null;
    this.form = {
      interviewerId: '',
      interviewerName: '',
      interviewerEmail: '',
      interviewType: 'Technical Mock Interview',
      company: '',
      date: this.dateFilter || this.toDateInputValue(new Date()),
      startTime: '',
      endTime: ''
    };
    this.showForm = true;
    this.clearMessages();
  }

  editSlot(slot: InterviewSlot): void {
    this.editingSlot = slot;

    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);

    this.form = {
      interviewerId: slot.interviewerId != null ? String(slot.interviewerId) : '',
      interviewerName: slot.interviewerName || '',
      interviewerEmail: '',
      interviewType: slot.interviewType || 'Technical Mock Interview',
      company: slot.company || '',
      date: this.toDateInputValue(start),
      startTime: this.toTimeInputValue(start),
      endTime: this.toTimeInputValue(end)
    };

    this.showForm = true;
    this.clearMessages();
  }

  saveSlot(): void {
    this.clearMessages();

    if (!this.form.date || !this.form.startTime || !this.form.endTime) {
      this.errorMessage = 'Date, start time and end time are required.';
      return;
    }

    if (this.form.endTime <= this.form.startTime) {
      this.errorMessage = 'End time must be after start time.';
      return;
    }

    const startTime = `${this.form.date}T${this.form.startTime}`;
    const endTime = `${this.form.date}T${this.form.endTime}`;

    if (new Date(startTime).getTime() <= Date.now()) {
      this.errorMessage = 'Interview slots must be created in the future.';
      return;
    }

    const payload = {
      interviewerId: this.form.interviewerId ? Number(this.form.interviewerId) : null,
      interviewerName: this.form.interviewerName.trim(),
      interviewerEmail: this.form.interviewerEmail.trim(),
      interviewType: this.form.interviewType.trim() || 'Technical Mock Interview',
      company: this.form.company.trim(),
      startTime,
      endTime,
      status: 'AVAILABLE'
    };

    if (!payload.interviewerName) {
      this.errorMessage = 'Interviewer name is required.';
      return;
    }

    this.saving = true;

    const wasEditing = !!this.editingSlot;
    const request = this.editingSlot
      ? this.mockInterviewService.updateAdminSlot(this.editingSlot.id, payload)
      : this.mockInterviewService.createAdminSlot(payload);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.showForm = false;
        this.editingSlot = null;
        this.successMessage = wasEditing
          ? 'Interview slot updated successfully.'
          : 'Interview slot created successfully.';
        this.loadSlots();
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage =
          err?.status === 409
            ? (err?.error?.message || 'A slot already exists or conflicts with this interviewer.')
            : (err?.error?.message || 'Unable to save the interview slot.');
      }
    });
  }

  cancelEdit(): void {
    this.showForm = false;
    this.editingSlot = null;
    this.clearMessages();
  }

  cancelSlot(slot: InterviewSlot): void {
    if (String(slot.status).toUpperCase() === 'COMPLETED') {
      this.errorMessage = 'Completed interviews cannot be cancelled.';
      return;
    }

    if (!confirm(`Cancel the ${this.formatDateTime(slot.startTime)} interview slot?`)) {
      return;
    }

    this.mockInterviewService.cancelAdminSlot(slot.id).subscribe({
      next: () => {
        this.successMessage = 'Interview slot cancelled successfully.';
        this.loadSlots();
      },
      error: (err) => {
        this.errorMessage =
          err?.error?.message || 'Unable to cancel this interview slot.';
      }
    });
  }

  completeSlot(slot: InterviewSlot): void {
    if (String(slot.status).toUpperCase() !== 'BOOKED') {
      this.errorMessage = 'Only booked interviews can be marked as completed.';
      return;
    }

    this.mockInterviewService.updateAdminSlotStatus(slot.id, 'COMPLETED').subscribe({
      next: () => {
        this.successMessage = 'Interview marked as completed.';
        this.loadSlots();
      },
      error: (err) => {
        this.errorMessage =
          err?.error?.message || 'Unable to update interview status.';
      }
    });
  }

  markNoShow(slot: InterviewSlot): void {
    if (String(slot.status).toUpperCase() !== 'BOOKED') {
      this.errorMessage = 'Only booked interviews can be marked as no-show.';
      return;
    }

    this.mockInterviewService.updateAdminSlotStatus(slot.id, 'NO_SHOW').subscribe({
      next: () => {
        this.successMessage = 'Interview marked as no-show.';
        this.loadSlots();
      },
      error: (err) => {
        this.errorMessage =
          err?.error?.message || 'Unable to update interview status.';
      }
    });
  }

  getTotalCount(): number {
    return this.slots.length;
  }

  getCount(status: string): number {
    return this.slots.filter(
      slot => String(slot.status).toUpperCase() === status
    ).length;
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  formatDateTime(value: string): string {
    const date = new Date(value);
    return date.toLocaleString([], {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatTime(value: string): string {
    return new Date(value).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    return `status-${String(status || '').toLowerCase()}`;
  }

  private setDefaultDateFilter(): void {
    this.dateFilter = this.toDateInputValue(new Date());
  }

  private toDateInputValue(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private toTimeInputValue(value: Date): string {
    const hours = String(value.getHours()).padStart(2, '0');
    const minutes = String(value.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
