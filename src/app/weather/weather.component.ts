import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  inject,
  effect,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WeatherService } from '../weather.service';
import { Chart, registerables, ChartOptions, ChartDataset } from 'chart.js';
import { CommonModule } from '@angular/common';

Chart.register(...registerables);

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css'],
})
export class WeatherComponent implements OnInit, AfterViewInit {
  @ViewChild('weatherChart') chartCanvas!: ElementRef;

  private route = inject(ActivatedRoute);
  weatherService = inject(WeatherService);
  chart: Chart | undefined;

  stateFlag: string = '';
  stateName: string = '';

  constructor() {
    effect(() => {
      const data = this.weatherService.forecast();
      if (this.chart && data.length > 0) {
        this.updateChart(data);
      }
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.weatherService.getForecast(id);
      this.setStateInfo(id);
    }
  }

  ngAfterViewInit() {
    this.createChart();
  }

  setStateInfo(id: string) {
    switch (id) {
      case 'LWX':
        this.stateFlag =
          'https://upload.wikimedia.org/wikipedia/commons/0/03/Flag_of_Washington%2C_D.C.svg';
        this.stateName = 'District of Columbia';
        break;
      case 'TOP':
        this.stateFlag =
          'https://upload.wikimedia.org/wikipedia/commons/d/da/Flag_of_Kansas.svg';
        this.stateName = 'Kansas';
        break;
      default:
        this.stateFlag = '';
        this.stateName = '';
    }
  }

  createChart() {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');

    const gradientFill = ctx.createLinearGradient(0, 400, 0, 220);
    gradientFill.addColorStop(0, 'rgba(75, 192, 192, 0.4)');
    gradientFill.addColorStop(1, 'rgba(255, 159, 64, 0.7)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Temperature (°F)',
            data: [],
            backgroundColor: gradientFill,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: 'rgb(75, 192, 192)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(75, 192, 192)',
            pointHoverBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
            },
          },
          y: {
            beginAtZero: false,
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => `Temperature: ${context.parsed.y}°F`,
            },
          },
        },
      },
    });
  }

  updateChart(data: any[]) {
    if (this.chart) {
      this.chart.data.labels = data.map((item) => new Date(item.startTime));
      const temperatures = data.map((item) => item.temperature);

      const pointBackgroundColor = temperatures.map((temp) => {
        if (temp > 85) {
          return 'rgb(255, 0, 0)'; // Hot
        } else if (temp > 70 && temp <= 85) {
          return 'rgb(255, 165, 0)'; // Warm
        } else if (temp >= 50) {
          return 'rgb(75, 192, 192)'; //Cool
        } else {
          return 'rgb(0, 0, 255)'; // Cold
        }
      });
      const pointHoverBackgroundColor = pointBackgroundColor;

      this.chart.data.datasets[0].data = data.map((item) => ({
        x: new Date(item.startTime).getTime(),
        y: item.temperature,
      }));
      //@ts-ignore
      this.chart.data.datasets[0].pointBackgroundColor = pointBackgroundColor;
      //@ts-ignore
      this.chart.data.datasets[0].pointHoverBackgroundColor =
        pointHoverBackgroundColor;

      this.chart.update();
    }
  }
}
