import 'regenerator-runtime/runtime';
import { logGameCredits } from '~utils/log';
import { connectToServer, startPinging } from '~api';
import { subscribeToInputEvents } from '~input';
import { preInitGame, initGame } from '~game';

const initialize = () => {
  logGameCredits();
  preInitGame();

  connectToServer().then((socket) => {
    initGame();
    startPinging(socket);
    subscribeToInputEvents(socket);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
