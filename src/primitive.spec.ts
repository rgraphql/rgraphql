import {
  PackPrimitive,
} from './primitive';
import {rgraphql} from './proto';

const Kind = rgraphql.RGQLPrimitive.Kind;
describe('PackPrimitive', () => {
  it('should pack a string', () => {
    expect(PackPrimitive('test')).toEqual({
      kind: Kind.PRIMITIVE_KIND_STRING,
      stringValue: 'test',
    });
  });
  it('should pack a int', () => {
    expect(PackPrimitive(1)).toEqual({
      kind: Kind.PRIMITIVE_KIND_INT,
      intValue: 1,
    });
  });
  it('should pack a float', () => {
    expect(PackPrimitive(1.05235)).toEqual({
      kind: Kind.PRIMITIVE_KIND_FLOAT,
      floatValue: 1.05235,
    });
  });
  it('should pack an empty array', () => {
    expect(PackPrimitive([])).toEqual({
      kind: Kind.PRIMITIVE_KIND_ARRAY,
    });
  });
  it('should pack a object', () => {
    expect(PackPrimitive({'hello': 'world'})).toEqual({
      kind: Kind.PRIMITIVE_KIND_OBJECT,
      stringValue: '{"hello":"world"}',
    });
  });
  it('should pack null', () => {
    expect(PackPrimitive(null)).toEqual({
      kind: Kind.PRIMITIVE_KIND_NULL,
    });
  });
});
