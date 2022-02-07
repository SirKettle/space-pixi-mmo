
import * as T from '../../../shared/types';
import { IButtonState, EButtonStatus, IUserInputState, TClient } from '../types';
import { serverState } from '../state';

const defaultButtonState: IButtonState = {
  downMs: 0,
  status: EButtonStatus.INACTIVE
}

const defaultUserInputState: IUserInputState = {
  fire1: { ...defaultButtonState },
  activeActions: [],
  forwardThruster: 0, turnThruster: 0, strafeThruster: 0,
};

export const handleKeyDown = (
  socket: TClient
) => (
  action: T.EInputAction
) => {
  if (!serverState.userInput[socket.id]) {
    console.log('keyDown init user input');
    serverState.userInput[socket.id] = { ...defaultUserInputState };
  }

  const userInput = serverState.userInput[socket.id];
  userInput.activeActions.push(action);
  
  switch (action) {
    case T.EInputAction.FIRE_1: {
      userInput.fire1 = {
        status: EButtonStatus.DOWN,
        downMs: 0
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
}

export const handleKeyUp = (
  socket: TClient
) => (
  action: T.EInputAction
) => {
  if (!serverState.userInput[socket.id]) {
    console.log('keyUp init user input');
    serverState.userInput[socket.id] = { ...defaultUserInputState };
  }

  const userInput = serverState.userInput[socket.id];
  userInput.activeActions = userInput.activeActions.filter(a => a !== action);

  switch (action) {
    case T.EInputAction.FIRE_1: {
      userInput.fire1.status = EButtonStatus.UP;
      return;
    }
    case T.EInputAction.FORWARD: {
      // naive approach - would need to use cache to get exact reverse thruster if supporting analogue joystick
      userInput.forwardThruster = userInput.activeActions.includes(T.EInputAction.REVERSE) ? -1 : 0;
      return;
    }
    case T.EInputAction.REVERSE: {
      // naive approach - would need to use cache to get exact reverse thruster if supporting analogue joystick
      userInput.forwardThruster = userInput.activeActions.includes(T.EInputAction.FORWARD) ? 1 : 0;
      return;
    }
    case T.EInputAction.TURN_RIGHT: {
      // naive approach - would need to use cache to get exact reverse thruster if supporting analogue joystick
      userInput.turnThruster = userInput.activeActions.includes(T.EInputAction.TURN_LEFT) ? -1 : 0;
      return;
    }
    case T.EInputAction.TURN_LEFT: {
      // naive approach - would need to use cache to get exact reverse thruster if supporting analogue joystick
      userInput.turnThruster = userInput.activeActions.includes(T.EInputAction.TURN_RIGHT) ? 1 : 0;
      return;
    }
    default:
      return;
  }
}

export const updateUserInput = (deltaMs: number) => {
  Object.keys(serverState.userInput).forEach(clientId => {
    const clientUserInput = serverState.userInput[clientId];
    if (clientUserInput.fire1.status === EButtonStatus.DOWN) {
      clientUserInput.fire1.downMs = clientUserInput.fire1.downMs + deltaMs;
      // console.log(clientId + ' fire ' + clientUserInput.fire1.downMs);
    }
    if (clientUserInput.fire1.status === EButtonStatus.UP) {
      // console.log(clientId + ' fire with ' + clientUserInput.fire1.downMs + 'ms of power');
      clientUserInput.fire1 = { ...defaultButtonState };
    }
    // if (clientUserInput.turnThruster < 0) {
    //   console.log(clientId + ' turning left ' + clientUserInput.turnThruster);
    // }
    // if (clientUserInput.turnThruster > 0) {
    //   console.log(clientId + ' turning right ' + clientUserInput.turnThruster);
    // }
    // if (clientUserInput.forwardThruster < 0) {
    //   console.log(clientId + ' reversing ' + clientUserInput.forwardThruster);
    // }
    // if (clientUserInput.forwardThruster > 0) {
    //   console.log(clientId + ' accelerating ' + clientUserInput.forwardThruster);
    // }
  })
}