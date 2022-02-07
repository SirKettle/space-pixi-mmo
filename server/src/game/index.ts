import { serverState } from '../state';
import { updateUserInput } from '../client/input';

export function gameLoop() {
  const prevUpdateTime = Date.now();
  const deltaMs = prevUpdateTime - serverState.prevUpdateTime;
  serverState.prevUpdateTime = prevUpdateTime;
  serverState.deltaMs = deltaMs;

  // update input controls,
  updateUserInput(deltaMs);

  if (!serverState.gamePaused) {
    serverState.clients.filter(c => c.inGame)
      .forEach(c => {
        const clientUserInput = serverState.userInput[c.socket.id];
        c.socket.emit('update', {
          cameraOffset: { x: 0, y: 0 },
          actors: [], // filtered by what is inside user's display (todo this would need to emit separately to each client)
          fire1: clientUserInput?.fire1.downMs || 0,
          fwdThrst: clientUserInput?.forwardThruster || 0,
          trnThrst: clientUserInput?.turnThruster || 0,
          debug: {
            serverDeltaMs: { value: deltaMs },
            userInputs: serverState.userInput,
          }
        })
      }); 
  }
  
  if (serverState.gameRunning) {
    // setTimeout(gameLoop, 100);
    setTimeout(gameLoop, 10);
  }
}