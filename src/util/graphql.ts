import {
  DocumentNode,
  ValueNode,
  VariableNode,
  OperationDefinitionNode,
  SelectionSetNode,
  FragmentDefinitionNode,
  FragmentSpreadNode,
  BooleanValueNode,
  ListValueNode,
  TypeNode,
  ListTypeNode,
  NamedTypeNode,
  ObjectFieldNode,
  ObjectValueNode,
  ArgumentNode,
  visit,
} from 'graphql';
import {
  IFieldArgument,
} from 'rgraphql';

interface StringedValue {
  value: string;
}

export function astValueToJs(node: ValueNode): any {
  let sv: StringedValue = <any>node;
  switch (node.kind) {
    case 'FloatValue':
    case 'IntValue':
      return +sv.value;
    case 'EnumValue':
    case 'StringValue':
    case 'BooleanValue':
      return sv.value;
    case 'NullValue':
      return null;
    case 'ListValue':
      let lv: ListValueNode = node;
      let resa: any[] = [];
      for (let subv of lv.values) {
        resa.push(astValueToJs(subv));
      }
      return resa;
    case 'ObjectValue':
      let ov: ObjectValueNode = node;
      let reso: any = {};
      for (let field of ov.fields) {
        reso[field.name.value] = astValueToJs(field.value);
      }
      return reso;
    default:
      break;
  }

  return undefined;
}

// What ast kinds are valid for this value?
export function validAstKinds(value?: any): { [kind: string]: boolean } {
  let isString = typeof value === 'string';
  return {
    'EnumValue': isString && value === value.toUpperCase(),
    'StringValue': isString,
    'BooleanValue': typeof value === 'boolean',
    'IntValue': typeof value === 'number' && (value % 1) === 0,
    'FloatValue': typeof value === 'number',
    'ListValue': !!value && typeof value === 'object' && value.constructor === Array,
    'ObjectValue': !!value && typeof value === 'object' && value.constructor !== Array,
    'NullValue': typeof value === 'object' && !value,
  };
}

// Check if a value matches an ast kind
export function isAstKind(kind: string, value?: any): boolean {
  let vac = validAstKinds(value);
  return vac[kind] || false;
}

export function jsToAstValue(value: any): ValueNode {
  let vac = validAstKinds(value);
  for (let kind in vac) {
    if (!vac.hasOwnProperty(kind)) {
      continue;
    }
    if (vac[kind]) {
      if (kind === 'ListValue') {
        let lavalue: ValueNode[] = [];
        for (let val of <any[]>value) {
          lavalue.push(jsToAstValue(val));
        }
        return <ListValueNode>{
          kind: kind,
          values: lavalue,
        };
      }
      if (kind === 'ObjectValue') {
        let fields: ObjectFieldNode[] = [];
        let ov: Object = value;
        for (let fieldName in ov) {
          if (!ov.hasOwnProperty(fieldName)) {
            continue;
          }
          fields.push({
            kind: 'ObjectField',
            name: {
              kind: 'Name',
              value: fieldName,
            },
            value: jsToAstValue(ov[fieldName]),
          });
        }
        return <ObjectValueNode>{
          kind: kind,
          fields: fields,
        };
      }
      return <any>{
        kind: kind,
        value: JSON.stringify(value),
      };
    }
  }
  return undefined;
}

export function astValueToType(value: ValueNode): TypeNode {
  if (value.kind === 'ListValue') {
    return <ListTypeNode>{
      kind: 'ListType',
      type: astValueToType((<ListValueNode>value).values[0]),
    };
  }
  return <NamedTypeNode>{
    kind: 'NamedType',
    name: {
      kind: 'Name',
      value: value.kind.substr(0, value.kind.length - 5),
    },
  };
}

// Simplifies a query by inlining all fragments, etc.
export function simplifyQueryAst(document: DocumentNode): DocumentNode {
  let operationDefs: OperationDefinitionNode[] = [];
  let fragmentDefs: { [name: string]: FragmentDefinitionNode } = {};

  // First pass, classify
  document = visit(document, {
    FragmentDefinition(node: FragmentDefinitionNode): any {
      fragmentDefs[node.name.value] = node;
      // delete this from the document
      return null;
    },
  }, null);

  // Second pass, replace fragment spreads.
  document = visit(document, {
    FragmentSpread(node: FragmentSpreadNode,
                   key: any,
                   parent: any,
                   path: any,
                     ancestors: SelectionSetNode[]): any {
      let fragName = node.name.value;
      let frag = fragmentDefs[node.name.value];
      if (!frag) {
        throw new Error('Fragment ' + fragName + ' not found in given query document.');
      }
      let ss = ancestors[ancestors.length - 1];
      for (let selection of frag.selectionSet.selections) {
        ss.selections.push(selection);
      }
      return null;
    },
  }, null);

  return document;
}
