import { Weather, WeatherForecast, City } from '../models/types';
import { ExternalAPIError, NotFoundError } from '../utils/errors';
import cache from '../utils/cache';

const OPEN_METEO_API = 'https://api.open-meteo.com/v1/forecast';

interface OpenMeteoResponse {
  current_weather: {
    temperature: number;
    windspeed: number;
    weathercode: number;
    time: string;
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    precipitation: number[];
    windspeed_10m: number[];
    relativehumidity_2m: number[];
    weathercode: number[];
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
        `current_weather=true&` +
        `hourly=temperature_2m,precipitation,windspeed_10m,relativehumidity_2m,weathercode&` +
        `forecast_days=3`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new ExternalAPIError('OpenMeteo', `HTTP ${response.status}`);
      }

      const data = await response.json() as OpenMeteoResponse;

      if (!data.current_weather) {
        throw new NotFoundError('Weather data not available for this location');
      }

      const forecast: WeatherForecast = {
        city,
        current: this.formatCurrentWeather(data.current_weather),
        forecast: this.formatHourlyForecast(data.hourly || {} as any),
      };

      cache.set(cacheKey, forecast);
      return forecast;
    } catch (error) {
      if (error instanceof ExternalAPIError || error instanceof NotFoundError) {
        throw error;
      }
      throw new ExternalAPIError('OpenMeteo', (error as Error).message);
    }
  },

  /**
   * Format current weather data
   */
  formatCurrentWeather(current: OpenMeteoResponse['current_weather']): Weather {
    return {
      temperature: current.temperature,
      conditions: this.getWeatherCondition(current.weathercode),
      precipitation: 0, // Current weather doesn't include precipitation
      windSpeed: current.windspeed,
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
      conditions: this.getWeatherCondition(hourly.weathercode[index]),
      precipitation: hourly.precipitation[index],
      windSpeed: hourly.windspeed_10m[index],
      humidity: hourly.relativehumidity_2m[index],
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