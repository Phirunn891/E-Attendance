import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements AfterViewInit {

  ngAfterViewInit() {
    this.initLineChart();
    this.initDoughnutChart();
  }

  private initLineChart() {
    const ctx = document.getElementById('lineChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
          datasets: [
            {
              label: 'Present',
              data: [92, 95, 90, 96, 91, 93, 97],
              borderColor: '#1e7145',
              backgroundColor: 'rgba(30, 113, 69, 0.1)',
              borderWidth: 2,
              pointBackgroundColor: '#1e7145',
              pointRadius: 4,
              tension: 0.1,
              fill: true
            },
            {
              label: 'Absent',
              data: [15, 12, 20, 10, 18, 14, 22],
              borderColor: '#b44437',
              borderWidth: 2,
              borderDash: [5, 5],
              pointRadius: 0,
              tension: 0.1,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { display: false, min: 0, max: 120 },
            x: {
              grid: { display: false },
              ticks: { color: '#9facb5', font: { size: 10, weight: 'bold' } },
              border: { display: false }
            }
          }
        }
      });
    }
  }

  private initDoughnutChart() {
    const ctx = document.getElementById('doughnutChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Present', 'Permission', 'Late', 'Absent'],
          datasets: [{
            data: [92, 4, 3, 2],
            backgroundColor: ['#1e7145', '#1a5ea8', '#ad6228', '#b44437'],
            borderWidth: 0,
            borderRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '75%',
          plugins: {
            legend: { display: false },
            tooltip: { enabled: true }
          }
        }
      });
    }
  }

  get subjects() {
    return [
      { name: 'COMPUTER SCI.', value: 85, bg: '#235d3a' },
      { name: 'MATHEMATICS', value: 65, bg: '#235d3a' },
      { name: 'PHYSICS', value: 45, bg: '#235d3a' },
      { name: 'FINE ARTS', value: 90, bg: '#235d3a' },
      { name: 'HISTORY', value: 55, bg: '#235d3a' },
      { name: 'ECONOMICS', value: 75, bg: '#235d3a' }
    ];
  }
}
