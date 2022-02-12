import { serverState } from '../state';
import { updateUserInput } from '../client/input';
import { playerToRender, updateAllPlayers } from './players';
import { ETextureKey } from '../../../shared/types';
import { getRandomInt } from '../../../shared/utils/random';
import { defaultVector } from '../../../shared/utils/physics';
import { initActor } from './actor';

export function gameLoop() {
  const prevUpdateTime = Date.now();
  const deltaMs = prevUpdateTime - serverState.prevUpdateTime;
  const delta = deltaMs / 17;
  serverState.prevUpdateTime = prevUpdateTime;
  serverState.delta = delta;
  serverState.deltaMs = deltaMs;

  // update input controls,
  updateUserInput();

  if (!serverState.gamePaused) {
    updateAllPlayers();
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
          console.log('new player for ', clientId);
          player = {
            clientId,
            ...initActor({
              assetKey: 'spacecraft',
              overrides: {
                position: {
                  x: getRandomInt(-300, 300),
                  y: getRandomInt(-150, 150),
                },
              },
            }),
          };
          serverState.gameState.players.push(player);
        }

        // export function updateCamera(game) {
        //   const player = game.player;
        //   const world = getAsset(game.containers.world);
        //   // world.pivot.x = player.data.x;
        //   // world.pivot.y = player.data.y;
        //   // LERP it
        //   world.pivot.x += (player.data.x - world.pivot.x) * 0.15;
        //   world.pivot.y += (player.data.y - world.pivot.y) * 0.15;
        // }

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
