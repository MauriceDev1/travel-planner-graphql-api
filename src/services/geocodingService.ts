import { City } from '../models/types';
import { ExternalAPIError, ValidationError } from '../utils/errors';
import cache from '../utils/cache';

const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || '';
const MAPBOX_API_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number];
  context?: Array<{ id: string; text: string }>;
  place_type: string[];
  text: string;
}

interface MapboxResponse {
  features: MapboxFeature[];
}

const geocodingService = {
  /**
   * Search for cities using Mapbox Geocoding API
   * @param query - Search query (city name or partial name)
   * @returns Array of matching cities
   */
  async searchCities(query: string): Promise<City[]> {
    if (!query || query.trim().length < 2) {
      throw new ValidationError('Search query must be at least 2 characters');
    }

    if (!MAPBOX_TOKEN) {
      throw new Error('MAPBOX_ACCESS_TOKEN environment variable is not set');
    }

    const cacheKey = `geocoding:${query.toLowerCase()}`;
    const cached = cache.get<City[]>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const url = `${MAPBOX_API_URL}/${encodeURIComponent(query)}.json?` +
        `access_token=${MAPBOX_TOKEN}&` +
        `types=place&` +
        `limit=10`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new ExternalAPIError('Mapbox', `HTTP ${response.status}`);
      }

      const data = await response.json() as MapboxResponse ;
      const cities = data.features.map(this.formatCity);

      cache.set(cacheKey, cities);
      return cities;
    } catch (error) {
      if (error instanceof ExternalAPIError) {
        throw error;
      }
      throw new ExternalAPIError('Mapbox', (error as Error).message);
    }
  },

  /**
   * Format Mapbox feature to City type
   */
  formatCity(feature: MapboxFeature): City {
    const country = feature.context?.find(ctx => 
      ctx.id.startsWith('country')
    )?.text || '';

    const region = feature.context?.find(ctx => 
      ctx.id.startsWith('region')
    )?.text;

    return {
      id: feature.id,
      name: feature.text,
      country,
      latitude: feature.center[1],
      longitude: feature.center[0],
      region,
    };
  },
};

export default geocodingService;