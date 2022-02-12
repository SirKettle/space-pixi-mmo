const grid64TileImage = '../static/assets/images/grid_64_pink.png';
const grid128TileImage = '../static/assets/images/grid_128_pink.png';
const starsOneTileImage = '../static/assets/images/starfield-background.png';
const spaceBgImage = '../static/assets/images/tiles/space_bg.png';
const starsImage = '../static/assets/images/tiles/stars_transparent.png';

export const grid64 = {
  imageUrl: grid64TileImage,
};
export const grid128 = {
  imageUrl: grid128TileImage,
};
export const starsOne = {
  imageUrl: starsOneTileImage,
};
export const spaceBg = {
  imageUrl: spaceBgImage,
};
export const starsTransparent = {
  imageUrl: starsImage,
};

export const starsParallax = [
  {
    assetKey: 'spaceBg',
    url: spaceBgImage,
    parallax: 0.1,
    alpha: 0.85,
    scale: 1,
  },

  {
    assetKey: 'starsTransparent',
    url: starsImage,
    parallax: 0.125,
    alpha: 0.85,
    scale: 1,
  },

  // { data: { assetKey: 'starsOne', url: starsOneTileImage, parallax: 0.1, alpha: 1 } },
  // {
  //   data: {
  //     assetKey: 'starsOne', url: starsOneTileImage,
  //     parallax: 0.125,
  //     alpha: 0.85,
  //     scale: 2,
  //   },
  // },
  // {
  //   data: {
  //     assetKey: 'starsOne', url: starsOneTileImage,
  //     parallax: 0.5,
  //     alpha: 0.1,
  //     scale: 5,
  //   },
  // },
  {
    assetKey: 'starsOne',
    url: starsOneTileImage,
    parallax: 1,
    alpha: 0.07,
    scale: 15,
  },

  {
    assetKey: 'starsOne',
    url: starsOneTileImage,
    parallax: 1.5,
    alpha: 0.07,
    scale: 25,
  },

  // {
  //   data: {
  //     assetKey: 'grid64',
  //     parallax: 0.5,
  //     alpha: 0.25,
  //     scale: 2,
  //   },
  // },
  {
    assetKey: 'grid128',
    url: grid128TileImage,
    parallax: 1,
    alpha: 0.1,
    scale: 2,
  },
];
