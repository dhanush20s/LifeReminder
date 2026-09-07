export interface WeatherData {
  temperature: number;      // e.g. 33 (°C)
  condition: string;        // e.g. "Light Rain", "Sunny", "Cloudy"
  conditionIcon: string;    // e.g. "🌧️", "☀️", "☁️"
  locationName: string;     // e.g. "Chennai"
  timestamp: string;        // ISO timestamp string
}

export interface WeatherService {
  getCurrentWeather(latitude: number, longitude: number): Promise<WeatherData>;
}
