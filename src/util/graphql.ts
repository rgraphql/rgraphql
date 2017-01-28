import {
  ValueNode,
  BooleanValueNode,
  ListValueNode,
  ObjectValueNode,
  ArgumentNode,
} from 'graphql';
import {
  IASTValue,
  ASTValueKind,
  IASTObjectField,
  IFieldArgument,
} from 'rgraphql';

interface StringedValue {
  value: string;
}

export function astValueToProto(node: ValueNode): IASTValue {
  let sv: StringedValue = <any>node;
  let res: IASTValue = {
    kind: ASTValueKind.AST_VALUE_NULL,
  };
  switch (node.kind) {
    case 'FloatValue':
      res.kind = ASTValueKind.AST_VALUE_FLOAT;
      res.floatValue = +sv.value;
      break;
    case 'IntValue':
      res.kind = ASTValueKind.AST_VALUE_INT;
      res.intValue = +sv.value;
      break;
    case 'EnumValue':
      res.kind = ASTValueKind.AST_VALUE_ENUM;
      res.stringValue = sv.value;
      break;
    case 'StringValue':
      res.kind = ASTValueKind.AST_VALUE_STRING;
      res.stringValue = sv.value;
      break;
    case 'BooleanValue':
      res.kind = ASTValueKind.AST_VALUE_BOOL;
      res.boolValue = (<BooleanValueNode>node).value;
      break;
    case 'NullValue':
      break;
    case 'ListValue':
      let lv: ListValueNode = node;
      let resa: IASTValue[] = [];
      for (let subv of lv.values) {
        resa.push(astValueToProto(subv));
      }
      res.listValue = resa;
      res.kind = ASTValueKind.AST_VALUE_LIST;
      break;
    case 'ObjectValue':
      let ov: ObjectValueNode = node;
      let reso: IASTObjectField[] = res.objectFields = [];
      for (let field of ov.fields) {
        reso.push({
          key: field.name.value,
          value: astValueToProto(field.value),
        });
      }
      res.kind = ASTValueKind.AST_VALUE_OBJECT;
      break;
    default:
      break;
  }

  return res;
}

export function astArgumentsToProto(args: ArgumentNode[]): IFieldArgument[] {
  let res: IFieldArgument[] = [];

  for (let arg of args) {
    res.push({
      name: arg.name ? arg.name.value : null,
      value: astValueToProto(arg.value),
    });
  }

  return res;
}

/*
export function protoArgumentsToAST(args: IFieldArgument[]): ArgumentNode[] {
  let res: ArgumentNode[] = [];
  for (let arg of args) {
    res.push({
      kind: 'Argument',
      name: {kind: 'Name', value: arg.name},

    });
    res.push(arg.value)
  }
}
*/
