import geocodingService from '../services/geocodingService';
import weatherService from '../services/weatherService';
import activityService from '../services/activityService';
import { City } from '../models/types';
import cache from '../utils/cache';

const resolvers = {
  Query: {
    searchCities: async (_parent: any, { query }: { query: string }) => {
      return await geocodingService.searchCities(query);
    },

    getWeatherForecast: async (_parent: any, { cityId }: { cityId: string }) => {
      // First, get city from cache or search
      const cacheKey = `city:${cityId}`;
      let city = cache.get<City>(cacheKey);

      if (!city) {
        // Parse cityId (format: "place.xxxxx" from Mapbox)
        // In a real scenario, you'd need to fetch city details
        // For now, we'll throw an error
        throw new Error('City not found. Please search for cities first.');
      }

      return await weatherService.getWeatherForecast(city);
    },

    getActivityRankings: async (_parent: any, { cityId }: { cityId: string }) => {
      const cacheKey = `city:${cityId}`;
      let city = cache.get<City>(cacheKey);

      if (!city) {
        throw new Error('City not found. Please search for cities first.');
      }

      const forecast = await weatherService.getWeatherForecast(city);
      return activityService.rankActivities(city, forecast.current);
    },
  },

  // Field resolvers to cache cities when they're queried
  City: {
    __resolveReference(city: City) {
      const cacheKey = `city:${city.id}`;
      cache.set(cacheKey, city);
      return city;
    },
  },
};

export default resolvers;