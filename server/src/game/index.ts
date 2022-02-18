import { serverState } from '../state';
import { updateUserInput } from '../client/input';
import { playerToRender, updateAllPlayers } from './players';
import {
  ETextureKey,
  IBullet,
  IRenderActor,
  IVector,
} from '../../../shared/types';
import { getRandomInt } from '../../../shared/utils/random';
import {
  defaultVector,
  getDirection,
  getDistance,
} from '../../../shared/utils/physics';
import { initActor, updateBullet } from './actor';
import { handleCollisions } from './collision';

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
    // update stuff here for all clients
    updateAllPlayers();

    serverState.gameState.bullets = serverState.gameState.bullets
      .map(updateBullet)
      .filter((b) => b.life > 0);

    // handle collisions
    handleCollisions();

    // ai etc

    // emit to clients/players
    serverState.clients
      .filter((c) => c.inGame)
      .forEach((c) => {
        // client specific code here
        const clientId = c.socket.id;
        const clientUserInput = serverState.userInput[clientId];
        let player = serverState.gameState.players.find(
          (p) => p.clientId === clientId
        );

        if (!player) {
          // should we continue to emit to player?
          // maybe follow the player that killed them??
          return;
        }

        const players = serverState.gameState.players.map((p) => ({
          ...p,
          isYou: p.clientId === clientId ? true : undefined,
        }));

        // export function updateCamera(game) {
        //   const player = game.player;
        //   const world = getAsset(game.containers.world);
        //   // world.pivot.x = player.data.x;
        //   // world.pivot.y = player.data.y;
        //   // LERP it
        //   world.pivot.x += (player.data.x - world.pivot.x) * 0.15;
        //   world.pivot.y += (player.data.y - world.pivot.y) * 0.15;
        // }
        const cameraOffset = { ...player.position }; // todo make this like above (following player)

        const shouldRender =
          (camOffset: IVector) => (obj: IBullet | IRenderActor) =>
            getDistance(camOffset, obj.position) < 700;

        const otherPlayers = players
          .filter((p) => p.clientId !== clientId)
          .map((p) => ({
            ...p,
            distanceFromPlayer: getDistance(player?.position, p.position),
          }))
          .sort((a, b) => {
            return a.distanceFromPlayer > b.distanceFromPlayer ? 1 : -1;
          });

        const nearestPlayer = otherPlayers[0];

        // const closestTarget = [... =].sort((a,b) => {
        //   return getDistance(player.position, a)
        // })

        c.socket.emit('update', {
          cameraOffset,
          actors: players
            .map(playerToRender)
            .filter(shouldRender(cameraOffset)), // will want to filter this to only in view later on
          bullets: serverState.gameState.bullets.filter(
            shouldRender(cameraOffset)
          ), // will want to filter this to only in view later on
          fire1: clientUserInput?.fire1.downMs || 0,
          fwdThrst: clientUserInput?.forwardThruster || 0,
          trnThrst: clientUserInput?.turnThruster || 0,
          nearestTarget: nearestPlayer
            ? {
                distance: nearestPlayer.distanceFromPlayer,
                direction: getDirection(
                  player.position,
                  nearestPlayer.position
                ),
                position: nearestPlayer.position,
              }
            : undefined,
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
