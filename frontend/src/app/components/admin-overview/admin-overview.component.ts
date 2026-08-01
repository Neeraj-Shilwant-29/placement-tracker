import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-overview',
  templateUrl: './admin-overview.component.html',
  styleUrls: ['./admin-overview.component.scss']
})
export class AdminOverviewComponent implements OnInit, AfterViewInit {
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutChart') doughnutChartRef!: ElementRef<HTMLCanvasElement>;

  stats: any;
  private barChart: Chart | null = null;
  private doughnutChart: Chart | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getAdminStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.renderCharts();
      },
      error: (err) => console.error(err)
    });
  }

  ngAfterViewInit(): void {
    if (this.stats) {
      this.renderCharts();
    }
  }

  renderCharts(): void {
    if (!this.barChartRef?.nativeElement || !this.doughnutChartRef?.nativeElement) return;
    this.renderBarChart();
    this.renderDoughnutChart();
  }

  private renderBarChart(): void {
    if (this.barChart) this.barChart.destroy();
    const ctx = this.barChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Students', 'Companies', 'Aptitude Qs', 'Coding Qs', 'Tests Taken', 'Interviews'],
        datasets: [{
          label: 'Platform Statistics',
          data: [
            this.stats?.totalStudents || 0,
            this.stats?.totalCompanies || 0,
            this.stats?.totalAptitudeQuestions || 0,
            this.stats?.totalCodingQuestions || 0,
            this.stats?.totalAptitudeTests || 0,
            this.stats?.totalMockInterviews || 0
          ],
          backgroundColor: [
            'rgba(79, 70, 229, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(236, 72, 153, 0.8)'
          ],
          borderColor: [
            'rgb(79, 70, 229)',
            'rgb(16, 185, 129)',
            'rgb(139, 92, 246)',
            'rgb(59, 130, 246)',
            'rgb(245, 158, 11)',
            'rgb(236, 72, 153)'
          ],
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1E293B',
            titleFont: { family: 'Inter', weight: 'normal' },
            bodyFont: { family: 'Inter' },
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { font: { family: 'Inter', size: 11 }, color: '#94A3B8' }
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 11, weight: 'normal' }, color: '#64748B' }
          }
        }
      }
    });
  }

  private renderDoughnutChart(): void {
    if (this.doughnutChart) this.doughnutChart.destroy();
    const ctx = this.doughnutChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const aptitude = this.stats?.totalAptitudeQuestions || 0;
    const coding = this.stats?.totalCodingQuestions || 0;
    const companies = this.stats?.totalCompanies || 0;
    const hasData = aptitude + coding + companies > 0;

    this.doughnutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: hasData ? ['Aptitude Questions', 'Coding Questions', 'Companies'] : ['No Data'],
        datasets: [{
          data: hasData ? [aptitude, coding, companies] : [1],
          backgroundColor: hasData
            ? ['rgba(139, 92, 246, 0.85)', 'rgba(59, 130, 246, 0.85)', 'rgba(16, 185, 129, 0.85)']
            : ['rgba(203, 213, 225, 0.5)'],
          borderColor: hasData
            ? ['rgb(139, 92, 246)', 'rgb(59, 130, 246)', 'rgb(16, 185, 129)']
            : ['rgb(203, 213, 225)'],
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 16,
              usePointStyle: true,
              pointStyleWidth: 10,
              font: { family: 'Inter', size: 12, weight: 'normal' },
              color: '#475569'
            }
          },
          tooltip: {
            backgroundColor: '#1E293B',
            titleFont: { family: 'Inter', weight: 'normal' },
            bodyFont: { family: 'Inter' },
            padding: 12,
            cornerRadius: 8
          }
        }
      }
    });
  }
}
