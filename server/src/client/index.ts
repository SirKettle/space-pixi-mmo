import { IClient, TClient, TIOServer } from '../types';
import { serverState } from '../state';
import { gameLoop } from '../game';
import { generateUsername } from '../utils';
import { handleKeyDown, handleKeyUp } from './input';

export const handleDisconnect = (io: TIOServer, client: IClient) => () => {
  console.log(`user disconnected: ${client.user.username}`);
  // Remove the current client
  serverState.clients = serverState.clients.filter(
    (s) => s.user.username !== client.user.username
  );

  // broadcast to all other users
  client.socket.broadcast.emit('playerLeft', client.user);
  // broadcast to all users
  io.emit(
    'activeUsersUpdate',
    serverState.clients.map((s) => s.user)
  );

  if (!serverState.clients.some((c) => c.inGame)) {
    serverState.gameRunning = false;
  }
};

export const handleJoinGame = (io: TIOServer, client: IClient) => () => {
  client.inGame = true;
  if (!serverState.gameRunning) {
    serverState.gameRunning = true;
    gameLoop();
  }
};

export const handleLeaveGame = (io: TIOServer, client: IClient) => () => {
  client.inGame = false;
  if (!serverState.clients.some((c) => c.inGame)) {
    serverState.gameRunning = false;
  }
};

export const handleToggleDebug = (io: TIOServer, client: IClient) => () => {};

export const handlePauseGame = (io: TIOServer, client: IClient) => () => {};

export const handleConnection = (io: TIOServer) => (socket: TClient) => {
  // create new client
  const client: IClient = {
    socket,
    inGame: false,
    startedISO: new Date().toISOString(),
    user: {
      username: generateUsername(Object.values(serverState.clients))(
        socket.data.username
      ),
    },
  };

  serverState.clients.push(client);

  // broadcast to all other users
  socket.broadcast.emit('playerJoined', client.user);
  // broadcast to all users
  io.emit(
    'activeUsersUpdate',
    serverState.clients.map((s) => s.user)
  );

  socket.on('disconnect', handleDisconnect(io, client));
  socket.on('pingTest', (t) => {
    socket.emit('pingTestResponse', t);
  });

  // handle inputs
  socket.on('keyDown', handleKeyDown(socket));
  socket.on('keyUp', handleKeyUp(socket));

  // game events
  socket.on('joinGame', handleJoinGame(io, client));
  socket.on('leaveGame', handleLeaveGame(io, client));
  socket.on('pauseGame', handlePauseGame(io, client));
  socket.on('toggleDebug', handleToggleDebug(io, client));
};
