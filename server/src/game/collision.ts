import { pick } from 'ramda';
import { IBullet, ICircle } from '../../../shared/types';
import {
  combineVelocity,
  getCollisionNorm,
  getCollisionSpeed,
  getDirection,
  getVelocity,
  relativeVelocity,
} from '../../../shared/utils/physics';
import { getRandomInt } from '../../../shared/utils/random';
import { serverState } from '../state';
import { IActor, IPlayerState } from '../types';
import { getCraftSpec } from '../utils';
import { randomActorState } from './actor';

export const getActorCircle = (a: IActor | IBullet): ICircle => {
  // const spec = getCraftSpec(a.assetKey);
  return {
    x: a.position.x,
    y: a.position.y,
    // radius: spec.hitArea.basic.radius * (a.scale || 1),
    radius: a.radius,
  };
};

export const circleIntersect = (c1: ICircle, c2: ICircle): boolean => {
  // Calculate the distance between the two circles
  const squareDistance =
    (c1.x - c2.x) * (c1.x - c2.x) + (c1.y - c2.y) * (c1.y - c2.y);

  // When the distance is smaller or equal to the sum
  // of the two radius, the circles touch or overlap
  return squareDistance <= (c1.radius + c2.radius) * (c1.radius + c2.radius);
};

export const isCollision = (
  a1: IActor | IBullet,
  a2: IActor | IBullet
): boolean => {
  // do very basic detection for now using basic hit circle from spec
  // TODO - precision if spec has them etc
  if (a1.life <= 0 || a2.life <= 0) {
    return false;
  }
  return circleIntersect(getActorCircle(a1), getActorCircle(a2));
};

export function getActorDamage(actor: IActor | IBullet, speed: number): number {
  const power = typeof actor.power === 'number' ? actor.power : actor.mass;
  const damage = (Math.max(1, speed) * power) / 20;
  const adj = actor.isBullet ? Math.min(1, actor.life) * damage : damage;
  return Math.max(0, adj);
}

export const handleCollision = (
  a1: IActor | IBullet,
  a2: IActor | IBullet
): boolean => {
  // if using precise hit areas, use their precise position rather than actors
  const vCollisionNorm = getCollisionNorm(a1.position, a2.position);
  const vRelativeVelocity = relativeVelocity(a1.velocity, a2.velocity);
  const collisionSpeed = getCollisionSpeed(vCollisionNorm, vRelativeVelocity);

  if (collisionSpeed <= 0) {
    // moving apart - so no action needed
    return false;
  }

  const impulse = (2 * collisionSpeed) / (a1.mass + a2.mass);

  a1.velocity.x;

  // // update actor velocities
  a1.velocity.x -= impulse * a2.mass * vCollisionNorm.x;
  a1.velocity.y -= impulse * a2.mass * vCollisionNorm.y;
  a2.velocity.x += impulse * a1.mass * vCollisionNorm.x;
  a2.velocity.y += impulse * a1.mass * vCollisionNorm.y;

  const actorADamage = getActorDamage(a1, collisionSpeed);
  const actorBDamage = getActorDamage(a2, collisionSpeed);

  a1.life -= actorBDamage;
  a2.life -= actorADamage;

  // add explosions and sound fx

  const direction = getDirection(a1.position, a2.position);
  const startVelocity = getVelocity({ speed: a1.radius, rotation: direction });
  const collisionPosition = combineVelocity(startVelocity, a1.position);

  const isOneActorBullet = a1.isBullet || a2.isBullet;

  const damageTotal = isOneActorBullet
    ? a1.isBullet
      ? actorADamage
      : actorBDamage
    : actorADamage + actorBDamage;

  const damageVol = damageTotal / 100;

  serverState.gameState.explosions.push({
    scale: damageVol,
    position: collisionPosition,
  });

  serverState.gameState.sfx.push({
    position: collisionPosition,
    vol: damageVol,
    key: damageVol > 1 ? 'bigLaserHit' : 'explosion',
  });

  return true;
};

export const handleHit = (actor: IPlayerState, hitBy: IPlayerState) => {
  hitBy.hits = (hitBy.hits || 0) + 1;
  hitBy.points += 10;
  actor.points -= 5;

  if (actor.life <= 0) {
    actor.deaths = (actor.deaths || 0) + 1;
    actor.points -= 25;

    serverState.gameState.explosions.push({
      scale: 3,
      position: actor.position,
    });
    hitBy.kills = (hitBy.kills || 0) + 1;
    hitBy.points += 50;

    setTimeout(() => {
      let a = serverState.gameState.players.find((a) => a.uid === actor.uid);
      if (a) {
        console.log('respawn');
        const spec = getCraftSpec(a.assetKey);
        a.life = spec.initialData.life;
        a.position = {
          x: getRandomInt(-2000, 2000),
          y: getRandomInt(-1500, 1500),
        };

        a = {
          ...a,
          ...randomActorState(),
        };
      }
    }, 3000);
  }
};

export const handleCollisions = () => {
  for (let i = 0; i < serverState.gameState.players.length; ++i) {
    const actorA = serverState.gameState.players[i];
    if (actorA) {
      for (let j = 0; j < serverState.gameState.bullets.length; ++j) {
        const bullet = serverState.gameState.bullets[j];
        if (isCollision(actorA, bullet)) {
          const collisionConfirmed = handleCollision(actorA, bullet);
          if (collisionConfirmed) {
            const firedByPlayer = serverState.gameState.players.find(
              (p) => p.clientId === bullet.firedBy
            );
            if (firedByPlayer) {
              handleHit(actorA, firedByPlayer);
            }
          }
        }
      }

      for (let j = i + 1; j < serverState.gameState.players.length; ++j) {
        const actorB = serverState.gameState.players[j];
        if (isCollision(actorA, actorB)) {
          handleCollision(actorA, actorB);

          if (actorA.life <= 0) {
            handleHit(actorA, actorB);
          }
          if (actorB.life <= 0) {
            handleHit(actorB, actorA);
          }
        }
      }
    }
  }
};
