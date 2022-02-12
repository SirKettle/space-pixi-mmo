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

// const app = getAsset(game.app);
// const background = getAsset(game.containers.background);
// const world = getAsset(game.containers.world);
// const worldFar = getAsset(game.containers.worldFar);
// const worldNear = getAsset(game.containers.worldNear);

// game.tiles = game.tiles.map(createTile(app, background));
