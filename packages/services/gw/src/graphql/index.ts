/**
 * This stitches together our complete schema.
 *
 */

// TypeGraphQL
import { GraphQLSchema } from 'graphql';
import { buildSchemaSync } from 'type-graphql';

// Import our GraphQL API piece by piece
// Each module here returns a TypeGraphQL resolver

// Our stuff
import { graphQlAuthCheck } from './auth.check';
import { PingResolver } from './ping/resolvers';

type NonEmptyArray<TItem> = [TItem, ...TItem[]];

// Our array of resolvers
const resolvers: NonEmptyArray<Function> = [PingResolver];

// Build our schema
const schema: GraphQLSchema = buildSchemaSync({
  authChecker: graphQlAuthCheck,
  resolvers,
  validate: false
});

// Export our schema!
export default schema;
