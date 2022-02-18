// import { ORANGE, RED, WHITE } from '../constants/color';
import { Graphics } from 'pixi.js';
import { ORANGE, WHITE } from '../../../shared/constants/color';
import { IVector } from '../../../shared/types';
import {
  combineVelocity,
  getDirection,
  getDistance,
  getVelocity,
} from '../../../shared/utils/physics';

interface IDrawCircle {
  x: number;
  y: number;
  radius: number;
  graphic?: Graphics;
  lineWidth?: number; // 2,
  lineColor?: number; // WHITE,
  lineAlpha?: number; // 1,
  fillColor?: number; // WHITE,
  fillAlpha?: number; // 0,
  clear?: boolean;
}

export function drawCircle({
  graphic = new Graphics(),
  lineWidth = 2,
  lineColor = WHITE,
  lineAlpha = 1,
  fillColor = WHITE,
  fillAlpha = 0,
  x,
  y,
  radius,
  clear = false,
}: IDrawCircle) {
  if (clear) {
    graphic.clear();
  }

  graphic.lineStyle(lineWidth, lineColor, lineAlpha);
  graphic.beginFill(fillColor, fillAlpha);
  graphic.drawCircle(x, y, radius);

  graphic.endFill();
  return graphic;
}

interface IDrawLine {
  graphic?: Graphics;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  lineWidth?: number;
  lineColor?: number;
  lineAlpha?: number;
  fillColor?: number;
  fillAlpha?: number;
  clear?: boolean;
}
export function drawLine({
  graphic = new Graphics(),
  fromX,
  fromY,
  toX,
  toY,
  lineWidth = 2,
  lineColor = WHITE,
  lineAlpha = 1,
  fillColor = WHITE,
  fillAlpha = 0,
  clear = false,
}: IDrawLine) {
  if (clear) {
    graphic.clear();
  }

  graphic.lineStyle(lineWidth, lineColor, lineAlpha);
  graphic.beginFill(fillColor, fillAlpha);

  graphic.moveTo(fromX, fromY);
  graphic.lineTo(toX, toY);
  graphic.closePath();
  graphic.endFill();

  return graphic;
}

interface IDrawDirection {
  graphic?: Graphics;
  fromPoint: IVector;
  direction: number;
  startRadius?: number;
  length?: number;
  lineWidth?: number;
  lineColor?: number;
  lineAlpha?: number;
  fillColor?: number;
  fillAlpha?: number;
}
export function drawDirection({
  fromPoint,
  direction,
  startRadius = 0,
  length = 100,
  ...otherProps
}: IDrawDirection) {
  const startVelocity = getVelocity({
    speed: startRadius,
    rotation: direction,
  });
  const lengthVelocity = getVelocity({ speed: length, rotation: direction });
  const startPoint = combineVelocity(startVelocity, fromPoint);
  const endPoint = combineVelocity(lengthVelocity, startPoint);

  return drawLine({
    fromX: startPoint.x,
    fromY: startPoint.y,
    toX: endPoint.x,
    toY: endPoint.y,
    ...otherProps,
  });
}

interface IDrawNavigationArrow {
  graphic?: Graphics;
  fromPoint: IVector;
  direction: number;
  distance: number;
  startRadius?: number;
  alpha?: number;
  length?: number;
  lineWidth?: number;
  color?: number;
}
export function drawNavigationArrow({
  graphic,
  fromPoint,
  direction,
  distance,
  startRadius = 0,
  length = 100,
  lineWidth = 3,
  color = ORANGE,
}: IDrawNavigationArrow) {
  const lineAlpha = 0.2 + 0.8 * (Math.max(0, 3000 - distance) / 3000);
  return drawDirection({
    graphic,
    direction,
    fromPoint,
    startRadius,
    lineColor: color,
    lineWidth,
    length,
    lineAlpha,
  });
}
