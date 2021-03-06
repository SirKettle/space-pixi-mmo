import { v4 as uuidV4 } from 'uuid';
import { crafts, ICraftSpec } from '../../shared/specs/craft';
import { IClient } from './types';

const counters = {
  playerId: 0,
};

const isUniqueUsername =
  (activeUserSessions: IClient[]) =>
  (username = '') => {
    return activeUserSessions.every((s) => s.user.username !== username);
  };

export const generateUsername =
  (clients: IClient[]) => (desiredUsername?: string) => {
    if (desiredUsername && isUniqueUsername(clients)(desiredUsername)) {
      return desiredUsername;
    }
    counters.playerId++;
    return `${desiredUsername || 'Player'}_${counters.playerId}`;
  };

export const generateUID = () => {
  return uuidV4();
};

export const getCraftSpec = (craftKey: keyof typeof crafts): ICraftSpec => {
  return {
    ...crafts[craftKey],
  };
};
