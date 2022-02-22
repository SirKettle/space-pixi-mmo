import {
  AnimatedSprite,
  BaseTexture,
  Container,
  Loader,
  Rectangle,
  Texture,
} from 'pixi.js';

import { getFrameRects } from '../utils/spritesheet';
import explosion200Image from '../static/assets/images/sprites/animated-explosion-200.png';
import { IRect } from '../../../shared/types';
import { normalizeDirection } from '../../../shared/utils/physics';

interface IParticleSpec {
  imageUrl: string;
  frames: IRect[];
}
export const explosion200: IParticleSpec = {
  imageUrl: explosion200Image,
  frames: getFrameRects({ width: 200, height: 200, columns: 8, total: 48 }),
};

export const particles = {
  explosion200,
};

interface IParticleTexture {
  particle: keyof typeof particles;
  baseTexture: BaseTexture;
  frameTextures: Texture[];
}

export const particleTextures: IParticleTexture[] = [];

export const loadParticleAssets = async (loader: Loader) => {
  Object.keys(particles).forEach((p) => {
    loader.add(p, particles[p as keyof typeof particles].imageUrl);
  });
  return new Promise((resolve) => {
    loader.load(() => {
      Object.keys(particles).forEach((p) => {
        const particle = p as keyof typeof particles;
        const baseTexture: BaseTexture = BaseTexture.from(
          particles[particle].imageUrl
        );
        const spec: IParticleSpec = particles[particle];
        particleTextures.push({
          particle,
          baseTexture,
          frameTextures: spec.frames.map(
            (f) =>
              new Texture(
                baseTexture,
                new Rectangle(f.x, f.y, f.width, f.height)
              )
          ),
        });
      });

      resolve(void 0);
    });
  });
};

interface IAddAnimatedParticle {
  particle: keyof typeof particles;
  container: Container;
  x: number;
  y: number;
  scale?: number;
  rotation?: number;
  loop?: boolean;
}
export function addAnimatedParticle({
  particle,
  container,
  x,
  y,
  scale = 1,
  rotation = normalizeDirection(Math.random() * Math.PI * 2),
  loop = false,
}: IAddAnimatedParticle) {
  try {
    const textures = particleTextures.find((p) => p.particle === particle);
    if (!textures) {
      throw new Error('particle textures not found');
    }
    const sprite = new AnimatedSprite(textures.frameTextures);

    sprite.onComplete = () => {
      sprite.parent.removeChild(sprite);
    };
    sprite.x = x;
    sprite.y = y;
    sprite.anchor.set(0.5);
    sprite.rotation = rotation;
    sprite.scale.set(scale);
    sprite.loop = loop;
    sprite.gotoAndPlay(0);
    container.addChild(sprite);
  } catch (e) {
    console.error('addAnimatedParticle error', e);
  }
}

interface IAddExplosion {
  container: Container;
  x: number;
  y: number;
  scale?: number;
}
export function addExplosion({ container, scale = 1, x, y }: IAddExplosion) {
  return addAnimatedParticle({
    container,
    scale,
    x,
    y,
    particle: 'explosion200',
    loop: false,
  });
}
