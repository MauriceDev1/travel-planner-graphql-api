import activityService from '../../services/activityService';
import { City, Weather, ActivityType } from '../../models/types';

describe('ActivityService Unit Tests', () => {
  const mockCity: City = {
    id: 'test-city',
    name: 'Test City',
    country: 'Test Country',
    latitude: 0,
    longitude: 0,
  };

  describe('rankActivities', () => {
    it('should return all 4 activity types', () => {
      const weather: Weather = {
        temperature: 20,
        condition: 'Clear sky',
        precipitation: 0,
        windSpeed: 10,
        timestamp: new Date().toISOString(),
      };

      const result = activityService.rankActivities(mockCity, weather);

      expect(result.activities).toHaveLength(4);
      const activityNames = result.activities.map(a => a.type);
      expect(activityNames).toContain(ActivityType.SKIING);
      expect(activityNames).toContain(ActivityType.SURFING);
      expect(activityNames).toContain(ActivityType.INDOOR_SIGHTSEEING);
      expect(activityNames).toContain(ActivityType.OUTDOOR_SIGHTSEEING);
    });

    it('should rank activities in descending order by score', () => {
      const weather: Weather = {
        temperature: 20,
        condition: 'Clear sky',
        precipitation: 0,
        windSpeed: 10,
        timestamp: new Date().toISOString(),
      };

      const result = activityService.rankActivities(mockCity, weather);

      for (let i = 0; i < result.activities.length - 1; i++) {
        expect(result.activities[i].score).toBeGreaterThanOrEqual(
          result.activities[i + 1].score
        );
      }
    });

    it('should mark activities with score >= 7 as recommended', () => {
      const weather: Weather = {
        temperature: 20,
        condition: 'Clear sky',
        precipitation: 0,
        windSpeed: 10,
        timestamp: new Date().toISOString(),
      };

      const result = activityService.rankActivities(mockCity, weather);

      result.activities.forEach(activity => {
        if (activity.score >= 7) {
          expect(activity.recommended).toBe(true);
        } else {
          expect(activity.recommended).toBe(false);
        }
      });
    });

    it('should recommend outdoor sightseeing in perfect weather', () => {
      const weather: Weather = {
        temperature: 22,
        condition: 'Clear sky',
        precipitation: 0,
        windSpeed: 10,
        timestamp: new Date().toISOString(),
      };

      const result = activityService.rankActivities(mockCity, weather);
      const outdoor = result.activities.find(
        a => a.type === ActivityType.OUTDOOR_SIGHTSEEING
      );

      expect(outdoor).toBeDefined();
      expect(outdoor!.score).toBeGreaterThanOrEqual(8);
      expect(outdoor!.recommended).toBe(true);
    });

    it('should recommend skiing in cold, snowy weather', () => {
      const weather: Weather = {
        temperature: -5,
        condition: 'Heavy snow',
        precipitation: 10,
        windSpeed: 15,
        timestamp: new Date().toISOString(),
      };

      const result = activityService.rankActivities(mockCity, weather);
      const skiing = result.activities.find(a => a.type === ActivityType.SKIING);

      expect(skiing).toBeDefined();
      expect(skiing!.score).toBeGreaterThanOrEqual(7);
      expect(skiing!.recommended).toBe(true);
    });

    it('should not recommend skiing in warm weather', () => {
      const weather: Weather = {
        temperature: 25,
        condition: 'Clear sky',
        precipitation: 0,
        windSpeed: 10,
        timestamp: new Date().toISOString(),
      };

      const result = activityService.rankActivities(mockCity, weather);
      const skiing = result.activities.find(a => a.type === ActivityType.SKIING);

      expect(skiing).toBeDefined();
      expect(skiing!.recommended).toBe(false);
    });

    it('should recommend indoor sightseeing in rainy weather', () => {
      const weather: Weather = {
        temperature: 15,
        condition: 'Heavy rain',
        precipitation: 20,
        windSpeed: 30,
        timestamp: new Date().toISOString(),
      };

      const result = activityService.rankActivities(mockCity, weather);
      const indoor = result.activities.find(
        a => a.type === ActivityType.INDOOR_SIGHTSEEING
      );

      expect(indoor).toBeDefined();
      expect(indoor!.score).toBeGreaterThanOrEqual(6);
    });

    it('should include meaningful reasons for each activity', () => {
      const weather: Weather = {
        temperature: 20,
        condition: 'Clear sky',
        precipitation: 0,
        windSpeed: 10,
        timestamp: new Date().toISOString(),
      };

      const result = activityService.rankActivities(mockCity, weather);

      result.activities.forEach(activity => {
        expect(activity.reason).toBeDefined();
        expect(activity.reason.length).toBeGreaterThan(0);
      });
    });
  });
});