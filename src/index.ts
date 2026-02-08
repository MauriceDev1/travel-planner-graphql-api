import 'dotenv/config';  // <-- Add this first!
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import typeDefs from './schema/typeDefs';
import resolvers from './schema/resolvers';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error) => {
    console.error('GraphQL Error:', error);
    return {
      message: error.message,
      code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
      path: error.path,
    };
  },
});

const startServer = async () => {
  const PORT = parseInt(process.env.PORT || '4001', 10);
  
  // Verify token is loaded
  if (!process.env.MAPBOX_ACCESS_TOKEN) {
    console.error('MAPBOX_ACCESS_TOKEN is not set in .env file');
    process.exit(1);
  }
  
  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT },
    context: async () => ({}),
  });
  
  console.log(`Server ready at ${url}`);
  console.log(`GraphQL Playground available`);
  console.log(`Mapbox token loaded`);
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default server;