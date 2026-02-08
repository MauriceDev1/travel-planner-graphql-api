# Travel Planner GraphQL API

A scalable and maintainable GraphQL API that powers intelligent travel planning by providing weather forecasts and activity recommendations for cities worldwide.

## Features

- **City Suggestions** – Search for cities using Mapbox geocoding
- **Weather Data** – Retrieve current or near-term weather conditions from the OpenMeteo API
- **Activity Ranking** – Rank activities based on weather suitability:
  - Skiing
  - Surfing
  - Indoor sightseeing
  - Outdoor sightseeing
- **GraphQL API** – Strongly typed schema with flexible querying
- **Testing** – Unit and basic integration tests for core logic
- **TypeScript** – Type-safe implementation throughout

## Project Structure
```
src/
├── schema/
│   ├── typeDefs.ts          # GraphQL schema definitions
│   └── resolvers.ts         # Resolver implementations
├── services/
│   ├── weatherService.ts    # OpenMeteo API integration
│   ├── geocodingService.ts  # City search logic
│   └── activityService.ts   # Activity ranking logic
├── models/
│   └── types.ts             # TypeScript interfaces
├── utils/
│   ├── cache.ts             # Simple caching (optional)
│   └── errors.ts            # Custom error handling
├── __tests__/
│   ├── integration/
│   └── unit/
└── index.ts                 # Server entry point
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/travel-planner-graphql-api.git
cd travel-planner-graphql-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=4000
NODE_ENV=development
MAPBOX_ACCESS_TOKEN=*****
```

4. **Run the development server**
```bash
npm run dev
```

5. **Access GraphQL Playground**

Open your browser and navigate to:
```
http://localhost:4000/graphql
```

## Example Queries

### Search for a city
```graphql
query SearchCities($query: String!) {
  searchCities(query: $query) {
    country
    latitude
    longitude
    name
  }
}
```

### Get weather forecast
```graphql
query {
  getWeather(latitude: 51.5074, longitude: -0.1278) {
    date
    temperature
    condition
    precipitation
  }
}
```

### Get activity recommendations
```graphql
query {
  getActivities(
    latitude: 51.5074
    longitude: -0.1278
    preferences: ["museums", "parks", "restaurants"]
  ) {
    name
    suitabilityScore
    reason
  }
}
```

## Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Technology Stack

- **Apollo Server** - GraphQL server implementation
- **TypeScript** - Type-safe development
- **Node.js** - Runtime environment
- **OpenMeteo API** - Weather data provider
- **Jest** - Testing framework

## Author

Maurice Volkwyn - [LinkedIn](https://www.linkedin.com/in/maurice-volkwyn-6920041b2/)