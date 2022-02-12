import { ETextureKey } from '../types';
import { getHorizontalFrameRect } from '../utils/spritesheet';

export interface IHitArea {
  x: number; // offset percentage - ie. 0.5 is center of sprite
  y: number; // offset percentage - ie. 0.5 is center of sprite
  radius: number; // radius percentage - ie. 0.5 would probably cover sprite
}

export interface IFrameConfig {
  key: ETextureKey;
  rect: ReturnType<typeof getHorizontalFrameRect>;
}

export interface ICraftSpec {
  thrust: {
    forward: number;
    reverse: number;
    side: number;
    turn: number;
  };
  hitArea: {
    basic: IHitArea;
    precision?: IHitArea[];
  };
  initialData: {
    shield: number;
    life: number;
    mass: number;
    fuelCapacity: number;
  };
  imageUrl: string;
  frames: IFrameConfig[];
}

export const spacecraft: ICraftSpec = {
  thrust: {
    forward: 0.2,
    reverse: 0.1,
    side: 0.05,
    turn: 0.5,
  },
  hitArea: {
    basic: {
      x: 0.5,
      y: 0.5,
      radius: 0.5,
    },
  },
  initialData: {
    shield: 1,
    life: 200,
    mass: 100,
    fuelCapacity: 100,
  },
  imageUrl: '',
  frames: [
    // { key: 'hardLeft', rect: getHorizontalFrameRect(0, 32, 32) },
    { key: ETextureKey.CRAFT_LEFT, rect: getHorizontalFrameRect(1, 32, 32) },
    {
      key: ETextureKey.CRAFT_DEFAULT /* straight */,
      rect: getHorizontalFrameRect(2, 32, 32),
    },
    { key: ETextureKey.CRAFT_RIGHT, rect: getHorizontalFrameRect(3, 32, 32) },
    // { key: 'hardRight', rect: getHorizontalFrameRect(4, 32, 32) },
  ],
};

export const crafts = {
  spacecraft,
};
