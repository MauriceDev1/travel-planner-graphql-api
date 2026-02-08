import geocodingService from '../services/geocodingService';
import weatherService from '../services/weatherService';
import activityService from '../services/activityService';
import { City } from '../models/types';

const createCityFromCoordinates = (
  latitude: number,
  longitude: number
): City => ({
  id: `${latitude},${longitude}`,
  name: 'Selected Location',
  country: 'Unknown',
  latitude,
  longitude,
});

const resolvers = {
  Query: {
    searchCities: (_parent: unknown, { query }: { query: string }) => {
      return geocodingService.searchCities(query);
    },

    getWeatherForecast: (
      _parent: unknown,
      { latitude, longitude }: { latitude: number; longitude: number }
    ) => {
      const city = createCityFromCoordinates(latitude, longitude);
      return weatherService.getWeatherForecast(city);
    },

    getActivityRankings: async (
      _parent: unknown,
      { latitude, longitude }: { latitude: number; longitude: number }
    ) => {
      const city = createCityFromCoordinates(latitude, longitude);
      const forecast = await weatherService.getWeatherForecast(city);

      return activityService.rankActivities(city, forecast.current);
    },
  },
};

export default resolvers;
