import * as protobuf from 'protobufjs';
import * as defs from './definitions';

let root = protobuf.Root.fromJSON(defs.PROTO_DEFINITIONS);
export const RGQLServerMessage = root.lookupType('rgraphql.RGQLServerMessage');
export const RGQLClientMessage = root.lookupType('rgraphql.RGQLClientMessage');
export const RGQLValue = root.lookupType('rgraphql.RGQLValue');
