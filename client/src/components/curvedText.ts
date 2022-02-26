import {
  BaseTexture,
  Container,
  Matrix,
  Point,
  RenderTexture,
  SimpleRope,
  Sprite,
  Texture,
  Text,
  ITextStyle,
  Application,
  BitmapText,
  IBitmapTextStyle,
} from 'pixi.js';
import { clientState } from '~state';
import { BLUE } from '../../../shared/constants/color';
import { IVector } from '../../../shared/types';
import {
  combineVelocity,
  getVelocity,
  normalizeDirection,
} from '../../../shared/utils/physics';

interface IRenderCurvedText {
  container: Container;
  message: string;
  position: IVector;
  startRotation?: number;
  fontStyle?: Partial<IBitmapTextStyle>;
  radius?: number;
  alpha?: number;
}
export const renderCurvedText = ({
  container,
  position,
  message,
  startRotation = 0,
  fontStyle,
  radius = 300,
  alpha = 1,
}: IRenderCurvedText) => {
  const defaultStyles: Partial<IBitmapTextStyle> = {
    fontName: 'Digital-7 Mono',
    fontSize: 20,
    align: 'center',
    tint: BLUE,
  };
  const styles = {
    ...defaultStyles,
    fontStyle,
  };

  message.split('').forEach((char, i) => {
    const charBitmap = new BitmapText(char || '.', styles);
    const rotation = normalizeDirection(
      startRotation + i / ((radius / 100) * ((styles.fontSize || 20) / 20) * 8)
    );

    const vel = getVelocity({ speed: radius, rotation });
    const pos = combineVelocity(position, vel);

    charBitmap.x = pos.x;
    charBitmap.y = pos.y;
    charBitmap.pivot.x = 0.5;
    charBitmap.pivot.y = 0.5;
    charBitmap.rotation = rotation;
    charBitmap.alpha = alpha;
    container.addChild(charBitmap);
  });
};
