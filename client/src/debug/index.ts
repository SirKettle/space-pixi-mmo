import { Container } from '@pixi/display';
import { BitmapText } from 'pixi.js';
import { clientState } from '~state';
import { BLUE, GREEN } from '../../../shared/constants/color';
import { logMeter, logThrust } from '../../../shared/utils/log';
import * as T from '../../../shared/types';
import { times, trim } from 'ramda';

// const renderPlayerScore

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

export const renderDebug = (container: Container) => {
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

.....connected | ${clientState.connected}
${logMeter({
  key: '.......ping ms',
  value: clientState.pingMs || 0,
  max: 30,
  formattedValue: `${clientState.pingMs}ms (${clientState.pingRoundtripMs}ms)`,
})}
${logMeter({
  key: '........F.P.S.',
  value: clientState.pixiState.fps,
  max: 75,
})}
${logMeter({
  key: '......delta ms',
  value: Math.round(clientState.pixiState.deltaMs),
  max: 20,
})}
${logMeter({
  key: '...fire one ms',
  value: clientState.gameState?.fire1 || 0,
  max: 500,
})}
${logThrust({
  key: '........thrust',
  value: clientState.gameState?.fwdThrst || 0,
  negChar: '-',
  posChar: '+',
})}
${logThrust({
  key: '...turn thrust',
  value: clientState.gameState?.trnThrst || 0,
})}
.......elapsed | ${Intl.NumberFormat('en-GB').format(
    Math.round(clientState.pixiState.timeElapsedMs / 1000)
  )} s
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
