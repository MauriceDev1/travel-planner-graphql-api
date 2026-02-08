import { Weather, WeatherForecast, City } from '../models/types';
import { ExternalAPIError, NotFoundError } from '../utils/errors';
import cache from '../utils/cache';
import fetch from 'node-fetch';

const OPEN_METEO_API = 'https://api.open-meteo.com/v1/forecast';

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    time: string;
    precipitation: number;
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    precipitation: number[];
    wind_speed_10m: number[];
    relative_humidity_2m: number[];
    weather_code: number[];
  };
}

const weatherService = {
  /**
   * Get current weather and forecast for a city
   */
  async getWeatherForecast(city: City): Promise<WeatherForecast> {
    const cacheKey = `weather:${city.latitude}:${city.longitude}`;
    const cached = cache.get<WeatherForecast>(cacheKey, 600000); // 10 min cache

    if (cached) {
      return cached;
    }

    try {
      const url = `${OPEN_METEO_API}?` +
        `latitude=${city.latitude}&` +
        `longitude=${city.longitude}&` +
        `current=temperature_2m,precipitation,wind_speed_10m,weather_code&` +
        `hourly=temperature_2m,precipitation,wind_speed_10m,relative_humidity_2m,weather_code&` +
        `forecast_days=3&` +
        `timezone=auto`;

      console.log('Fetching weather from:', url); // Debug

      const response = await fetch(url);

      if (!response.ok) {
        throw new ExternalAPIError('OpenMeteo', `HTTP ${response.status}`);
      }

      const data = await response.json() as OpenMeteoResponse;

      if (!data.current) {
        throw new NotFoundError('Weather data not available for this location');
      }

      const forecast: WeatherForecast = {
        city,
        current: this.formatCurrentWeather(data.current),
        forecast: this.formatHourlyForecast(data.hourly || {} as any),
      };

      cache.set(cacheKey, forecast);
      return forecast;
    } catch (error) {
      console.error('Weather service error:', error); // Debug
      if (error instanceof ExternalAPIError || error instanceof NotFoundError) {
        throw error;
      }
      throw new ExternalAPIError('OpenMeteo', (error as Error).message);
    }
  },

  /**
   * Format current weather data
   */
  formatCurrentWeather(current: OpenMeteoResponse['current']): Weather {
    return {
      temperature: current.temperature_2m,
      condition: this.getWeatherCondition(current.weather_code),
      precipitation: current.precipitation || 0,
      windSpeed: current.wind_speed_10m,
      timestamp: current.time,
    };
  },

  /**
   * Format hourly forecast (next 24 hours)
   */
  formatHourlyForecast(hourly: NonNullable<OpenMeteoResponse['hourly']>): Weather[] {
    if (!hourly.time || hourly.time.length === 0) {
      return [];
    }

    // Get next 24 hours
    return hourly.time.slice(0, 24).map((time, index) => ({
      temperature: hourly.temperature_2m[index],
      condition: this.getWeatherCondition(hourly.weather_code[index]),
      precipitation: hourly.precipitation[index],
      windSpeed: hourly.wind_speed_10m[index],
      humidity: hourly.relative_humidity_2m[index],
      timestamp: time,
    }));
  },

  /**
   * Convert WMO weather code to condition string
   * https://open-meteo.com/en/docs
   */
  getWeatherCondition(code: number): string {
    const conditions: { [key: number]: string } = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail',
    };

    return conditions[code] || 'Unknown';
  },
};

export default weatherService;