import { DocumentNode } from 'graphql';

// Options when starting a mutation.
export interface IMutationOptions {
  // The parsed mutation.
  mutation: DocumentNode;
  // Data to fill variables with.
  variables?: { [name: string]: any };
}
