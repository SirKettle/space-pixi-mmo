import { Socket } from 'socket.io-client';
import * as T from '../../shared/types';

export type TSocket = Socket<T.IServerToClientEvents, T.IClientToServerEvents>;