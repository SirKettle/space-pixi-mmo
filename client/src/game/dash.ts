import { Container } from '@pixi/display';
import { Graphics } from '@pixi/graphics';
import { Application, BitmapText } from 'pixi.js';
import { renderCurvedText } from '~components/curvedText';
import { clientState } from '~state';
import { healthColor } from '~utils/colors';
import {
  drawCircle,
  drawDirection,
  drawNavigationArrow,
} from '~utils/graphics';
import {
  BLUE,
  BLUE2,
  GREEN,
  ORANGE,
  RED,
  WHITE,
} from '../../../shared/constants/color';
import { ICraftSpec } from '../../../shared/specs/craft';
import { IRenderActor, IVector } from '../../../shared/types';
import {
  isDirectionMatch,
  normalizeDirection,
} from '../../../shared/utils/physics';

interface IUpdateDash {
  world: Container;
  position: IVector;
  screenCameraOffset: IVector;
  craftSpec: ICraftSpec;
  isPlayer: boolean;
  actor: IRenderActor;
}
export const updateDash = ({
  world,
  position,
  screenCameraOffset,
  craftSpec,
  actor,
  isPlayer,
}: IUpdateDash) => {
  const { x, y } = position;
  const graphic = new Graphics();
  const healthPercentage = actor.life / craftSpec.initialData.life;
  const healthLineWidth = isPlayer ? 15 : 5;
  const spriteRadius = craftSpec.radius * (actor.scale || 1);
  const minHealthRadius = spriteRadius * 1.4 + 10;

  const playerStats = clientState.leaderboard.find((l) => l.uid === actor.uid);

  // const healthCircle =
  drawCircle({
    graphic,
    x,
    y,
    lineWidth: healthLineWidth,
    lineColor: healthColor(healthPercentage),
    lineAlpha:
      0.2 +
      clientState.pixiState.sinVariant *
        0.5 *
        (1 - healthPercentage) *
        (isPlayer ? 0.3 : 0.15),
    radius: minHealthRadius - clientState.pixiState.sinVariant,
  });

  // world.addChild(healthCircle);

  if (playerStats) {
    const percentage = (num: number) => Math.round(num * 100);

    //   const dashboardDisplayText = new BitmapText(
    //     `${hitPercentage ? percentage(hitPercentage) : 0}%
    // ${actor.kills || 0} K
    // ${actor.deaths || 0} D`,
    //     {
    //       fontName: 'Digital-7 Mono',
    //       fontSize: 20,
    //       align: 'left',
    //       tint: BLUE,
    //     }
    //   );

    //   dashboardDisplayText.x = x - 50;
    //   dashboardDisplayText.y = y + minHealthRadius + 25;
    //   dashboardDisplayText.alpha = isPlayer ? 0.5 : 0.25;
    //   world.addChild(dashboardDisplayText);

    renderCurvedText({
      container: world,
      position,
      startRotation: normalizeDirection(
        ((clientState.pixiState.timeElapsedMs % 5000) / 5000) * Math.PI * 2
      ),
      fontStyle: {
        fontSize: 15,
      },
      radius: minHealthRadius + 35,
      message: `${playerStats.points} - ${playerStats.kills} KO - ${
        playerStats.deaths
      } DE - ${percentage(playerStats.accuracy)}% AC`,
      alpha: isPlayer ? 0.4 : 0.2,
    });
  }

  if (isPlayer) {
    const fireButtonPressedTime = clientState.gameState?.fire1 || 0;

    const firePower = Math.min(1, fireButtonPressedTime / 500) * 0.8 + 0.2;

    // Firepower circle
    if (fireButtonPressedTime > 0) {
      const firePowerLineWidth = firePower * 32;
      // const firePowerCircle =
      drawCircle({
        graphic,
        x: position.x,
        y: position.y,
        lineWidth: firePowerLineWidth,
        lineColor: BLUE2,
        lineAlpha: Math.max(0, Math.min(0.8, firePower * 0.3)),
        radius:
          minHealthRadius +
          healthLineWidth * 0.5 +
          5 -
          clientState.pixiState.sinVariant +
          firePowerLineWidth * 0.5,
      });
      // world.addChild(firePowerCircle);
    }

    const targetRadius = minHealthRadius + 100;

    const nearestTargetDirection = clientState.gameState?.nearestTarget
      ? clientState.gameState.nearestTarget.direction
      : undefined;
    const isNearestTargetInSights = isDirectionMatch(0.3)(
      actor.rotation,
      nearestTargetDirection
    );
    const isNearestTargetInSightsPrecision =
      isNearestTargetInSights &&
      isDirectionMatch(0.075)(actor.rotation, nearestTargetDirection);

    // const targets: Graphics[] = [];
    // targets.push(
    //   );
    drawCircle({
      graphic,
      lineWidth: 3,
      lineColor: isNearestTargetInSights ? RED : BLUE,
      lineAlpha: isNearestTargetInSights
        ? isNearestTargetInSightsPrecision
          ? 0.25
          : 0.15
        : 0.05,
      x,
      y,
      radius: targetRadius,
    });

    // const compassGraphics =
    [
      0,
      0.25 * Math.PI,
      0.5 * Math.PI,
      0.75 * Math.PI,
      Math.PI,
      1.25 * Math.PI,
      1.5 * Math.PI,
      1.75 * Math.PI,
    ].forEach((direction) =>
      drawDirection({
        graphic,
        fromPoint: position,
        direction: direction,
        startRadius: targetRadius - 10,
        length: 20,
        lineAlpha: isNearestTargetInSightsPrecision ? 0.5 : 0.1,
        lineWidth: 3,
        lineColor: isNearestTargetInSightsPrecision ? RED : WHITE,
      })
    );

    // targets.push(
    // )
    drawDirection({
      graphic,
      fromPoint: position,
      direction: actor.rotation,
      startRadius: targetRadius - 15,
      lineColor: GREEN,
      length: 30,
      lineAlpha: 0.2,
      lineWidth: 3,
    });

    if (clientState.gameState?.nearestTarget?.position) {
      // targets.push(
      //   );
      drawNavigationArrow({
        graphic,
        fromPoint: position,
        direction: clientState.gameState?.nearestTarget?.direction,
        distance: clientState.gameState?.nearestTarget?.distance,
        color: RED,
        startRadius: targetRadius - 15,
        length: 30,
      });

      const targetSpritePosition = {
        x:
          clientState.gameState?.nearestTarget?.position.x +
          screenCameraOffset.x,
        y:
          clientState.gameState?.nearestTarget?.position.y +
          screenCameraOffset.y,
      };

      const lineColor = isNearestTargetInSights ? RED : ORANGE;

      drawCircle({
        graphic,
        x: targetSpritePosition.x,
        y: targetSpritePosition.y,
        radius: 100,
        lineColor,
        lineWidth: 3,
        lineAlpha: isNearestTargetInSightsPrecision ? 0.3 : 0.2,
      });
      // targets.push(
      // );

      // const targetLines =
      [0, 0.5 * Math.PI, Math.PI, 1.5 * Math.PI].forEach((direction) =>
        drawDirection({
          graphic,
          fromPoint: targetSpritePosition,
          direction: direction,
          startRadius: isNearestTargetInSightsPrecision ? 60 : 75,
          length: isNearestTargetInSightsPrecision ? 80 : 50,
          lineAlpha: isNearestTargetInSightsPrecision ? 0.3 : 0.2,
          lineWidth: 3,
          lineColor,
        })
      );
      // targetLines.forEach((t) => {
      //   world.addChild(t);
      // });
    }

    // [...targets, ...compassGraphics].forEach((t) => {
    //   world.addChild(t);
    // });

    world.addChild(graphic);
  }
};
