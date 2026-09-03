import { PermissionsAndroid, Platform } from 'react-native';

export interface WeatherData {
  temp: number;
  condition: string;
  city: string;
  conditionType: 'sun' | 'cloud-sun' | 'cloud' | 'rain' | 'thunder' | 'snow' | 'fog';
  dayName: string;
  dayNum: string;
  monthName: string;
  lastUpdated: string;
  isDynamicLocation: boolean;
}

const DEFAULT_CITY = 'Chennai';
const DEFAULT_LAT = 13.0827;
const DEFAULT_LON = 80.2707;

let openWeatherApiKey = '';

export const setOpenWeatherApiKey = (key: string) => {
  openWeatherApiKey = key.trim();
};

export const weatherService = {
  /**
   * Requests native location permissions on Android/iOS.
   */
  async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission Needed',
            message: 'Life Reminder needs location permission to display live local weather for your city.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Android location permission request error:', err);
        return false;
      }
    }
    return true;
  },

  /**
   * Dynamically fetches user location with Native Permission handling:
   * 1. Native GPS Hardware Sensor with Runtime Permission
   * 2. IP Network Geolocation
   * 3. Default City (Chennai)
   */
  async getCurrentWeather(forcedCity?: string): Promise<WeatherData> {
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    const dayNum = now.toLocaleDateString('en-US', { day: '2-digit' });
    const monthName = now.toLocaleDateString('en-US', { month: 'long' });

    let city = forcedCity || DEFAULT_CITY;
    let lat = DEFAULT_LAT;
    let lon = DEFAULT_LON;
    let isDynamic = false;

    try {
      // Step 1: Request Location Permission & Read Native GPS Position
      const hasPermission = await this.requestLocationPermission();
      if (hasPermission) {
        const gpsResult = await this.tryGetGpsLocation();
        if (gpsResult) {
          lat = gpsResult.latitude;
          lon = gpsResult.longitude;
          isDynamic = true;
          
          const reverseCity = await this.reverseGeocode(lat, lon);
          if (reverseCity) city = reverseCity;
        }
      }

      // Step 2: Fallback to IP Network Geolocation if GPS unavailable
      if (!isDynamic && !forcedCity) {
        const ipResult = await this.tryGetIpLocation();
        if (ipResult) {
          city = ipResult.city;
          lat = ipResult.lat;
          lon = ipResult.lon;
          isDynamic = true;
        }
      }

      // Step 3: Fetch Live Weather Status
      let weather: WeatherData;
      if (openWeatherApiKey) {
        weather = await this.fetchFromOpenWeatherMap(city, openWeatherApiKey, dayName, dayNum, monthName);
      } else {
        weather = await this.fetchFromOpenMeteo(lat, lon, city, dayName, dayNum, monthName);
      }

      return {
        ...weather,
        isDynamicLocation: isDynamic,
      };
    } catch (err) {
      console.warn('Weather fetch fallback triggered:', err);
      return {
        temp: 32,
        condition: 'Sunny',
        city: forcedCity || 'Chennai',
        conditionType: 'sun',
        dayName,
        dayNum,
        monthName,
        lastUpdated: new Date().toISOString(),
        isDynamicLocation: false,
      };
    }
  },

  tryGetGpsLocation(): Promise<{ latitude: number; longitude: number } | null> {
    return new Promise((resolve) => {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (pos && pos.coords) {
              resolve({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              });
            } else {
              resolve(null);
            }
          },
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
      } else {
        resolve(null);
      }
    });
  },

  async tryGetIpLocation(): Promise<{ city: string; lat: number; lon: number } | null> {
    try {
      const res = await fetch('http://ip-api.com/json/');
      if (res.ok) {
        const data = await res.json();
        if (data.city && data.lat && data.lon) {
          return { city: data.city, lat: data.lat, lon: data.lon };
        }
      }
    } catch (e) {
      try {
        const res2 = await fetch('https://ipapi.co/json/');
        if (res2.ok) {
          const data2 = await res2.json();
          if (data2.city && data2.latitude && data2.longitude) {
            return { city: data2.city, lat: data2.latitude, lon: data2.longitude };
          }
        }
      } catch (e2) {}
    }
    return null;
  },

  async reverseGeocode(lat: number, lon: number): Promise<string | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'LifeReminderApp/1.0' } });
      if (res.ok) {
        const data = await res.json();
        return (
          data.address?.city || 
          data.address?.town || 
          data.address?.suburb || 
          data.address?.county || 
          data.address?.state_district || 
          null
        );
      }
    } catch (e) {}
    return null;
  },

  async fetchFromOpenWeatherMap(
    city: string, 
    apiKey: string,
    dayName: string,
    dayNum: string,
    monthName: string
  ): Promise<WeatherData> {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OpenWeather API error: ${res.status}`);
    const data = await res.json();

    const mainCond = data.weather?.[0]?.main || 'Clear';
    const desc = data.weather?.[0]?.description || 'Sunny';
    const temp = Math.round(data.main?.temp ?? 32);
    const cityName = data.name || city;

    return {
      temp,
      condition: this.capitalizeWords(desc),
      city: cityName,
      conditionType: this.mapConditionType(mainCond),
      dayName,
      dayNum,
      monthName,
      lastUpdated: new Date().toISOString(),
      isDynamicLocation: true,
    };
  },

  async fetchFromOpenMeteo(
    lat: number, 
    lon: number, 
    city: string,
    dayName: string,
    dayNum: string,
    monthName: string
  ): Promise<WeatherData> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo API error: ${res.status}`);
    const data = await res.json();

    const currentWeather = data.current_weather;
    const temp = Math.round(currentWeather?.temperature ?? 32);
    const weatherCode = currentWeather?.weathercode ?? 0;

    const { condition, type } = this.mapWmoCode(weatherCode);

    return {
      temp,
      condition,
      city,
      conditionType: type,
      dayName,
      dayNum,
      monthName,
      lastUpdated: new Date().toISOString(),
      isDynamicLocation: true,
    };
  },

  mapConditionType(main: string): WeatherData['conditionType'] {
    const lower = main.toLowerCase();
    if (lower.includes('rain') || lower.includes('drizzle')) return 'rain';
    if (lower.includes('thunder') || lower.includes('storm')) return 'thunder';
    if (lower.includes('snow')) return 'snow';
    if (lower.includes('cloud')) return 'cloud-sun';
    if (lower.includes('fog') || lower.includes('mist') || lower.includes('haze')) return 'fog';
    return 'sun';
  },

  mapWmoCode(code: number): { condition: string; type: WeatherData['conditionType'] } {
    if (code === 0) return { condition: 'Sunny', type: 'sun' };
    if (code === 1 || code === 2) return { condition: 'Mostly Sunny', type: 'sun' };
    if (code === 3) return { condition: 'Overcast', type: 'cloud' };
    if (code >= 45 && code <= 48) return { condition: 'Foggy', type: 'fog' };
    if (code >= 51 && code <= 67) return { condition: 'Light Rain', type: 'rain' };
    if (code >= 80 && code <= 82) return { condition: 'Showers', type: 'rain' };
    if (code >= 95) return { condition: 'Thunderstorm', type: 'thunder' };
    return { condition: 'Sunny', type: 'sun' };
  },

  capitalizeWords(str: string): string {
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },
};
