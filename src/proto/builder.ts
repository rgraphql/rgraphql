import * as protobuf from 'protobufjs';
import * as defs from './definitions';

let root = protobuf.Root.fromJSON(defs.PROTO_DEFINITIONS);
export const RGQLServerMessage = root.lookup('rgraphql.RGQLServerMessage');
export const RGQLClientMessage = root.lookup('rgraphql.RGQLClientMessage');
