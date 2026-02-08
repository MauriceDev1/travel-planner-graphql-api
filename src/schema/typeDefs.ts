const typeDefs = `#graphql
  type City {
    id: ID!
    name: String!
    country: String!
    latitude: Float!
    longitude: Float!
    region: String
  }

  type Weather {
    temperature: Float!
    condition: String!
    precipitation: Float!
    windSpeed: Float!
    humidity: Float
    timestamp: String!
  }

  type WeatherForecast {
    city: City!
    current: Weather!
    forecast: [Weather!]!
  }

  enum ActivityType {
    SKIING
    SURFING
    INDOOR_SIGHTSEEING
    OUTDOOR_SIGHTSEEING
  }

  type Activity {
    type: ActivityType!
    score: Float!
    recommended: Boolean!
    reason: String!
  }

  type ActivityRanking {
    city: City!
    weather: Weather!
    activities: [Activity!]!
  }

  type Query {
    """
    Search for cities using Mapbox geocoding (minimum 2 characters)
    """
    searchCities(query: String!): [City!]!

    """
    Get current and short-term forecast from OpenMeteo for the given coordinates
    """
    getWeatherForecast(latitude: Float!, longitude: Float!): WeatherForecast

    """
    Get activity recommendations based on current weather
    """
    getActivityRankings(latitude: Float!, longitude: Float!): ActivityRanking
  }
`;

export default typeDefs;
