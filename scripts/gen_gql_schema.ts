import { buildGqlSchema } from '../src/graphql/schema';

let schema = buildGqlSchema(false, false);
console.log(schema);
