import * as T from '../../../shared/types';
import {
  IButtonState,
  EButtonStatus,
  IUserInputState,
  TClient,
} from '../types';
import { serverState } from '../state';
import { getVelocity } from '../../../shared/utils/physics';

const defaultButtonState: IButtonState = {
  downMs: 0,
  status: EButtonStatus.INACTIVE,
};

const defaultUserInputState = (): IUserInputState => ({
  fire1: { ...defaultButtonState },
  activeActions: [],
  forwardThruster: 0,
  turnThruster: 0,
  strafeThruster: 0,
});

export const handleKeyDown = (socket: TClient) => (action: T.EInputAction) => {
  if (!serverState.userInput[socket.id]) {
    serverState.userInput[socket.id] = defaultUserInputState();
  }

  const userInput = serverState.userInput[socket.id];
  userInput.activeActions.push(action);

  switch (action) {
    case T.EInputAction.FIRE_1: {
      userInput.fire1 = {
        status: EButtonStatus.DOWN,
        downMs: 0,
      };
      return;
    }
    case T.EInputAction.FORWARD: {
      userInput.forwardThruster = 1;
      return;
    }
    case T.EInputAction.REVERSE: {
      userInput.forwardThruster = -1;
      return;
    }
    case T.EInputAction.TURN_RIGHT: {
      userInput.turnThruster = 1;
      return;
    }
    case T.EInputAction.TURN_LEFT: {
      serverState.userInput[socket.id].turnThruster = -1;
      return;
    }
    default:
      return;
  }
};

export const handleKeyUp = (socket: TClient) => (action: T.EInputAction) => {
  if (!serverState.userInput[socket.id]) {
    console.log('keyUp init user input');
    serverState.userInput[socket.id] = defaultUserInputState();
  }

  const userInput = serverState.userInput[socket.id];
  userInput.activeActions = userInput.activeActions.filter((a) => a !== action);

  switch (action) {
    case T.EInputAction.FIRE_1: {
      userInput.fire1.status = EButtonStatus.UP;
      return;
    }
    case T.EInputAction.FORWARD: {
      // naive approach - would need to use cache to get exact reverse thruster if supporting analogue joystick
      userInput.forwardThruster = userInput.activeActions.includes(
        T.EInputAction.REVERSE
      )
        ? -1
        : 0;
      return;
    }
    case T.EInputAction.REVERSE: {
      // naive approach - would need to use cache to get exact reverse thruster if supporting analogue joystick
      userInput.forwardThruster = userInput.activeActions.includes(
        T.EInputAction.FORWARD
      )
        ? 1
        : 0;
      return;
    }
    case T.EInputAction.TURN_RIGHT: {
      // naive approach - would need to use cache to get exact reverse thruster if supporting analogue joystick
      userInput.turnThruster = userInput.activeActions.includes(
        T.EInputAction.TURN_LEFT
      )
        ? -1
        : 0;
      return;
    }
    case T.EInputAction.TURN_LEFT: {
      // naive approach - would need to use cache to get exact reverse thruster if supporting analogue joystick
      userInput.turnThruster = userInput.activeActions.includes(
        T.EInputAction.TURN_RIGHT
      )
        ? 1
        : 0;
      return;
    }
    default:
      return;
  }
};

export const updateUserInput = () => {
  Object.keys(serverState.userInput).forEach((clientId) => {
    const clientUserInput = serverState.userInput[clientId];
    if (clientUserInput.fire1.status === EButtonStatus.DOWN) {
      clientUserInput.fire1.downMs =
        clientUserInput.fire1.downMs + serverState.deltaMs;
    }
    if (clientUserInput.fire1.status === EButtonStatus.UP) {
      const player = serverState.gameState.players.find(
        (p) => p.clientId === clientId
      );
      if (player) {
        player.shots = (player.shots || 0) + 1;
        const firePower =
          Math.min(1, clientUserInput.fire1.downMs / 500) * 0.8 + 0.2;
        const speed = 10 + firePower * 10;
        const velocity = getVelocity({ speed, rotation: player.rotation });
        serverState.gameState.bullets.push({
          isBullet: true,
          position: { ...player.position },
          velocity,
          rotation: 0,
          firedBy: player.clientId,
          life: 2 + firePower * 2,
          power: firePower * 50,
          mass: firePower * 5,
          radius: 10 * (0.25 + firePower * 0.75),
        });
      }
      clientUserInput.fire1 = { ...defaultButtonState };
    }
  });
};

export const resetUserInput = (clientId: string) => {
  serverState.userInput[clientId] = defaultUserInputState();

  console.log('resett user input for ', clientId);
};
