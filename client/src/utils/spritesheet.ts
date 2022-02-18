import { identity, reduce, times } from 'ramda';
import { crafts, ICraftSpec } from '../../../shared/specs/craft';
import { IRect } from '../../../shared/types';

// generate frame rects for animations etc...
export const getFrameRects = ({
  width = 32,
  height = 32,
  columns = 3,
  total = 10,
}): IRect[] => {
  const rows = Math.ceil(total / columns);
  return reduce((acc: IRect[], rowIndex: number) => {
    return [
      ...acc,
      ...reduce((rowFrames: IRect[], colIndex: number) => {
        const frameIndex = rowIndex * columns + colIndex;
        if (frameIndex < total) {
          return [
            ...rowFrames,
            { x: colIndex * width, y: rowIndex * height, width, height },
          ];
        }
        return [...rowFrames];
      }, [])(times(identity)(columns)),
    ];
  }, [])(times(identity)(rows));
};

const getCraftImageUrl = (craftKey: keyof typeof crafts): string => {
  return {
    spacecraft: '../static/assets/images/sprites/craft_spritesheet.png',
    spaceDumper: '../static/assets/images/sprites/garbage-ship-one100x84.png',
  }[craftKey];
};

export const getCraftSpec = (craftKey: keyof typeof crafts): ICraftSpec => {
  return {
    ...crafts[craftKey],
    imageUrl: getCraftImageUrl(craftKey),
  };
};
