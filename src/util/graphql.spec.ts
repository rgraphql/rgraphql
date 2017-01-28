import { astValueToProto } from './graphql';
import { parseValue } from 'graphql';
import {
  IASTValue,
  ASTValueKind,
} from 'rgraphql';

describe('astValueToProto', () => {
  it('should convert a int', () => {
    expect(astValueToProto(parseValue('2'))).toEqual(<IASTValue>{
      intValue: 2,
      kind: ASTValueKind.AST_VALUE_INT,
    });
  });
  it('should convert a string', () => {
    expect(astValueToProto(parseValue('"test"'))).toEqual(<IASTValue>{
      stringValue: 'test',
      kind: ASTValueKind.AST_VALUE_STRING,
    });
  });
  it('should convert a bool', () => {
    expect(astValueToProto(parseValue('true'))).toEqual(<IASTValue>{
      boolValue: true,
      kind: ASTValueKind.AST_VALUE_BOOL,
    });
  });
  it('should convert a list', () => {
    expect(astValueToProto(parseValue('[true, "test"]'))).toEqual(<IASTValue>{
      listValue: [{
        boolValue: true,
        kind: ASTValueKind.AST_VALUE_BOOL,
      }, {
        stringValue: 'test',
        kind: ASTValueKind.AST_VALUE_STRING,
      }],
      kind: ASTValueKind.AST_VALUE_LIST,
    });
  });
  it('should convert a float', () => {
    expect(astValueToProto(parseValue('0.2'))).toEqual(<IASTValue>{
      floatValue: 0.2,
      kind: ASTValueKind.AST_VALUE_FLOAT,
    });
  });
  it('should convert a object', () => {
    expect(astValueToProto(parseValue('{test: 1.0}'))).toEqual(<IASTValue>{
      kind: ASTValueKind.AST_VALUE_OBJECT,
      objectFields: [{
        key: 'test',
        value: {
          floatValue: 1.0,
          kind: ASTValueKind.AST_VALUE_FLOAT,
        },
      }],
    });
  });
  it('should convert null', () => {
    expect(astValueToProto(parseValue('null'))).toEqual(<IASTValue>{
      kind: ASTValueKind.AST_VALUE_NULL,
    });
  });
});
