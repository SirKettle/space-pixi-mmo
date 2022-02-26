import { Container } from '@pixi/display';
import { BitmapText } from 'pixi.js';
import { clientState } from '~state';
import { GREEN } from '../../../shared/constants/color';
import * as T from '../../../shared/types';
import { times } from 'ramda';

const strFixedLength =
  (length: number, padChar: string, padBefore?: boolean) =>
  (str: string | number) => {
    const trimmed = str.toString().slice(0, length);
    if (trimmed.length === length) {
      return trimmed;
    }
    const paddedChars = times(() => padChar, length - trimmed.length).join('');
    return padBefore ? `${paddedChars}${trimmed}` : `${trimmed}${paddedChars}`;
  };

const renderLeaderboardPosition = (pos: T.ILeaderboardPosition): string => {
  const nameCol = strFixedLength(16, '.', true);
  const numCol = strFixedLength(7, '.');
  return `${nameCol(pos.player)}....${numCol(pos.points)}`;
};

export const renderLeaderboard = (container: Container) => {
  container.removeChildren();

  const leaderboard = [...clientState.leaderboard].sort((a, b) =>
    a.points < b.points ? 1 : -1
  );

  const text = `------- Leaderboard -------
---------------------------
${leaderboard
  .map(
    (p) => `
${renderLeaderboardPosition(p)}`
  )
  .join('')}
`;

  const dashboardDisplayText = new BitmapText(text, {
    fontName: 'Digital-7 Mono',
    fontSize: 15,
    align: 'left',
    tint: GREEN,
  });

  dashboardDisplayText.x = 25;
  dashboardDisplayText.y = 25;
  dashboardDisplayText.alpha = 0.75;
  container.addChild(dashboardDisplayText);
};
