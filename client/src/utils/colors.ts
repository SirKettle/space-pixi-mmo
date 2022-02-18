import { BLACK, GREEN, ORANGE, RED } from '../../../shared/constants/color';

export const healthColor = (lifePercentage: number) => {
  if (lifePercentage > 0.75) {
    return GREEN;
  }
  if (lifePercentage > 0.25) {
    return ORANGE;
  }
  if (lifePercentage > 0) {
    return RED;
  }

  return BLACK;
};
