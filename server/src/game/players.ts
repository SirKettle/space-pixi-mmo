import { ETextureKey, IRenderActor } from '../../../shared/types';
import { normalizeDirection } from '../../../shared/utils/physics';
import { IPlayerState } from '../types';
import { omit } from 'ramda';
import { serverState } from '../state';

const craftTurningSpeed = 0.8;

export const updatePlayer = (p: IPlayerState): IPlayerState => {
  const player = { ...p };
  const userInput = serverState.userInput[p.clientId];
  const { deltaMs } = serverState;
  if (!userInput) {
    return player;
  }

  // rotating the player
  player.texture = ETextureKey.CRAFT_DEFAULT;

  if (userInput.turnThruster !== 0) {
    // todo: use pixi one logic
    player.direction = normalizeDirection(
      player.direction +
        userInput.turnThruster * deltaMs * 0.01 * craftTurningSpeed
    );

    player.texture =
      userInput.turnThruster < 0
        ? ETextureKey.CRAFT_LEFT
        : ETextureKey.CRAFT_RIGHT;
  }

  // moving the player - TODO

  return player;
};

export const updateAllPlayers = () => {
  serverState.gameState.players =
    serverState.gameState.players.map(updatePlayer);
};

export const playerToRender = (player: IPlayerState): IRenderActor => {
  return omit(['clientId'], player);
};
