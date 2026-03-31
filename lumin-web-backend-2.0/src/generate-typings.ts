import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
import { join } from 'path';

const args = process.argv.slice(2);
const watchMode = args.some((arg) => arg === '--watch');

const definitionsFactory = new GraphQLDefinitionsFactory();
definitionsFactory.generate({
  typePaths: ['./src/**/*.graphql'],
  path: join(process.cwd(), 'src/graphql.schema.ts'),
  outputAs: 'class',
  customScalarTypeMapping: {
    StringOrInt: 'number | string',
  },
  watch: watchMode,
});
