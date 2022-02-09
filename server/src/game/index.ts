import { serverState } from '../state';
import { updateUserInput } from '../client/input';
import { playerToRender, updateAllPlayers } from './players';
import { ETextureKey } from '../../../shared/types';
import { getRandomInt } from '../../../shared/utils/random';

export function gameLoop() {
  const prevUpdateTime = Date.now();
  const deltaMs = prevUpdateTime - serverState.prevUpdateTime;
  serverState.prevUpdateTime = prevUpdateTime;
  serverState.deltaMs = deltaMs;

  // update input controls,
  updateUserInput();

  updateAllPlayers();

  if (!serverState.gamePaused) {
    serverState.clients
      .filter((c) => c.inGame)
      .forEach((c) => {
        const clientId = c.socket.id;
        const clientUserInput = serverState.userInput[clientId];
        let player = serverState.gameState.players.find(
          (p) => p.clientId === clientId
        );

        if (!player) {
          // init new player
          player = {
            clientId,
            position: {
              x: getRandomInt(-300, 300),
              y: getRandomInt(-150, 150),
            },
            texture: ETextureKey.CRAFT_DEFAULT,
            direction: 0,
            health: 1,
            scale: 1,
          };
          serverState.gameState.players.push(player);
        }

        c.socket.emit('update', {
          cameraOffset: { ...player.position }, // follow player for now
          actors: serverState.gameState.players.map(playerToRender), // will want to filter this to only in view later on
          // actors: [
          //   playerToRender(player)
          // ], // filtered by what is inside user's display (todo this would need to emit separately to each client)
          fire1: clientUserInput?.fire1.downMs || 0,
          fwdThrst: clientUserInput?.forwardThruster || 0,
          trnThrst: clientUserInput?.turnThruster || 0,
          debug: {
            serverDeltaMs: { value: deltaMs },
            userInputs: serverState.userInput,
          },
        });
      });
  }

  if (serverState.gameRunning) {
    // setTimeout(gameLoop, 100);
    setTimeout(gameLoop, 10);
  }
}
