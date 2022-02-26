import { pick } from 'ramda';
import { AUDIO_RANGE_PX } from '../../../shared/constants/audio';
import {
  IBullet,
  IPositionScale,
  IRenderActor,
  IRenderBullet,
  IRenderSfx,
  ISfx,
  IVector,
} from '../../../shared/types';
import { getDistance } from '../../../shared/utils/physics';

export const shouldRender =
  (cameraOffset: IVector) =>
  (obj: IRenderBullet | IRenderActor | IPositionScale) =>
    getDistance(cameraOffset, obj.position) < 700;

export const bulletToRender = (bullet: IBullet): IRenderBullet => {
  const renderKeys = ['position', 'radius', 'life'];
  return pick(renderKeys, bullet);
};

export const sfxToRender =
  (cameraOffset: IVector) =>
  (sfx: ISfx): IRenderSfx => {
    if (!sfx.position) {
      return { ...sfx };
    }

    const volAdj =
      (AUDIO_RANGE_PX - getDistance(cameraOffset, sfx.position)) /
      AUDIO_RANGE_PX;

    return {
      key: sfx.key,
      vol: sfx.vol * volAdj,
    };
  };
