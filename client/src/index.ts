import 'regenerator-runtime/runtime';
import { Loader } from 'pixi.js';
import { logGameCredits } from '~utils/log';
import { connectToServer, startPinging } from '~api';
import { subscribeToInputEvents } from '~input';
import { preInitGame, initGame } from '~game';
import { clientState } from '~state';

const initialize = () => {
  logGameCredits();
  preInitGame();

  // const loader = Loader.shared;

  // loader.add()

  connectToServer().then((socket) => {
    // display choose craft screen;

    clientState.craftKey = 'spaceDumper';

    initGame();
    startPinging(socket);
    subscribeToInputEvents(socket);
  });
};

if (document.readyState === 'loading') {
  console.log('wait for DOM to load');
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  console.log('DOM already loaded');
  initialize();
}

// console.log(1);
// initGame();
