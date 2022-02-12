const MAX_RADIANS = Math.PI * 2;

export function getVelocity({ speed = 0, rotation = 0 }) {
  return {
    x: Math.sin(rotation) * speed,
    y: -(Math.cos(rotation) * speed),
  };
}

export const defaultVector = { x: 0, y: 0 };

export function relativeVelocity(vA = defaultVector, vB = defaultVector) {
  return {
    x: vA.x - vB.x,
    y: vA.y - vB.y,
  };
}

export function combineVelocity(vA = defaultVector, vB = defaultVector) {
  return {
    x: vA.x + vB.x,
    y: vA.y + vB.y,
  };
}

export function getCollisionNorm(
  vActorAPosition = defaultVector,
  vActorBPosition = defaultVector
) {
  const vCollision = relativeVelocity(vActorBPosition, vActorAPosition);
  const distance = Math.hypot(vCollision.x, vCollision.y);

  return distance === 0
    ? defaultVector
    : {
        x: vCollision.x / distance,
        y: vCollision.y / distance,
      };
}

export function getCollisionSpeed(
  vCollisionNorm = defaultVector,
  vRelativeVelocity = defaultVector
) {
  return (
    vRelativeVelocity.x * vCollisionNorm.x +
    vRelativeVelocity.y * vCollisionNorm.y
  );
}

export function getDistance(
  vActorAPosition = defaultVector,
  vActorBPosition = defaultVector
) {
  const vCollision = relativeVelocity(vActorBPosition, vActorAPosition);
  return Math.hypot(vCollision.x, vCollision.y);
}

export function getDirection(
  vFromPosition = defaultVector,
  vToPosition = defaultVector
) {
  const vRel = relativeVelocity(vToPosition, vFromPosition);
  return normalizeDirection(Math.atan2(vRel.y, vRel.x) + Math.PI * 0.5);
}

export function getVelocitySpeed(v = defaultVector) {
  return Math.hypot(v.x, v.y);
}

export function normalizeDirection(dir: number) {
  const MAX_RADIANS = Math.PI * 2;
  let d = dir % MAX_RADIANS;
  while (d < 0) {
    d += MAX_RADIANS;
  }
  return d % MAX_RADIANS;
}
