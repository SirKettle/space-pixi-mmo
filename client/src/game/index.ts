import { Application, BaseTexture, Sprite, Texture, Rectangle } from 'pixi.js';
import { clientState, settings, updatePixiState } from '~state';
import { renderDebug } from '~debug';
import { getCraftSpec } from '~utils/spritesheet';

const craftSpec = getCraftSpec('spacecraft');

const loadAssets = async (urls: string[]) => {
  return Promise.all(urls.map((url) => new BaseTexture(url)));
};

//   baseTextureInfo.texture, new Rectangle(x, y, width, height)ture = PIXI.Texture.from('assets/image.png');
// let sprite1 = new PIXI.Sprite(texture);
// let sprite2 = new PIXI.Sprite(texture);

export async function initGame() {
  const gameEl = document.querySelector('canvas');
  if (!gameEl) {
    return;
  }

  const [craftTexture] = await loadAssets([craftSpec.imageUrl]);

  const app = new Application({
    view: gameEl,
    resolution: window.devicePixelRatio,
    autoDensity: true,
    width: settings.chunkSize * settings.chunkRatio[0], // * (isMobile ? 2 : 1),
    height: settings.chunkSize * settings.chunkRatio[1], // * (isMobile ? 2 : 1),);
  });

  function mainLoop(delta: number) {
    updatePixiState(delta, app.ticker.elapsedMS);
    renderDebug();

    app.stage.removeChildren();

    if (clientState.gameState?.actors.length) {
      clientState.gameState?.actors.forEach((a) => {
        // const sprite = new Sprite('/static/ase');
        a.texture;

        const f = craftSpec.frames.find((f) => f.key === a.texture);

        if (f) {
          const t = new Texture(
            craftTexture,
            new Rectangle(f.rect.x, f.rect.y, f.rect.width, f.rect.height)
          );
          const sprite = new Sprite(t);
          sprite.position.set(
            a.position.x + app.screen.width / 2,
            a.position.y + app.screen.height / 2
          );
          sprite.anchor.set(0.5);
          sprite.scale.set(1);
          sprite.rotation = a.direction;

          app.stage.addChild(sprite);
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
