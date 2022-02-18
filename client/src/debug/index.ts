import { Container } from '@pixi/display';
import { BitmapText } from 'pixi.js';
import { clientState } from '~state';
import { BLUE, GREEN } from '../../../shared/constants/color';
import { logMeter, logThrust } from '../../../shared/utils/log';

export const renderDebug = (container: Container) => {
  container.removeChildren();

  const text = `
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
......pixi app | ${Intl.NumberFormat('en-GB').format(
    Math.round(clientState.pixiState.timeElapsedMs)
  )} ms
.........users | ${clientState.activeUsers.map((u) => u.username).join(', ')}
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
