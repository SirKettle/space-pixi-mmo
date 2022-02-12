import { clientState } from '~state';
import { logMeter, logThrust } from '../../../shared/utils/log';

export const renderDebug = () => {
  const debugEl = document.getElementById('debug');
  if (!debugEl) {
    return;
  }

  debugEl.innerHTML = `
  <p>.....connected | ${clientState.connected}</p>
  <p>${logMeter({
    key: '.......ping ms',
    value: clientState.pingMs || 0,
    max: 30,
    formattedValue: `${clientState.pingMs}ms (${clientState.pingRoundtripMs}ms)`,
  })}</p>
  <p>${logMeter({
    key: '........F.P.S.',
    value: clientState.pixiState.fps,
    max: 75,
  })}</p>
  <p>${logMeter({
    key: '......delta ms',
    value: Math.round(clientState.pixiState.deltaMs),
    max: 20,
  })}</p>
  <p>${logMeter({
    key: '...fire one ms',
    value: clientState.gameState?.fire1 || 0,
    max: 500,
  })}</p>
  <p>${logThrust({
    key: '........thrust',
    value: clientState.gameState?.fwdThrst || 0,
    negChar: '-',
    posChar: '+',
  })}</p>
  <p>${logThrust({
    key: '...turn thrust',
    value: clientState.gameState?.trnThrst || 0,
  })}</p>
  <p>......pixi app | ${Intl.NumberFormat('en-GB').format(
    Math.round(clientState.pixiState.timeElapsedMs)
  )} ms</p>
  <p>.........users | ${clientState.activeUsers
    .map((u) => u.username)
    .join(', ')}</p>
  <p>${JSON.stringify(clientState.gameState?.debug || {}, null, 1)}</p>
  ${(clientState.gameState?.actors || []).map((a, i) => {
    return `<h3>Actor ${i + 1}</h3><p>x: ${a.position.x}, y: ${
      a.position.y
    }</p><p>health: ${a.health}, rotation: ${a.rotation}</p><p>scale: ${
      a.scale
    }, texture: ${a.frameTextureKey.toString()}</p>`;
  })}
  `;
};
