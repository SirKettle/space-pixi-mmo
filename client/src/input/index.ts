import * as T from '../../../shared/types';
import { TSocket } from '~types';

export const subscribeToInputEvents = (socket: TSocket) => {
  const joinBtn = document.getElementById('joinBtn');
  const leaveBtn = document.getElementById('leaveBtn');

  function handleKey(key: string, inputAction: 'keyDown' | 'keyUp') {
    switch (key.toLowerCase()) {
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
    handleKey(ev.key, 'keyUp');
  });

  joinBtn?.addEventListener('click', () => {
    socket.emit('joinGame');
  });
  leaveBtn?.addEventListener('click', () => {
    socket.emit('leaveGame');
  });
};
