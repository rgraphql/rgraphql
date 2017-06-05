import {
  IRGQLServerMessage,
  IRGQLClientMessage,
} from 'rgraphql';

// A message transport for rGraphQL messages.
export interface ITransport {
  // Soyuz will call this function with a callback function for handling messages.
  onMessage(cb: (mes: IRGQLServerMessage) => void): void;
  // Soyuz will call this function with outgoing messages for the server.
  send(msg: IRGQLClientMessage): void;
  // nextQueryId gets the next available query ID.
  nextQueryId(): number;
}
