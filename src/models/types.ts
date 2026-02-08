export interface City {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  region?: string;
}

export interface Weather {
  temperature: number;
  conditions: string;
  precipitation: number;
  windSpeed: number;
  humidity?: number;
  timestamp: string;
}

export interface WeatherForecast {
  city: City;
  current: Weather;
  forecast: Weather[];
}

export interface Activity {
  name: string;
  score: number;
  recommended: boolean;
  reason: string;
}

export interface ActivityRanking {
  city: City;
  weather: Weather;
  activities: Activity[];
}

export enum ActivityType {
  SKIING = 'SKIING',
  SURFING = 'SURFING',
  INDOOR_SIGHTSEEING = 'INDOOR_SIGHTSEEING',
  OUTDOOR_SIGHTSEEING = 'OUTDOOR_SIGHTSEEING',
}

export default {};