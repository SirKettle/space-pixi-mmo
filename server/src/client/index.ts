import { IClient, TClient, TIOServer } from '../types';
import { serverState } from '../state';
import { gameLoop } from '../game';
import { generateUsername } from '../utils';
import { handleKeyDown, handleKeyUp, resetUserInput } from './input';
import { initActor } from '../game/actor';
import { getRandomInt } from '../../../shared/utils/random';
import { normalizeDirection } from '../../../shared/utils/physics';
import { crafts } from '../../../shared/specs/craft';

export function handleDisconnect(io: TIOServer, client: IClient) {
  return () => {
    handleLeaveGame(io, client);
    console.log(
      `user disconnected: ${client.user.username} (${client.socket.id})`
    );
    resetUserInput(client.socket.id);
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
}

export function handleJoinGame(io: TIOServer, client: IClient) {
  return (craftKey: keyof typeof crafts) => {
    console.log('add join game');
    client.inGame = true;

    if (!serverState.gameRunning) {
      serverState.gameRunning = true;
      gameLoop();
    }

    if (
      !serverState.gameState.players.find(
        (p) => p.clientId === client.socket.id
      )
    ) {
      console.log('add new player');
      serverState.gameState.players.push({
        clientId: client.socket.id,
        ...initActor({
          assetKey: craftKey,
          overrides: {
            position: {
              x: getRandomInt(-300, 300),
              y: getRandomInt(-200, 200),
            },
            rotation: normalizeDirection(Math.random() * Math.PI * 2),
            velocity: {
              x: Math.random() * 6 - 3,
              y: Math.random() * 6 - 3,
            },
          },
        }),
      });
    }
  };
}

export function handleLeaveGame(io: TIOServer, client: IClient) {
  return () => {
    console.log('handle leave game');
    client.inGame = false;
    if (!serverState.clients.some((c) => c.inGame)) {
      serverState.gameRunning = false;
    }
    serverState.gameState.players = serverState.gameState.players.filter(
      (p) => p.clientId !== client.socket.id
    );
  };
}

export function handleToggleDebug(io: TIOServer, client: IClient) {
  return () => {};
}

export function handlePauseGame(io: TIOServer, client: IClient) {
  return () => {};
}

export function handleConnection(io: TIOServer) {
  return (socket: TClient) => {
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

    console.log(
      `user connected: ${client.user.username} (${client.socket.id})`
    );

    serverState.clients.push(client);
    resetUserInput(client.socket.id);

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
}
