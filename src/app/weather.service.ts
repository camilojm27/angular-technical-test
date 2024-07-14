import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

interface ForecastPeriod {
  name: string;
  temperature: number;
  startTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private baseUrl = 'https://api.weather.gov/gridpoints/';
  forecast = signal<ForecastPeriod[]>([]);

  constructor(private http: HttpClient) { }

  getForecast(id: string): void {
    const url = `${this.baseUrl}${id}/31,80/forecast`;
    this.http.get(url).pipe(
      map((response: any) => {
        return response.properties.periods.map((period: any) => ({
          name: period.name,
          temperature: period.temperature,
          startTime: period.startTime
        }));
      })
    ).subscribe(data => {
      this.forecast.set(data);
    });
  }
}