import geocodingService from '../../services/geocodingService';
import { ValidationError, ExternalAPIError } from '../../utils/errors';

// Mock fetch globally
global.fetch = jest.fn();

describe('GeocodingService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MAPBOX_ACCESS_TOKEN = 'test-token';
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('searchCities', () => {
    it('should return cities for valid query', async () => {
      const mockResponse = {
        features: [
          {
            id: 'place.123',
            text: 'Cape Town',
            place_name: 'Cape Town, South Africa',
            center: [18.4241, -33.9249] as [number, number],
            place_type: ['place'],
            context: [
              { id: 'country.456', text: 'South Africa' },
              { id: 'region.789', text: 'Western Cape' },
            ],
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await geocodingService.searchCities('Cape Town');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Cape Town');
      expect(result[0].country).toBe('South Africa');
      expect(result[0].latitude).toBe(-33.9249);
      expect(result[0].longitude).toBe(18.4241);
    });

    it('should throw ValidationError for query less than 2 characters', async () => {
      await expect(geocodingService.searchCities('a')).rejects.toThrow(
        ValidationError
      );
      await expect(geocodingService.searchCities('')).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ExternalAPIError on API failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(geocodingService.searchCities('London')).rejects.toThrow(
        ExternalAPIError
      );
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      await expect(geocodingService.searchCities('London')).rejects.toThrow(
        ExternalAPIError
      );
    });

    it('should return empty array when no results found', async () => {
      const mockResponse = {
        features: [],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await geocodingService.searchCities('NonexistentCity123');

      expect(result).toHaveLength(0);
    });
  });

  describe('formatCity', () => {
    it('should correctly format a Mapbox feature', () => {
      const feature = {
        id: 'place.123',
        text: 'London',
        place_name: 'London, United Kingdom',
        center: [-0.1278, 51.5074] as [number, number],
        place_type: ['place'],
        context: [
          { id: 'country.456', text: 'United Kingdom' },
          { id: 'region.789', text: 'Greater London' },
        ],
      };

      const result = geocodingService.formatCity(feature);

      expect(result.id).toBe('place.123');
      expect(result.name).toBe('London');
      expect(result.country).toBe('United Kingdom');
      expect(result.latitude).toBe(51.5074);
      expect(result.longitude).toBe(-0.1278);
      expect(result.region).toBe('Greater London');
    });

    it('should handle missing region', () => {
      const feature = {
        id: 'place.123',
        text: 'Paris',
        place_name: 'Paris, France',
        center: [2.3522, 48.8566] as [number, number],
        place_type: ['place'],
        context: [{ id: 'country.456', text: 'France' }],
      };

      const result = geocodingService.formatCity(feature);

      expect(result.region).toBeUndefined();
    });
  });
});