import 'regenerator-runtime/runtime';
import { logGameCredits } from '~utils/log';
import { connectToServer, startPinging } from '~api';
import { subscribeToInputEvents } from '~input';
import { preInitGame, initGame } from '~game';

logGameCredits();

preInitGame();
connectToServer().then((socket) => {
  initGame();
  startPinging(socket);
  subscribeToInputEvents(socket);
});

// console.log(1);
// initGame();
