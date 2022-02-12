import {
  Application,
  BaseTexture,
  Container,
  Sprite,
  Texture,
  Rectangle,
  TilingSprite,
} from 'pixi.js';
import { clientState, settings, updatePixiState } from '~state';
import { renderDebug } from '~debug';
import { getCraftSpec } from '~utils/spritesheet';
import { starsParallax } from '~utils/parallax';
import { defaultVector } from '../../../shared/utils/physics';

const craftSpec = getCraftSpec('spacecraft');

const loadAssets = async (urls: string[]) => {
  return Promise.all(urls.map((url) => new BaseTexture(url)));
};

//   baseTextureInfo.texture, new Rectangle(x, y, width, height)ture = PIXI.Texture.from('assets/image.png');
// let sprite1 = new PIXI.Sprite(texture);
// let sprite2 = new PIXI.Sprite(texture);

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

  const [craftTexture] = await loadAssets([craftSpec.imageUrl]);

  const base = new Container();
  const background = new Container();
  const world = new Container();
  const foreground = new Container();
  app.stage.addChild(base);
  app.stage.addChild(background);
  app.stage.addChild(world);
  app.stage.addChild(foreground);

  // const spaceBgImage = '../static/assets/images/tiles/space_bg.png';

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

  // const baseBackground = TilingSprite.from(spaceBgImage, {
  //   width: app.screen.width,
  //   height: app.screen.height,
  // });

  // base.addChild(baseBackground);

  function mainLoop(delta: number) {
    updatePixiState(delta, app.ticker.elapsedMS);
    renderDebug();

    const cameraOffset = {
      ...defaultVector,
      ...clientState.gameState?.cameraOffset,
    };

    parallax.forEach((p) => {
      p.sprite.tilePosition.set(
        -cameraOffset.x * (p.config.parallax / p.config.scale),
        -cameraOffset.y * (p.config.parallax / p.config.scale)
      );
    });

    world.removeChildren();

    if (clientState.gameState?.actors.length) {
      clientState.gameState?.actors.forEach((a) => {
        // const sprite = new Sprite('/static/ase');

        const f = craftSpec.frames.find((f) => f.key === a.frameTextureKey);

        if (f) {
          const t = new Texture(
            craftTexture,
            new Rectangle(f.rect.x, f.rect.y, f.rect.width, f.rect.height)
          );
          const sprite = new Sprite(t);
          sprite.position.set(
            a.position.x + app.screen.width / 2 - cameraOffset.x,
            a.position.y + app.screen.height / 2 - cameraOffset.y
          );
          sprite.anchor.set(0.5);
          sprite.scale.set(1);
          sprite.rotation = a.rotation;

          world.addChild(sprite);
        }
      });
    }

    // craftSpec.frames.forEach((f, i) => {
    //   const t = new Texture(
    //     craftTexture,
    //     new Rectangle(f.rect.x, f.rect.y, f.rect.width, f.rect.height)
    //   );
    //   const sprite = new Sprite(t);
    //   sprite.position.set(100 + i * 100, 100 + i * 50);
    //   sprite.anchor.set(0.5);
    //   sprite.scale.set(1);
    //   sprite.rotation = 0;
    //   app.stage.addChild(sprite);
    // });
  }

  app.ticker.add(mainLoop);
  // mainLoop(1);
}
