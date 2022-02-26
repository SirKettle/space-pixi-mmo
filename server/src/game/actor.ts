import { omit, path, pathOr, pick, prop, propEq, propOr, range } from 'ramda';
import { v4 as generateUid } from 'uuid';
import { crafts } from '../../../shared/specs/craft';
import { ETextureKey, IBullet, IVector } from '../../../shared/types';
// import { getAsset, removeAsset, setAsset } from '../../utils/assetStore';
// import { getFrameTextureId, getTextureId } from '../../utils/textures';
// import { getSpecs } from '../../specs/getSpecs';
import {
  combineVelocity,
  defaultVector,
  getDirection,
  getDistance,
  getVelocity,
  normalizeDirection,
} from '../../../shared/utils/physics';
import { getRandomInt } from '../../../shared/utils/random';
import { serverState } from '../state';
import { IActor } from '../types';
import { getCraftSpec } from '../utils';
// import { updateActorAi } from './ai';
// import { assignToChunk } from './world';
// import {
//   drawHitCircles,
//   getActorRadius,
//   getShouldUpdate,
//   getUpdateFrequency,
// } from '../../utils/actor';
// import { addExplosion } from '../../utils/particle';
// import { drawCircle } from '../../utils/graphics';

// export const createTile = (app, container) => (tile) => {
//   const { screen } = app;
//   const sprite = new TilingSprite(
//     getAsset(getTextureId(path(['data', 'assetKey'])(tile))),
//     screen.width,
//     screen.height
//   );
//   const spriteId = setAsset(sprite, { removable: true });
//   sprite.position.set(0, 0);
//   sprite.scale.set(pathOr(1, ['data', 'scale'])(tile));
//   sprite.alpha = path(['data', 'alpha'])(tile) || 1;
//   container.addChild(sprite);
//   return {
//     ...tile,
//     spriteId,
//   };
// };

export const updateBullet = (b: IBullet): IBullet => {
  const bullet = { ...b };
  const { delta, deltaMs } = serverState;

  bullet.velocity = applyAtmosphereToVelocity({
    velocity: bullet.velocity,
    atmosphere: 0.05,
    gravity: 0,
    factor: 0.3,
    delta,
  });

  bullet.position = updatePosition({
    position: bullet.position,
    velocity: bullet.velocity,
    delta,
  });

  bullet.life -= delta * 0.1;

  return bullet;
};

export const randomActorState = (): Partial<IActor> => ({
  position: {
    x: getRandomInt(-5000, 5000),
    y: getRandomInt(-4500, 4500),
  },
  rotation: normalizeDirection(Math.random() * Math.PI * 2),
  velocity: {
    x: Math.random() * 6 - 3,
    y: Math.random() * 6 - 3,
  },
});

interface IInitActor {
  assetKey: keyof typeof crafts;
  uid?: string;
  overrides?: Partial<IActor>;
  scale?: number;
}
export const initActor = ({
  assetKey,
  overrides = {},
  uid,
  scale = 1,
}: IInitActor): IActor => {
  const craft = getCraftSpec(assetKey);
  // ...prop('initialData')(getSpecs(assetKey))
  return {
    uid: uid || generateUid(),
    assetKey,
    scale,
    frameTextureKey: ETextureKey.CRAFT_DEFAULT,
    // default settings
    rotation: 0,
    position: { ...defaultVector },
    velocity: { ...defaultVector },
    isBullet: false,
    ...craft.initialData,
    // shield: 100,
    // life: 100,
    // mass: 100,
    // fuelCapacity: 100,
    radius: craft.radius * scale,
    points: 0,
    ...overrides,
  };
};

// export const createActor = (container) => (data) => {
//   const assetKey = data.assetKey;
//   const actor = initActor({
//     assetKey,
//     overrides: {
//       ...data,
//     },
//   });
//   container.addChild(getAsset(actor.spriteId));

//   const specs = getSpecs(assetKey);
//   actor.performance = {
//     radiusPx: getActorRadius(actor),
//     precisionHitAreas: pathOr([], ['hitArea', 'precision'])(specs),
//     startLife: actor.data.life,
//   };

//   // debugger;
//   return actor;
// };

const MAX_ATMOSPHERE_DRAG = 0.1;

export const atmosphereDragFactor = ({
  atmosphere = 0,
  factor = 1,
  delta = 1,
}) => {
  // const drag = MAX_ATMOSPHERE_DRAG * delta * propOr(0, 'atmosphere')(level);
  const drag = MAX_ATMOSPHERE_DRAG * atmosphere * delta;
  return 1 - drag * factor;
};

interface IApplyAtmosphereToVelocity {
  delta: number;
  velocity: IVector;
  atmosphere?: number;
  gravity?: number;
  factor?: number;
}
export const applyAtmosphereToVelocity = ({
  delta,
  velocity,
  atmosphere = 0,
  gravity = 0,
  factor = 1,
}: IApplyAtmosphereToVelocity) => {
  const dragFactor = atmosphereDragFactor({ atmosphere, factor, delta });
  return {
    x: velocity.x * dragFactor,
    y: velocity.y * dragFactor + gravity,
  };
};

interface IApplyThrusters {
  delta: number;
  rotation: number;
  velocity: IVector;
  forwardThrust?: number; // the amount to apply
  forwardThrustEngineOutput?: number; // craft engine power
  sideThrust?: number; // the amount to apply
  sideThrustEngineOutput?: number; // craft engine power
}

export function applyThrusters({
  delta,
  rotation,
  velocity,
  forwardThrust = 0,
  forwardThrustEngineOutput = 0.2,
  sideThrust = 0,
  sideThrustEngineOutput = 0.05,
}: IApplyThrusters): IVector {
  let v = velocity;
  if (forwardThrust !== 0) {
    const fwdThrustVelocity = getVelocity({
      speed: forwardThrust * forwardThrustEngineOutput * delta,
      rotation,
    });

    if (fwdThrustVelocity) {
      v = combineVelocity(v, fwdThrustVelocity);
    }
  }

  if (sideThrust !== 0) {
    const sideThrustVelocity = getVelocity({
      speed: sideThrust * sideThrustEngineOutput * delta,
      rotation: rotation + 0.5 * Math.PI,
    });

    if (sideThrustVelocity) {
      v = combineVelocity(v, sideThrustVelocity);
    }
  }

  return v;
}

interface IUpdateActorPosition {
  position: IVector;
  velocity: IVector;
  delta: number;
}
export const updatePosition = ({
  position,
  velocity,
  delta,
}: IUpdateActorPosition): IVector => ({
  x: (position.x += velocity.x * delta),
  y: (position.y += velocity.y * delta),
});

// export const updateTilePosition =
//   (offsetPoint) =>
//   ({ data, spriteId }) => {
//     const parallaxFactor =
//       propOr(1, 'parallax')(data) / propOr(1, 'scale')(data);
//     getAsset(spriteId).tilePosition.set(
//       -offsetPoint.x * parallaxFactor + 0,
//       -offsetPoint.y * parallaxFactor - 0
//     );
//   };

// export function updateTiles(tiles, offsetPoint) {
//   const updateFunc = updateTilePosition(offsetPoint);
//   tiles.forEach(updateFunc);
// }

// export const updateActors = ({ actorMap, level, delta, game }) => {
//   const actorKeys = Object.keys(actorMap);

//   for (let i = 0; i < actorKeys.length; ++i) {
//     // actorKeys.forEach((uid) => {
//     const uid = actorKeys[i];
//     const actor = actorMap[uid];
//     const { data, graphicId, performance, spriteId } = actor;

//     updateActorPosition(actor, level, delta);
//     data.distanceFromCenter = getDistance(game.player.data, data);

//     if (game.settings.isDebugCollisionMode) {
//       drawHitCircles(game, actor);
//     }

//     const sprite = getAsset(spriteId);
//     sprite.scale.set(data.scale || 1);

//     if (data.isBullet) {
//       data.life -= delta * 0.1;
//       sprite.alpha = data.life;
//     }

//     if (data.life <= 0) {
//       if (!data.isBullet) {
//         addExplosion({
//           container: getAsset(game.containers.worldNear),
//           scale: performance.radiusPx / 100,
//           x: data.x,
//           y: data.y,
//         });
//       }

//       delete actorMap[uid];
//       removeAsset(spriteId);
//       removeAsset(graphicId);
//     } else {
//       actor.chunkKey = assignToChunk({ game, uid, x: data.x, y: data.y });
//     }
//     // });
//   }
// };

// export const updateActorsAi = ({ actorMap, delta, deltaMs, game }) => {
//   const playerGraphic = getAsset(game.player.graphicId);
//   const actorKeys = Object.keys(actorMap);
//   actorKeys.forEach((uid, index) => {
//     const actor = actorMap[uid];
//     const { data, performance } = actor;

//     if (data.ai) {
//       // actor.crashDetectionHitArea = {
//       //   x: data.x + data.velocity.x * 40,
//       //   y: data.y + data.velocity.y * 40,
//       //   radius: Math.max(20, Math.round(performance.radiusPx * 2.5))
//       // }

//       // drawCircle({
//       //   ...actor.crashDetectionHitArea,
//       //   graphic: playerGraphic,
//       //   lineColor: 0xaa8855,
//       // });

//       const updateFrequency = getUpdateFrequency(data.distanceFromCenter, 'ai');
//       const shouldUpdate = getShouldUpdate(game, index, updateFrequency);
//       if (shouldUpdate) {
//         updateActorAi(
//           game,
//           actor,
//           delta * updateFrequency,
//           deltaMs * updateFrequency
//         );
//       }
//     }
//   });
// };

// export function shouldTurnLeft(rotationChange) {
//   if (rotationChange < 0) {
//     return rotationChange < -Math.PI ? false : true;
//   }
//   if (rotationChange > Math.PI) {
//     return true;
//   }
//   return false;
// }

// export function turnTowardsDirection(actor, targetDirection, specs, delta) {
//   const sprite = getAsset(actor.spriteId);
//   const rotationChange = targetDirection - actor.data.rotation;
//   const absRotationChangeDeltaApplied = Math.abs(rotationChange) * delta * 0.1;
//   const turnBy = Math.min(
//     1,
//     Math.min(
//       absRotationChangeDeltaApplied,
//       absRotationChangeDeltaApplied * pathOr(1, ['thrust', 'turn'])(specs)
//     )
//   );
//   const turningLeft = shouldTurnLeft(rotationChange);
//   const adjTurnBy = turningLeft ? -turnBy : turnBy;

//   actor.data.rotation = normalizeDirection(actor.data.rotation + adjTurnBy);
//   sprite.rotation = actor.data.rotation;
// }

// export function turnTowards(actor, vTarget, specs, delta) {
//   return turnTowardsDirection(
//     actor,
//     getDirection(actor.data, vTarget),
//     specs,
//     delta
//   );
// }

// export function moveTowardsDirection(
//   actor,
//   targetDirection,
//   specs,
//   delta,
//   thrust = 0.75
// ) {
//   turnTowardsDirection(actor, targetDirection, specs, delta);

//   applyThrusters({
//     actor,
//     delta,
//     thrustDirection: 'forward',
//     forward: thrust * pathOr(0.1, ['thrust', 'forward'])(specs),
//   });
// }

// export function moveTowardsTarget(
//   actor,
//   vTarget,
//   targetInfo,
//   specs,
//   delta,
//   thrust = 0.75
// ) {
//   turnTowards(actor, vTarget, specs, delta);

//   applyThrusters({
//     actor,
//     delta,
//     thrustDirection: 'forward',
//     forward: thrust * pathOr(0.1, ['thrust', 'forward'])(specs),
//   });
// }
