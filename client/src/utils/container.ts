import { Container } from 'pixi.js';

export const removeAndDestroyChildren = (container: Container) => {
  for (var i = container.children.length - 1; i >= 0; i--) {
    const child = container.children[i];
    container.removeChild(child);
    child.destroy({
      children: true,
      texture: true,
      baseTexture: false,
    });
  }
};
