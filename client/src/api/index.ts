import { io } from 'socket.io-client';
import { TSocket } from '~types';
import { clientState } from '~state';

const apiUrl = location.protocol + '//' + location.hostname + ':' + 3009;

export const connectToServer = (): Promise<TSocket> =>
  new Promise((resolve, reject) => {
    console.log('connecting to server...' + apiUrl);

    const socket: TSocket = io(apiUrl);

    clientState.socket = socket;

    socket.on('connect', () => {
      console.log('connected to server!');
      clientState.connected = true;

      resolve(socket);
    });

    socket.on('connect_error', (e) => {
      console.log('connect error');
      clientState.connected = false;
      reject(e);
    });

    socket.on('pingTestResponse', (startTimestamp) => {
      clientState.pingRoundtripMs = Date.now() - startTimestamp;
      clientState.pingMs = clientState.pingRoundtripMs / 2;
    });

    socket.on('disconnect', () => {
      clientState.connected = false;
    });

    socket.on('activeUsersUpdate', (activeUsers) => {
      console.log('activeUsers update', activeUsers);

      clientState.activeUsers = activeUsers;
    });

    socket.on('update', (d) => {
      clientState.gameState = d;
    });

    // socket.emit('joinGame');
  });

export const startPinging = (socket: TSocket) => {
  socket.emit('pingTest', Date.now());
  setInterval(() => {
    socket.emit('pingTest', Date.now());
  }, 5000);
};
