import 'regenerator-runtime/runtime';
import { logGameCredits } from '~utils/log';
import { connectToServer, startPinging } from '~api';
import { subscribeToInputEvents } from '~input';
import { initGame } from '~game';

logGameCredits();

connectToServer().then((socket) => {
  startPinging(socket);
  subscribeToInputEvents(socket);
  initGame();
});

// console.log(1);
// initGame();
