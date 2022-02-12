import * as T from '../../../shared/types';
import { TSocket } from '~types';

export const subscribeToInputEvents = (socket: TSocket) => {
  const joinBtn = document.getElementById('joinBtn');
  const leaveBtn = document.getElementById('leaveBtn');

  function handleKey(e: KeyboardEvent, inputAction: 'keyDown' | 'keyUp') {
    const key = e.key.toLowerCase();
    const keysToHandle = [
      ' ',
      'arrowleft',
      'arrowright',
      'arrowup',
      'arrowdown',
      'a',
      'w',
      's',
      'd',
    ];
    if (!keysToHandle.includes(key)) {
      return;
    }

    e.preventDefault();

    if (e.repeat) {
      return;
    }

    switch (e.key.toLowerCase()) {
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
  window.addEventListener('keydown', (e) => {
    handleKey(e, 'keyDown');
  });

  window.addEventListener('keyup', (e) => {
    handleKey(e, 'keyUp');
  });

  joinBtn?.addEventListener('click', () => {
    socket.emit('joinGame');
  });
  leaveBtn?.addEventListener('click', () => {
    socket.emit('leaveGame');
  });
};
