# 🌍 Travel Planner GraphQL API

A scalable and maintainable GraphQL API that powers intelligent travel planning by providing weather forecasts and activity recommendations for cities worldwide.

## ✨ Features

- 🔍 **City Search** - Find cities with geocoding support
- 🌤️ **Weather Forecasts** - 7-day weather predictions using OpenMeteo API
- 🎯 **Smart Activity Recommendations** - Get activity suggestions ranked by weather suitability
- ⚡ **GraphQL API** - Flexible, efficient data querying
- 🧪 **Comprehensive Testing** - Unit and integration test coverage
- 📦 **TypeScript** - Full type safety throughout

## 🏗️ Project Structure
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

## 🚀 Getting Started

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

## 📝 Available Scripts
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm start            # Run production server
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate test coverage report
npm run lint         # Lint code
npm run format       # Format code with Prettier
```

## 🔍 Example Queries

### Search for a city
```graphql
query {
  searchCities(query: "London") {
    name
    country
    latitude
    longitude
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

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## 🛠️ Technology Stack

- **Apollo Server** - GraphQL server implementation
- **TypeScript** - Type-safe development
- **Node.js** - Runtime environment
- **OpenMeteo API** - Weather data provider
- **Jest** - Testing framework

## 📄 API Documentation

Detailed API documentation is available in the [docs](./docs) folder or via GraphQL Playground when running the server.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

Your Name - Maurice Volkwyn (https://twitter.com/yourtwitter)

## 🙏 Acknowledgments

- [OpenMeteo](https://open-meteo.com/) for providing free weather data
- Apollo team for the excellent GraphQL implementation