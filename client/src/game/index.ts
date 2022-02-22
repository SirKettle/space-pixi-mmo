import {
  Application,
  BaseTexture,
  Container,
  Loader,
  Sprite,
  Texture,
  Rectangle,
  TilingSprite,
} from 'pixi.js';
import fontDashDisplay from '../static/assets/font/digital7_mono_white.xml';
import { clientState, settings, updatePixiState } from '~state';
import { renderDebug } from '~debug';
import { getCraftSpec } from '~utils/spritesheet';
import { starsParallax } from '~utils/parallax';
import { defaultVector } from '../../../shared/utils/physics';
import { drawCircle } from '~utils/graphics';
import { GREENY_BLUE } from '../../../shared/constants/color';
import { crafts } from '../../../shared/specs/craft';
import { updateDash } from './dash';
import { IVector } from '../../../shared/types';
import { addExplosion, loadParticleAssets } from '~utils/particle';
import { play } from '~utils/audio';

const loader = Loader.shared;

const loadAssets = async () => {
  loader.add('fontDisplay', fontDashDisplay);
  return new Promise((resolve) => {
    loader.load(() => {
      resolve(void 0);
    });
  });
};

const loadCraftTextures = async (c: typeof crafts) => {
  const craftKeys = Object.keys(c);
  const craftImageUrls = craftKeys.map(
    (key) => getCraftSpec(key as keyof typeof crafts).imageUrl
  );
  const textures = await Promise.all(
    craftImageUrls.map((imageUrl) => new BaseTexture(imageUrl))
  );

  return craftKeys.reduce(
    (acc, key, i) => ({
      ...acc,
      [key as keyof typeof crafts]: textures[i],
    }),
    {}
  ) as Record<keyof typeof crafts, BaseTexture>;
};

let app: Application;

export const preInitGame = () => {
  const gameEl = document.querySelector('canvas');
  if (!gameEl) {
    return;
  }

  const gameWrapperEl = document.getElementById('gameWrapper');
  if (gameWrapperEl) {
    gameWrapperEl.style.aspectRatio = `${settings.chunkRatio[0]} / ${settings.chunkRatio[1]}`;
  }

  app = new Application({
    view: gameEl,
    resolution: window.devicePixelRatio,
    autoDensity: true,
    width: settings.chunkSize * settings.chunkRatio[0], // * (isMobile ? 2 : 1),
    height: settings.chunkSize * settings.chunkRatio[1], // * (isMobile ? 2 : 1),);
  });
};

export async function initGame() {
  if (!app) {
    return;
  }

  await loadAssets();
  const craftTextures = await loadCraftTextures(crafts);
  await loadParticleAssets(loader);

  const base = new Container();
  const background = new Container();
  const world = new Container();
  const dash = new Container();
  const debug = new Container();
  const foreground = new Container();
  app.stage.addChild(base);
  app.stage.addChild(background);
  app.stage.addChild(world);
  app.stage.addChild(dash);
  app.stage.addChild(foreground);
  app.stage.addChild(debug);

  const parallax = starsParallax.map((config) => {
    const sprite = TilingSprite.from(config.url, {
      width: app.screen.width,
      height: app.screen.height,
    });
    sprite.alpha = config.alpha;
    sprite.position.set(0, 0);
    sprite.scale.set(config.scale);

    return {
      config,
      sprite,
    };
  });

  parallax.forEach((p) => {
    if (p.config.parallax > 1) {
      foreground.addChild(p.sprite);
    } else {
      background.addChild(p.sprite);
    }
  });

  function mainLoop(delta: number) {
    updatePixiState(delta, app.ticker.elapsedMS);
    renderDebug(debug);

    const cameraOffset: IVector = {
      ...defaultVector,
      ...clientState.gameState?.cameraOffset,
    };

    const screenCameraOffset: IVector = {
      x: app.screen.width / 2 - cameraOffset.x,
      y: app.screen.height / 2 - cameraOffset.y,
    };

    parallax.forEach((p) => {
      p.sprite.tilePosition.set(
        -cameraOffset.x * (p.config.parallax / p.config.scale),
        -cameraOffset.y * (p.config.parallax / p.config.scale)
      );
    });

    dash.removeChildren();
    world.removeChildren();

    if (clientState.gameState?.actors.length) {
      clientState.gameState?.actors.forEach((a) => {
        const isPlayer = a.isYou || false;

        const craftSpec = getCraftSpec(a.assetKey);

        const f = craftSpec.frames.find((f) => f.key === a.frameTextureKey);

        if (f) {
          const t = new Texture(
            craftTextures[a.assetKey],
            new Rectangle(f.rect.x, f.rect.y, f.rect.width, f.rect.height)
          );
          const sprite = new Sprite(t);
          const x = a.position.x + screenCameraOffset.x;
          const y = a.position.y + screenCameraOffset.y;
          const spritePosition = { x, y };
          sprite.position.set(x, y);
          sprite.anchor.set(0.5);
          sprite.scale.set(1);
          sprite.rotation = a.rotation;
          world.addChild(sprite);

          updateDash({
            world: dash,
            position: spritePosition,
            screenCameraOffset,
            actor: a,
            craftSpec,
            isPlayer,
          });

          // const hitCircle = drawCircle({
          //   x,
          //   y,
          //   lineWidth: 1,
          //   lineColor: GREEN,
          //   lineAlpha: 0.3,
          //   radius: craftSpec.radius,
          // });
          // world.addChild(hitCircle);
        }
      });
    }

    if (clientState.gameState?.bullets.length) {
      clientState.gameState?.bullets.forEach((b) => {
        const x = b.position.x + screenCameraOffset.x;
        const y = b.position.y + screenCameraOffset.y;
        const bullet = drawCircle({
          x,
          y,
          fillColor: GREENY_BLUE,
          fillAlpha: Math.min(1, b.life),
          radius: b.radius,
          lineWidth: 0,
        });

        world.addChild(bullet);
      });
    }

    if (clientState.gameEffects.explosions.length) {
      clientState.gameEffects.explosions.forEach((explosion) => {
        addExplosion({
          container: foreground,
          scale: explosion.scale || 1,
          x: explosion.position.x + screenCameraOffset.x,
          y: explosion.position.y + screenCameraOffset.y,
        });

        play(explosion.scale > 1 ? 'bigLaser' : 'laser', explosion.scale);
      });

      clientState.gameEffects.explosions = [];
    }
  }

  app.ticker.add(mainLoop);
}
