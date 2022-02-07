
import { io } from "socket.io-client";
import { logGameCredits } from "~utils/log";
import * as T from '../../shared/types';
import { TSocket } from './types';

const debugEl = document.getElementById('debug');
const joinBtn = document.getElementById('joinBtn');
const leaveBtn = document.getElementById('leaveBtn');

interface IClientState {
  connected: boolean;
  activeUsers: T.IUser[];
  pingMs?: number;
  pingRoundtripMs?: number;
  gameState?: T.IGameRenderUpdate;
}

const clientState: IClientState = {
  connected: false,
  activeUsers: [],
}

const apiUrl = location.protocol + '//' + location.hostname + ':' + 3009;

logGameCredits();

export const connectToServer = (): Promise<TSocket> => new Promise((resolve, reject) => {

  const socket: TSocket = io(apiUrl);
  
  socket.on('connect', () => {
    clientState.connected = true;
    resolve(socket);
  });

  socket.on('connect_error', (e) => {
    clientState.connected = false;
    reject(e);
  });

  socket.on('pingTestResponse', (startTimestamp) => {
    clientState.pingRoundtripMs = Date.now() - startTimestamp;
    clientState.pingMs = clientState.pingRoundtripMs / 2;
  })
  
  socket.on('disconnect', () => {
    clientState.connected = false;
  });
  
  socket.on('activeUsersUpdate', (activeUsers) => {
    console.log('activeUsers update', activeUsers);
    
    clientState.activeUsers = activeUsers;
  });

  socket.on('update', (d) => {
    clientState.gameState = d;
  })
});


const gameCache = {
  timeElapsedMs: 0,
  deltaMs: 0,
};
  


connectToServer().then(socket => {

  socket.emit('pingTest', Date.now());
  setInterval(() => {
    socket.emit('pingTest', Date.now());
  }, 5000);


  function handleKey(key: string, inputAction: 'keyDown' | 'keyUp') {
    switch(key.toLowerCase()) {
      case ' ':
        socket.emit(inputAction, T.EInputAction.FIRE_1);
        return;
      case 'arrowleft':
      case 'a':
        socket.emit(inputAction, T.EInputAction.TURN_LEFT);
        return;
      case 'arrowright':
      case 'd':
        socket.emit(inputAction, T.EInputAction.TURN_RIGHT);
        return;
      case 'arrowup':
      case 'w':
        socket.emit(inputAction, T.EInputAction.FORWARD);
        return;
      case 'arrowdown':
      case 's':
        socket.emit(inputAction, T.EInputAction.REVERSE);
        return;
    }
  }

  console.log('add key event listeners');
  window.addEventListener('keydown', (ev) => {
    if (ev.repeat) {
      return;
    }
    handleKey(ev.key, 'keyDown');
  });

  window.addEventListener('keyup', (ev) => {
    handleKey(ev.key, 'keyUp')
  });

  joinBtn?.addEventListener('click', () => { socket.emit('joinGame'); });
  leaveBtn?.addEventListener('click', () => { socket.emit('leaveGame'); });

  function gameLoopTest(timeElapsedMs: number) {
    const deltaMs = timeElapsedMs - gameCache.timeElapsedMs;
    gameCache.timeElapsedMs = timeElapsedMs;

    if (!debugEl) {
      return;
    }

    const fps = 1000 / deltaMs;

    debugEl.innerHTML = `
    <h1>DEBUG</h1> 
    <p>FPS: ${Math.round(fps)}</p>
    <p>deltaMs: ${Math.round(deltaMs)}</p>
    <p>ms: ${Math.round(timeElapsedMs)}</p>
    <p>connected: ${clientState.connected}</p>
    <p>users: ${clientState.activeUsers.map(u => u.username).join(', ')}</p>
    <p>fire: ${clientState.gameState?.fire1}</p>
    <p>thrust: ${clientState.gameState?.fwdThrst}</p>
    <p>turning: ${clientState.gameState?.trnThrst}</p>
    <p>ping (roundtrip): ${clientState.pingMs}ms (${clientState.pingRoundtripMs}ms)</p>
    <p>${JSON.stringify(clientState.gameState?.debug || {}, null, 1)}</p>
  `;

    requestAnimationFrame(gameLoopTest)
  }

  gameLoopTest(0);
});
