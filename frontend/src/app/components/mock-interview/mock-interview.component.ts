import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  InterviewBooking,
  InterviewSlot,
  MockInterviewService
} from '../../services/mock-interview.service';
import { AuthService } from '../../services/auth.service';

interface CalendarDay {
  date: Date;
  key: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
}

@Component({
  selector: 'app-mock-interview',
  templateUrl: './mock-interview.component.html',
  styleUrls: ['./mock-interview.component.scss']
})
export class MockInterviewComponent implements OnInit {
  user: any;

  // Calendar
  currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  selectedDate = new Date();
  calendarDays: CalendarDay[] = [];
  selectedDateKey = '';

  // Slot / booking data
  slots: InterviewSlot[] = [];
  selectedDaySlots: InterviewSlot[] = [];
  bookings: InterviewBooking[] = [];

  loadingCalendar = false;
  loadingBookings = false;
  bookingSlotId: number | null = null;
  cancellingBookingId: number | null = null;
  reschedulingBookingId: number | null = null;
  error = '';
  successMessage = '';

  // Keep the existing interview-record data available as history.
  interviews: any[] = [];
  loadingHistory = false;
  showHistory = false;
  searchTerm = '';
  statusFilter = '';
  typeFilter = '';
  filteredInterviews: any[] = [];

  constructor(
    private interviewService: MockInterviewService,
    private authService: AuthService,
    private router: Router
  ) {
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.buildCalendar();
    this.loadCalendarSlots();
    this.loadMyBookings();
    this.loadInterviewHistory();
  }

  // ─────────────────────────────────────────────
  // CALENDAR
  // ─────────────────────────────────────────────

  buildCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    // Start from Sunday of the week containing the first of the month.
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();

    // Six rows keeps the calendar layout stable.
    const gridStart = new Date(year, month, 1 - startOffset);

    this.calendarDays = [];

    for (let i = 0; i < 42; i++) {
      const date = new Date(
        gridStart.getFullYear(),
        gridStart.getMonth(),
        gridStart.getDate() + i
      );

      const key = this.toDateKey(date);

      this.calendarDays.push({
        date,
        key,
        dayNumber: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: key === this.toDateKey(new Date()),
        isPast: this.isBeforeToday(date)
      });
    }

    if (!this.isSameMonth(this.selectedDate, this.currentMonth)) {
      const today = new Date();
      this.selectedDate =
        this.isSameMonth(today, this.currentMonth)
          ? today
          : new Date(year, month, 1);
    }

    this.selectedDateKey = this.toDateKey(this.selectedDate);
    this.updateSelectedDaySlots();
  }

  previousMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1,
      1
    );

    this.buildCalendar();
    this.loadCalendarSlots();
  }

  nextMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      1
    );

    this.buildCalendar();
    this.loadCalendarSlots();
  }

  goToToday(): void {
    const today = new Date();

    this.currentMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    this.selectedDate = today;

    this.buildCalendar();
    this.loadCalendarSlots();
  }

  selectDate(day: CalendarDay): void {
    if (!day.isCurrentMonth) {
      this.currentMonth = new Date(
        day.date.getFullYear(),
        day.date.getMonth(),
        1
      );

      this.buildCalendar();
      this.loadCalendarSlots();
      return;
    }

    this.selectedDate = new Date(day.date);
    this.selectedDateKey = day.key;
    this.updateSelectedDaySlots();
    this.clearMessages();
  }

  loadCalendarSlots(): void {
    this.loadingCalendar = true;
    this.error = '';

    const startDate = this.toDateKey(
      new Date(
        this.currentMonth.getFullYear(),
        this.currentMonth.getMonth(),
        1
      )
    );

    const endDate = this.toDateKey(
      new Date(
        this.currentMonth.getFullYear(),
        this.currentMonth.getMonth() + 1,
        0
      )
    );

    this.interviewService.getSlots(startDate, endDate).subscribe({
      next: (data) => {
        this.slots = (data || []).map(slot => ({
          ...slot,
          status: String(slot.status || '').toUpperCase()
        }));

        this.loadingCalendar = false;
        this.updateSelectedDaySlots();
      },
      error: (err) => {
        this.loadingCalendar = false;
        this.error =
          err?.error?.message ||
          'Unable to load interview slots. Please try again.';
      }
    });
  }

  updateSelectedDaySlots(): void {
    const key = this.selectedDateKey;

    this.selectedDaySlots = this.slots
      .filter(slot => this.toDateKey(new Date(slot.startTime)) === key)
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() -
          new Date(b.startTime).getTime()
      );
  }

  getSlotsForDate(day: CalendarDay): InterviewSlot[] {
    return this.slots.filter(
      slot => this.toDateKey(new Date(slot.startTime)) === day.key
    );
  }

  getAvailableCount(day: CalendarDay): number {
    return this.getSlotsForDate(day).filter(
      slot => String(slot.status).toUpperCase() === 'AVAILABLE' &&
        !this.isSlotInPast(slot)
    ).length;
  }

  getBookedCount(day: CalendarDay): number {
    return this.getSlotsForDate(day).filter(
      slot => String(slot.status).toUpperCase() === 'BOOKED'
    ).length;
  }

  // ─────────────────────────────────────────────
  // BOOKING
  // ─────────────────────────────────────────────

  bookSlot(slot: InterviewSlot): void {
    const status = String(slot.status).toUpperCase();

    if (status !== 'AVAILABLE') {
      this.showError('This slot is no longer available.');
      return;
    }

    if (this.isSlotInPast(slot)) {
      this.showError('Past interview slots cannot be booked.');
      return;
    }

    if (this.hasOverlappingBooking(slot)) {
      this.showError(
        'You already have another interview at an overlapping time.'
      );
      return;
    }

    const confirmed = confirm(
      `Book ${this.formatDateTime(slot.startTime)} with ` +
      `${slot.interviewerName || 'the interviewer'}?`
    );

    if (!confirmed) {
      return;
    }

    this.bookingSlotId = slot.id;
    this.clearMessages();

    this.interviewService.bookSlot(slot.id).subscribe({
      next: (booking) => {
        this.bookingSlotId = null;
        this.successMessage =
          'Interview booked successfully. Your Google Meet link is ready.';

        // Backend is the source of truth. Refresh both collections.
        this.loadCalendarSlots();
        this.loadMyBookings();

        // Scroll to booking area after success.
        setTimeout(() => {
          document
            .getElementById('my-interviews')
            ?.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
        }, 100);

        // Keep the result available in dev tools if needed.
        console.info('Booking created:', booking);
      },
      error: (err) => {
        this.bookingSlotId = null;

        if (err?.status === 409) {
          this.showError(
            err?.error?.message ||
            'Sorry, this slot has already been booked by another user.'
          );

          // Refresh immediately because another user may have taken it.
          this.loadCalendarSlots();
          this.loadMyBookings();
          return;
        }

        this.showError(
          err?.error?.message ||
          'Unable to book this slot. Please try again.'
        );
      }
    });
  }

  cancelBooking(booking: InterviewBooking): void {
    if (String(booking.status).toUpperCase() !== 'CONFIRMED') {
      this.showError('Only confirmed bookings can be cancelled.');
      return;
    }

    const confirmed = confirm(
      `Cancel your interview on ${this.formatDateTime(booking.startTime)}?`
    );

    if (!confirmed) {
      return;
    }

    this.cancellingBookingId = booking.id;
    this.clearMessages();

    this.interviewService.cancelBooking(booking.id).subscribe({
      next: () => {
        this.cancellingBookingId = null;
        this.successMessage =
          'Interview cancelled successfully.';
        this.loadCalendarSlots();
        this.loadMyBookings();
      },
      error: (err) => {
        this.cancellingBookingId = null;
        this.showError(
          err?.error?.message ||
          'Unable to cancel the interview.'
        );
      }
    });
  }

  rescheduleBooking(booking: InterviewBooking): void {
    const availableSlots = this.slots.filter(slot =>
      String(slot.status).toUpperCase() === 'AVAILABLE' &&
      !this.isSlotInPast(slot) &&
      !this.hasOverlappingBooking(slot, booking.id)
    );

    if (!availableSlots.length) {
      this.showError(
        'No alternative interview slots are currently available.'
      );
      return;
    }

    const choices = availableSlots
      .slice(0, 20)
      .map(
        (slot, index) =>
          `${index + 1}. ${this.formatDateTime(slot.startTime)} - ` +
          `${this.formatTime(slot.endTime)} | ` +
          `${slot.interviewerName || 'Interviewer'}`
      )
      .join('\\n');

    const answer = prompt(
      `Choose a new slot by number:\n\n${choices}`
    );

    if (!answer) {
      return;
    }

    const index = Number(answer) - 1;

    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= Math.min(20, availableSlots.length)
    ) {
      this.showError('Please enter a valid slot number.');
      return;
    }

    const newSlot = availableSlots[index];

    this.reschedulingBookingId = booking.id;
    this.clearMessages();

    this.interviewService
      .rescheduleBooking(booking.id, newSlot.id)
      .subscribe({
        next: () => {
          this.reschedulingBookingId = null;
          this.successMessage =
            'Interview rescheduled successfully.';
          this.loadCalendarSlots();
          this.loadMyBookings();
        },
        error: (err) => {
          this.reschedulingBookingId = null;

          if (err?.status === 409) {
            this.showError(
              err?.error?.message ||
              'That slot has just been booked by another user.'
            );

            this.loadCalendarSlots();
            this.loadMyBookings();
            return;
          }

          this.showError(
            err?.error?.message ||
            'Unable to reschedule the interview.'
          );
        }
      });
  }

  loadMyBookings(): void {
    this.loadingBookings = true;

    this.interviewService.getMyBookings().subscribe({
      next: (data) => {
        this.bookings = (data || []).sort(
          (a, b) =>
            new Date(a.startTime).getTime() -
            new Date(b.startTime).getTime()
        );

        this.loadingBookings = false;
      },
      error: (err) => {
        this.loadingBookings = false;
        this.error =
          err?.error?.message ||
          'Unable to load your interview bookings.';
      }
    });
  }

  get upcomingBookings(): InterviewBooking[] {
    const now = Date.now();

    return this.bookings.filter(
      booking =>
        String(booking.status).toUpperCase() === 'CONFIRMED' &&
        new Date(booking.endTime).getTime() >= now
    );
  }

  get pastBookings(): InterviewBooking[] {
    return this.bookings.filter(
      booking =>
        String(booking.status).toUpperCase() !== 'CONFIRMED' ||
        new Date(booking.endTime).getTime() < Date.now()
    );
  }

  // ─────────────────────────────────────────────
  // HISTORY / EXISTING RECORDS
  // ─────────────────────────────────────────────

  loadInterviewHistory(): void {
    if (!this.user?.id) {
      return;
    }

    this.loadingHistory = true;

    this.interviewService.getStudentInterviews(this.user.id).subscribe({
      next: (data) => {
        this.interviews = data || [];
        this.filteredInterviews = this.interviews;
        this.loadingHistory = false;
      },
      error: () => {
        // Booking functionality should not fail just because history fails.
        this.loadingHistory = false;
      }
    });
  }

  filterInterviews(): void {
    const search = this.searchTerm.trim().toLowerCase();

    this.filteredInterviews = this.interviews.filter(interview => {
      const searchable =
        `${interview.interviewType || ''} ` +
        `${interview.company || ''} ` +
        `${interview.interviewerName || ''}`.toLowerCase();

      return (
        (!search || searchable.includes(search)) &&
        (!this.statusFilter || interview.status === this.statusFilter) &&
        (!this.typeFilter || interview.interviewType === this.typeFilter)
      );
    });
  }

  get averageScore(): number {
    if (!this.interviews.length) {
      return 0;
    }

    return Math.round(
      this.interviews.reduce(
        (total, interview) =>
          total + Number(interview.overallScore || 0),
        0
      ) / this.interviews.length
    );
  }

  get completedCount(): number {
    return this.interviews.filter(
      interview => interview.status === 'Completed'
    ).length;
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'linear-gradient(135deg, #10B981, #059669)';
    if (score >= 60) return 'linear-gradient(135deg, #3B82F6, #2563EB)';
    if (score >= 40) return 'linear-gradient(135deg, #F59E0B, #D97706)';
    return 'linear-gradient(135deg, #EF4444, #DC2626)';
  }

  // ─────────────────────────────────────────────
  // EXISTING PERFORMANCE RECORD MANAGEMENT
  // ─────────────────────────────────────────────

  openCreateForm(): void {
    this.showHistory = true;
    this.editingInterview = null;
    this.resetForm();
    this.error = '';
    this.historyFormOpen = true;
  }

  editingInterview: any = null;
  newInterview: any = {
    interviewType: 'Technical',
    technicalScore: 0,
    aptitudeScore: 0,
    communicationScore: 0,
    status: 'Completed',
    feedback: '',
    interviewerName: '',
    company: ''
  };

  get showForm(): boolean {
    return !!this.editingInterview || this.historyFormOpen;
  }

  set showForm(value: boolean) {
    this.historyFormOpen = value;
  }

  historyFormOpen = false;

  editInterview(interview: any): void {
    this.showHistory = true;
    this.editingInterview = interview;
    this.newInterview = {
      interviewType: interview.interviewType,
      technicalScore: interview.technicalScore,
      aptitudeScore: interview.aptitudeScore,
      communicationScore: interview.communicationScore,
      status: interview.status,
      feedback: interview.feedback || '',
      interviewerName: interview.interviewerName || '',
      company: interview.company || ''
    };
    this.error = '';
    this.historyFormOpen = true;
  }

  cancelForm(): void {
    this.historyFormOpen = false;
    this.editingInterview = null;
    this.resetForm();
    this.error = '';
  }

  isFormValid(): boolean {
    const scores = [
      this.newInterview.technicalScore,
      this.newInterview.aptitudeScore,
      this.newInterview.communicationScore
    ];

    return !!this.newInterview.interviewType &&
      !!this.newInterview.status &&
      scores.every(
        score =>
          Number.isFinite(Number(score)) &&
          Number(score) >= 0 &&
          Number(score) <= 100
      );
  }

  get liveOverallScore(): number {
    const scores = [
      this.newInterview.technicalScore,
      this.newInterview.aptitudeScore,
      this.newInterview.communicationScore
    ].map(score => Number(score) || 0);

    return Math.round(
      (scores[0] + scores[1] + scores[2]) / 3
    );
  }

  saveInterview(): void {
    if (!this.isFormValid()) {
      this.error =
        'Choose an interview type and status, and enter scores from 0 to 100.';
      return;
    }

    if (!this.user?.id) {
      this.error = 'Please login again before saving an interview record.';
      return;
    }

    this.loadingHistory = true;
    this.error = '';

    const request = {
      ...this.newInterview,
      technicalScore: Number(this.newInterview.technicalScore),
      aptitudeScore: Number(this.newInterview.aptitudeScore),
      communicationScore: Number(this.newInterview.communicationScore)
    };

    const operation = this.editingInterview
      ? this.interviewService.updateInterview(
          this.editingInterview.id,
          request
        )
      : this.interviewService.addInterview(
          request,
          this.user.id
        );

    operation.subscribe({
      next: () => {
        this.loadingHistory = false;
        this.cancelForm();
        this.loadInterviewHistory();
      },
      error: err => {
        this.loadingHistory = false;
        this.error =
          err?.error?.message ||
          'Unable to save interview record.';
      }
    });
  }

  deleteInterview(id: number): void {
    if (!confirm('Are you sure you want to delete this record?')) {
      return;
    }

    this.error = '';

    this.interviewService.deleteInterview(id).subscribe({
      next: () => this.loadInterviewHistory(),
      error: err => {
        this.error =
          err?.error?.message ||
          'Unable to delete interview record.';
      }
    });
  }

  resetForm(): void {
    this.newInterview = {
      interviewType: 'Technical',
      technicalScore: 0,
      aptitudeScore: 0,
      communicationScore: 0,
      status: 'Completed',
      feedback: '',
      interviewerName: '',
      company: ''
    };
  }

  toggleHistory(): void {
    this.showHistory = !this.showHistory;
    if (!this.showHistory) {
      this.cancelForm();
    }
  }

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────

  formatMonth(): string {
    return this.currentMonth.toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric'
    });
  }

  formatSelectedDate(): string {
    return this.selectedDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  formatDateTime(value: string): string {
    return new Date(value).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  formatTime(value: string): string {
    return new Date(value).toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  isBeforeToday(date: Date): boolean {
    const today = new Date();
    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    return dateOnly.getTime() < todayOnly.getTime();
  }

  isSameMonth(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth()
    );
  }

  isSelectedDate(day: CalendarDay): boolean {
    return day.key === this.selectedDateKey;
  }

  isSlotInPast(slot: InterviewSlot): boolean {
    return new Date(slot.startTime).getTime() <= Date.now();
  }

  hasOverlappingBooking(
    slot: InterviewSlot,
    ignoreBookingId?: number
  ): boolean {
    const slotStart = new Date(slot.startTime).getTime();
    const slotEnd = new Date(slot.endTime).getTime();

    return this.bookings.some(booking => {
      if (
        ignoreBookingId !== undefined &&
        booking.id === ignoreBookingId
      ) {
        return false;
      }

      if (
        String(booking.status).toUpperCase() !== 'CONFIRMED'
      ) {
        return false;
      }

      const bookingStart =
        new Date(booking.startTime).getTime();
      const bookingEnd =
        new Date(booking.endTime).getTime();

      return (
        slotStart < bookingEnd &&
        slotEnd > bookingStart
      );
    });
  }

  getCalendarDayClass(day: CalendarDay): string[] {
    const classes: string[] = [];

    if (!day.isCurrentMonth) {
      classes.push('muted-day');
    }

    if (day.isPast) {
      classes.push('past-day');
    }

    if (day.isToday) {
      classes.push('today');
    }

    if (this.isSelectedDate(day)) {
      classes.push('selected-day');
    }

    const available = this.getAvailableCount(day);
    const booked = this.getBookedCount(day);

    if (available > 0) {
      classes.push('has-available');
    }

    if (booked > 0) {
      classes.push('has-booked');
    }

    return classes;
  }

  clearMessages(): void {
    this.error = '';
    this.successMessage = '';
  }

  showError(message: string): void {
    this.error = message;
    this.successMessage = '';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
