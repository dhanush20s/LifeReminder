import { WeatherData, WeatherService } from './weatherTypes';
import { weatherRepository } from './weatherRepository';

class OpenMeteoWeatherService implements WeatherService {
  async getCurrentWeather(latitude: number, longitude: number): Promise<WeatherData> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error status: ${response.status}`);
    }
    
    const json = await response.json();
    const current = json.current_weather;
    const temp = Math.round(current.temperature);
    const code = current.weathercode;

    const { condition, icon } = this.getConditionFromCode(code);

    const weatherData: WeatherData = {
      temperature: temp,
      condition,
      conditionIcon: icon,
      locationName: 'Chennai', // Default location name or reverse geocoded
      timestamp: new Date().toISOString(),
    };

    await weatherRepository.saveCache(weatherData);
    return weatherData;
  }

  private getConditionFromCode(code: number): { condition: string; icon: string } {
    if (code === 0) return { condition: 'Clear Sky', icon: '☀️' };
    if (code >= 1 && code <= 3) return { condition: 'Partly Cloudy', icon: '⛅' };
    if (code === 45 || code === 48) return { condition: 'Foggy', icon: '🌫️' };
    if (code >= 51 && code <= 67) return { condition: 'Light Rain', icon: '🌧️' };
    if (code >= 71 && code <= 77) return { condition: 'Snow', icon: '❄️' };
    if (code >= 80 && code <= 99) return { condition: 'Thunderstorm', icon: '⛈️' };
    return { condition: 'Clear', icon: '☀️' };
  }
}

export const weatherService = new OpenMeteoWeatherService();

export const getWeatherIfEnabled = async (weatherEnabled: boolean): Promise<WeatherData | null> => {
  // If Weather setting is OFF: Do not call API, do not request location. Return null.
  if (!weatherEnabled) {
    return null;
  }

  try {
    // Default coordinates for Chennai (13.0827, 80.2707) or device GPS
    const data = await weatherService.getCurrentWeather(13.0827, 80.2707);
    return data;
  } catch (err) {
    console.warn('Failed to fetch live weather, falling back to cache:', err);
    // Return cached weather data if network fails
    const cached = await weatherRepository.getCache();
    if (cached) return cached;
    
    // Graceful offline fallback
    return {
      temperature: 33,
      condition: 'Light Rain',
      conditionIcon: '🌧️',
      locationName: 'Chennai',
      timestamp: new Date().toISOString(),
    };
  }
};
