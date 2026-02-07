import { Activity, ActivityType, Weather, ActivityRanking, City } from '../models/types';

interface ActivityScore {
  type: ActivityType;
  score: number;
  reason: string;
}

const activityService = {
  /**
   * Rank activities based on weather conditions
   */
  rankActivities(city: City, weather: Weather): ActivityRanking {
    const scores: ActivityScore[] = [
      this.scoreSkiing(weather),
      this.scoreSurfing(weather),
      this.scoreIndoorSightseeing(weather),
      this.scoreOutdoorSightseeing(weather),
    ];

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    const activities: Activity[] = scores.map(item => ({
      name: item.type,
      score: item.score,
      recommended: item.score >= 7,
      reason: item.reason,
    }));

    return {
      city,
      weather,
      activities,
    };
  },

  /**
   * Score skiing based on weather
   * Ideal: Cold, snowy conditions
   */
  scoreSkiing(weather: Weather): ActivityScore {
    let score = 0;
    const reasons: string[] = [];

    // Temperature scoring (ideal: -5°C to 5°C)
    if (weather.temperature < -10) {
      score += 3;
      reasons.push('very cold');
    } else if (weather.temperature >= -10 && weather.temperature <= 0) {
      score += 8;
      reasons.push('perfect temperature');
    } else if (weather.temperature > 0 && weather.temperature <= 5) {
      score += 5;
      reasons.push('acceptable temperature');
    } else {
      score += 1;
      reasons.push('too warm');
    }

    // Snow/precipitation scoring
    if (weather.conditions.toLowerCase().includes('snow')) {
      score += 9;
      reasons.push('snowy conditions');
    } else if (weather.precipitation > 5) {
      score += 4;
      reasons.push('some precipitation');
    } else {
      score += 2;
      reasons.push('limited snow');
    }

    // Wind scoring (prefer calm conditions)
    if (weather.windSpeed < 20) {
      score += 3;
      reasons.push('calm winds');
    } else if (weather.windSpeed >= 20 && weather.windSpeed < 40) {
      score += 1;
      reasons.push('moderate winds');
    } else {
      reasons.push('strong winds');
    }

    return {
      type: ActivityType.SKIING,
      score: Math.min(10, Math.round(score / 2)),
      reason: reasons.join(', '),
    };
  },

  /**
   * Score surfing based on weather
   * Ideal: Warm, moderate wind
   */
  scoreSurfing(weather: Weather): ActivityScore {
    let score = 0;
    const reasons: string[] = [];

    // Temperature scoring (ideal: 15°C+)
    if (weather.temperature >= 20) {
      score += 8;
      reasons.push('warm temperature');
    } else if (weather.temperature >= 15) {
      score += 6;
      reasons.push('mild temperature');
    } else if (weather.temperature >= 10) {
      score += 3;
      reasons.push('cool temperature');
    } else {
      score += 1;
      reasons.push('cold temperature');
    }

    // Wind scoring (ideal: 10-30 km/h for waves)
    if (weather.windSpeed >= 10 && weather.windSpeed <= 30) {
      score += 8;
      reasons.push('good wave conditions');
    } else if (weather.windSpeed > 30 && weather.windSpeed <= 50) {
      score += 5;
      reasons.push('choppy conditions');
    } else if (weather.windSpeed < 10) {
      score += 3;
      reasons.push('calm seas');
    } else {
      score += 1;
      reasons.push('too windy');
    }

    // Precipitation scoring (prefer dry)
    if (weather.precipitation === 0) {
      score += 4;
      reasons.push('clear skies');
    } else if (weather.precipitation < 2) {
      score += 2;
      reasons.push('light precipitation');
    } else {
      reasons.push('rainy');
    }

    return {
      type: ActivityType.SURFING,
      score: Math.min(10, Math.round(score / 2)),
      reason: reasons.join(', '),
    };
  },

  /**
   * Score indoor sightseeing
   * Better in bad weather
   */
  scoreIndoorSightseeing(weather: Weather): ActivityScore {
    let score = 6; // Base score (always an option)
    const reasons: string[] = ['always available'];

    // Better score in bad weather
    if (weather.precipitation > 5) {
      score += 3;
      reasons.push('rainy outside');
    }

    if (weather.temperature < 5 || weather.temperature > 35) {
      score += 2;
      reasons.push('extreme temperature');
    }

    if (weather.windSpeed > 40) {
      score += 1;
      reasons.push('windy outside');
    }

    return {
      type: ActivityType.INDOOR_SIGHTSEEING,
      score: Math.min(10, score),
      reason: reasons.join(', '),
    };
  },

  /**
   * Score outdoor sightseeing
   * Ideal: Pleasant weather
   */
  scoreOutdoorSightseeing(weather: Weather): ActivityScore {
    let score = 0;
    const reasons: string[] = [];

    // Temperature scoring (ideal: 15-25°C)
    if (weather.temperature >= 15 && weather.temperature <= 25) {
      score += 8;
      reasons.push('perfect temperature');
    } else if (weather.temperature >= 10 && weather.temperature <= 30) {
      score += 6;
      reasons.push('pleasant temperature');
    } else if (weather.temperature >= 5 && weather.temperature <= 35) {
      score += 3;
      reasons.push('acceptable temperature');
    } else {
      score += 1;
      reasons.push('extreme temperature');
    }

    // Precipitation scoring
    if (weather.precipitation === 0) {
      score += 8;
      reasons.push('dry conditions');
    } else if (weather.precipitation < 2) {
      score += 4;
      reasons.push('light precipitation');
    } else {
      score += 1;
      reasons.push('rainy');
    }

    // Wind scoring
    if (weather.windSpeed < 20) {
      score += 4;
      reasons.push('calm conditions');
    } else if (weather.windSpeed < 40) {
      score += 2;
      reasons.push('breezy');
    } else {
      reasons.push('windy');
    }

    return {
      type: ActivityType.OUTDOOR_SIGHTSEEING,
      score: Math.min(10, Math.round(score / 2)),
      reason: reasons.join(', '),
    };
  },
};

export default activityService;