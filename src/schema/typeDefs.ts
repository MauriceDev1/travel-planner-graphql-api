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
    conditions: String!
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

  type Activity {
    name: String!
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
    Search for cities by name (minimum 2 characters)
    """
    searchCities(query: String!): [City!]!

    """
    Get weather forecast for a specific city
    """
    getWeatherForecast(cityId: String!): WeatherForecast

    """
    Get activity recommendations based on current weather
    """
    getActivityRankings(cityId: String!): ActivityRanking
  }
`;

export default typeDefs;