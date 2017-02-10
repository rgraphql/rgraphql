import { parse, print } from 'graphql';
import {
  simplifyQueryAst,
} from './graphql';

function mockAst() {
  return parse(`
fragment PersonDetails on Person {
  name(maxLen: 5)
}

query myQuery {
  allPeople {
    ...PersonDetails
  }
}
`);
}

describe('graphql-util', () => {
  describe('simplifyQueryAst', () => {
    it('should simplify a basic query with fragment spreads', () => {
      let ast = mockAst();
      ast = simplifyQueryAst(ast);
      console.log(print(ast));
    });
  });
});
