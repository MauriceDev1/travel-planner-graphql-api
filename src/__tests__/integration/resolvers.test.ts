import { ApolloServer } from '@apollo/server';
import typeDefs from '../../schema/typeDefs';
import resolvers from '../../schema/resolvers';
import geocodingService from '../../services/geocodingService';
import weatherService from '../../services/weatherService';
import activityService from '../../services/activityService';
import { ActivityType } from '../../models/types';  // Add this import

// Mock all services
jest.mock('../../services/geocodingService');
jest.mock('../../services/weatherService');
jest.mock('../../services/activityService');

const mockGeocodingService = geocodingService as jest.Mocked<typeof geocodingService>;
const mockWeatherService = weatherService as jest.Mocked<typeof weatherService>;
const mockActivityService = activityService as jest.Mocked<typeof activityService>;

describe('GraphQL Resolvers Integration Tests', () => {
  let server: ApolloServer;

  beforeEach(() => {
    server = new ApolloServer({
      typeDefs,
      resolvers,
    });

    jest.clearAllMocks();
  });

  afterEach(async () => {
    await server.stop();
  });

  describe('searchCities', () => {
    it('should return cities from geocoding service', async () => {
      const mockCities = [
        {
          id: 'place.123',
          name: 'Cape Town',
          country: 'South Africa',
          latitude: -33.9249,
          longitude: 18.4241,
        },
      ];

      mockGeocodingService.searchCities.mockResolvedValue(mockCities);

      const query = `
        query SearchCities($query: String!) {
          searchCities(query: $query) {
            id
            name
            country
            latitude
            longitude
          }
        }
      `;

      const response = await server.executeOperation({
        query,
        variables: { query: 'Cape Town' },
      });

      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeUndefined();
        expect(response.body.singleResult.data?.searchCities).toEqual(mockCities);
      }

      expect(mockGeocodingService.searchCities).toHaveBeenCalledWith(
        'Cape Town'
      );
    });

    it('should handle service errors', async () => {
      mockGeocodingService.searchCities.mockRejectedValue(
        new Error('Mapbox API error')
      );

      const query = `
        query SearchCities($query: String!) {
          searchCities(query: $query) {
            id
            name
          }
        }
      `;

      const response = await server.executeOperation({
        query,
        variables: { query: 'London' },
      });

      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeDefined();
        expect(response.body.singleResult.errors?.[0].message).toContain(
          'Mapbox API error'
        );
      }
    });
  });

  describe('getWeatherForecast', () => {
    it('should return weather forecast for coordinates', async () => {
      const mockForecast = {
        city: {
          id: '-33.9249,18.4241',
          name: 'Selected Location',
          country: 'Unknown',
          latitude: -33.9249,
          longitude: 18.4241,
        },
        current: {
          temperature: 22,
          condition: 'Clear sky',
          precipitation: 0,
          windSpeed: 15,
          timestamp: '2024-02-07T12:00:00Z',
        },
        forecast: [
          {
            temperature: 20,
            condition: 'Partly cloudy',
            precipitation: 0.5,
            windSpeed: 12,
            timestamp: '2024-02-07T13:00:00Z',
          },
        ],
      };

      mockWeatherService.getWeatherForecast.mockResolvedValue(mockForecast);

      const query = `
        query GetWeather($latitude: Float!, $longitude: Float!) {
          getWeatherForecast(latitude: $latitude, longitude: $longitude) {
            city {
              latitude
              longitude
            }
            current {
              temperature
              condition
              precipitation
              windSpeed
            }
            forecast {
              temperature
              condition
            }
          }
        }
      `;

      const response = await server.executeOperation({
        query,
        variables: {
          latitude: -33.9249,
          longitude: 18.4241,
        },
      });

      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeUndefined();
        const data = response.body.singleResult.data?.getWeatherForecast as any;
        expect(data.city.latitude).toBe(-33.9249);
        expect(data.current.temperature).toBe(22);
        expect(data.forecast).toHaveLength(1);
      }
    });
  });

  describe('getActivityRankings', () => {
    it('should return activity rankings for coordinates', async () => {
      const mockForecast = {
        city: {
          id: '-33.9249,18.4241',
          name: 'Selected Location',
          country: 'Unknown',
          latitude: -33.9249,
          longitude: 18.4241,
        },
        current: {
          temperature: 22,
          condition: 'Clear sky',
          precipitation: 0,
          windSpeed: 15,
          timestamp: '2024-02-07T12:00:00Z',
        },
        forecast: [],
      };

      const mockRankings = {
        city: mockForecast.city,
        weather: mockForecast.current,
        activities: [
          {
            type: ActivityType.OUTDOOR_SIGHTSEEING,  // Changed
            score: 9,
            recommended: true,
            reason: 'Perfect weather',
          },
          {
            type: ActivityType.SURFING,  // Changed
            score: 7,
            recommended: true,
            reason: 'Good conditions',
          },
          {
            type: ActivityType.INDOOR_SIGHTSEEING,  // Changed
            score: 6,
            recommended: false,
            reason: 'Always available',
          },
          {
            type: ActivityType.SKIING,  // Changed
            score: 2,
            recommended: false,
            reason: 'Too warm',
          },
        ],
      };

      mockWeatherService.getWeatherForecast.mockResolvedValue(mockForecast);
      mockActivityService.rankActivities.mockReturnValue(mockRankings);

      const query = `
        query GetActivities($latitude: Float!, $longitude: Float!) {
          getActivityRankings(latitude: $latitude, longitude: $longitude) {
            weather {
              temperature
              condition
            }
            activities {
              type
              score
              recommended
              reason
            }
          }
        }
      `;

      const response = await server.executeOperation({
        query,
        variables: {
          latitude: -33.9249,
          longitude: 18.4241,
        },
      });

      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeUndefined();
        const data = response.body.singleResult.data?.getActivityRankings as any;
        expect(data.activities).toHaveLength(4);
        expect(data.activities[0].type).toBe('OUTDOOR_SIGHTSEEING');
        expect(data.activities[0].recommended).toBe(true);
      }
    });
  });
});