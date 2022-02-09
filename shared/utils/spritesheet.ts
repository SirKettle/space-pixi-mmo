export const getHorizontalFrameRect = (
  frameIndex: number,
  width: number,
  height: number
) => {
  return { x: frameIndex * width, y: 0, width, height };
};
