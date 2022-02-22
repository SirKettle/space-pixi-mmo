import { prop } from 'ramda';
import {
  AudioContext,
  decodeAudioData,
  IAudioBuffer,
  IAudioBufferSourceNode,
  IAudioContext,
  IGainNode,
} from 'standardized-audio-context';
import { getItem, setItem } from './storage';
import unlockAudioContext from './unlockAudioContext';

import new_message from '../static/assets/audio/message/_new_message.mp3';
import end_of_message from '../static/assets/audio/message/_end_of_message.mp3';
import new_radio_message from '../static/assets/audio/message/_new-radio-message.mp3';
import end_of_radio_message from '../static/assets/audio/message/_end-radio-message.mp3';
import message_nana_crisps from '../static/assets/audio/message/message_nana_crisps.mp3';
import message_boss_backtowork from '../static/assets/audio/message/message_boss_backtowork.mp3';
import message_boss_finally from '../static/assets/audio/message/boss-finally-turned-up.mp3';
import message_nana_bad_news from '../static/assets/audio/message/nan-bad-news.mp3';
import message_nan_congrats_navy_job from '../static/assets/audio/message/nan_congrats_navy_job.mp3';
import message_navy_return_fire from '../static/assets/audio/message/navy_return_fire.mp3';
import message_we_did_it_kid_back_to_base from '../static/assets/audio/message/we_did_it_kid_back_to_base.mp3';

import transitionWiffyAhaha from '../static/assets/audio/music/transition-wiffy-to-ahaa.mp3';

import wiffyInstrumentalSrc from '../static/assets/audio/music/wiffy-instrumental-64kBits.mp3';
import ahahaSrc from '../static/assets/audio/music/ahahahaaa-64kBits.mp3';
import episode24Src from '../static/assets/audio/music/episode24.mp3';

import bigLaser from '../static/assets/audio/sfx/quaddamage_shoot.mp3';
import laser from '../static/assets/audio/sfx/quaddamage_out.mp3';
import laserHit from '../static/assets/audio/sfx/explosion_small.mp3';
import bigLaserHit from '../static/assets/audio/sfx/explosion_underwater_distant.mp3';
import explosion from '../static/assets/audio/sfx/explosion_large_distant.mp3';

interface ICollectionState {
  index: number;
  ids: string[];
  loop: boolean;
}
const defaultCollectionState: ICollectionState = {
  index: 0,
  ids: [],
  loop: false,
};

interface IAudioState {
  collection: ICollectionState;
  playing: Record<string, IAudioBufferSourceNode<IAudioContext>>;
}
const audioState: IAudioState = {
  collection: { ...defaultCollectionState },
  playing: {},
};

const allSounds: { id: string; src: string }[] = [
  { id: 'laser', src: laser },
  { id: 'bigLaser', src: bigLaser },
  { id: 'laserHit', src: laserHit },
  { id: 'bigLaserHit', src: bigLaserHit },
  { id: 'explosion', src: explosion },
  { id: 'episode-24', src: episode24Src },
  // messages
  { id: 'new_message', src: new_message },
  { id: 'end_of_message', src: end_of_message },
  { id: 'new_radio_message', src: new_radio_message },
  { id: 'end_of_radio_message', src: end_of_radio_message },
  { id: 'message_nana_crisps', src: message_nana_crisps },
  { id: 'message_boss_backtowork', src: message_boss_backtowork },
  { id: 'message_boss_finally', src: message_boss_finally },
  { id: 'message_nana_bad_news', src: message_nana_bad_news },
  { id: 'message_nan_congrats_navy_job', src: message_nan_congrats_navy_job },
  { id: 'message_navy_return_fire', src: message_navy_return_fire },
  {
    id: 'message_we_did_it_kid_back_to_base',
    src: message_we_did_it_kid_back_to_base,
  },
  // transitions
  { id: 'transition-wiffy2aha', src: transitionWiffyAhaha },
  // music
  { id: 'music-wiffy', src: wiffyInstrumentalSrc },
  { id: 'music-aha', src: ahahaSrc },
];

export const AUDIO_RANGE_PX = 800;

const AUDIO_STORE_KEY = 'audioSettings';

interface IAudioSettings {
  on: boolean;
  masterVol: number;
  musicVol: number;
}
const audioSettings: IAudioSettings = {
  on: true,
  masterVol: 1,
  musicVol: 1,
  ...getItem(AUDIO_STORE_KEY),
};

export function getSettings(): IAudioSettings {
  return { ...audioSettings };
}

const audioCtx = new AudioContext();

unlockAudioContext(audioCtx).then(
  function (unlocked) {
    if (unlocked) {
      console.log('audio unlocked');
    } else {
      console.log('no need to unlock audio - as you were');
    }
  },
  function (reason) {
    console.error(reason);
  }
);

const musicGainNode = audioCtx.createGain();
musicGainNode.gain.value = audioSettings.masterVol * audioSettings.musicVol;

async function getFile(filepath: string) {
  const response = await fetch(filepath);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await decodeAudioData(audioCtx, arrayBuffer);
  return audioBuffer;
}

async function loadFile(filePath: string) {
  const track = await getFile(filePath);
  return track;
}

function getBufferSource(
  audioBuffer: IAudioBuffer,
  gainNode: IGainNode<IAudioContext>
) {
  const trackSource = audioCtx.createBufferSource();
  trackSource.buffer = audioBuffer;
  if (gainNode) {
    trackSource.connect(gainNode).connect(audioCtx.destination);
  } else {
    trackSource.connect(audioCtx.destination);
  }
  return trackSource;
}

const sounds: Record<string, { src: string; audioBuffer: IAudioBuffer }> = {};
allSounds.forEach(({ id, src }) => {
  loadFile(src).then((audioBuffer) => {
    sounds[id] = {
      src,
      audioBuffer,
    };
  });
});

export const play = (id: string, vol = 1) => {
  if (!audioSettings.on) {
    return;
  }
  const track = sounds[id];
  if (!track) {
    return;
  }
  playSfx(track.audioBuffer, vol);
};

export function getCurrentTrackId() {
  const collection = prop('collection')(audioState);
  return collection.ids[collection.index];
}

export function nextTrack(index?: number) {
  const collection = prop('collection')(audioState);
  collection.index = typeof index === 'number' ? index : collection.index + 1;

  if (collection.index >= collection.ids.length) {
    if (collection.loop) {
      collection.index = 0;
    }
  }

  if (collection.index < collection.ids.length) {
    audioState.collection = collection;
    playSingleAudio({
      id: getCurrentTrackId(),
      gainNode: musicGainNode,
      setVolume: false, // // don’t want to override the music gainNode vol
    }).then(() => nextTrack());
    return;
  }

  resetCollection();
}

function resetCollection() {
  audioState.collection = { ...defaultCollectionState };
}

export async function stopSound(id: string) {
  return new Promise<void>((resolve) => {
    const { playing } = audioState;
    if (playing[id] && typeof playing[id].stop === 'function') {
      playing[id].onended = () => {
        delete playing[id];
        resolve();
      };
      playing[id].stop();
    } else {
      resolve();
    }
  });
}

export async function stopCollection() {
  return new Promise<void>((resolve) => {
    const id = getCurrentTrackId();
    resetCollection();
    if (id) {
      stopSound(id).then(() => {
        resolve();
      });
    } else {
      resolve();
    }
  });
}

export function playCollection({ ids = [], index = 0, loop = true }) {
  stopCollection().then(() => {
    if (ids.length < 1) {
      return;
    }
    audioState.collection = { ids, index, loop };
    nextTrack(0);
  });
}

export async function playSingleAudio({
  id = '',
  vol = 1,
  setVolume = true,
  gainNode = audioCtx.createGain(),
}) {
  return new Promise<void>((resolve, reject) => {
    const track = sounds[id];
    const { playing } = audioState;
    if (!track) {
      reject('404 - no track');
      return;
    }
    if (!audioSettings.on) {
      reject('audio OFF');
      return;
    }

    stopSound(id).then(() => {
      if (setVolume) {
        gainNode.gain.value = audioSettings.masterVol * vol;
      }
      playing[id] = getBufferSource(track.audioBuffer, gainNode);
      playing[id].start();

      playing[id].onended = () => {
        delete playing[id];
        resolve();
      };
    });
  });
}

window.playSingleAudio = playSingleAudio;

// create a buffer, plop in data, connect and play -> modify graph here if required
function playSfx(audioBuffer: IAudioBuffer, vol = 1) {
  if (!audioSettings.on) {
    return;
  }
  if (!audioBuffer) {
    console.warn('track not loaded');
    return;
  }
  const gainNode = audioCtx.createGain();
  gainNode.gain.value = audioSettings.masterVol * vol;
  const trackSource = getBufferSource(audioBuffer, gainNode);
  trackSource.start();
  return trackSource;
}

export function setVolume(vol: number, volumeKey: 'masterVol' | 'musicVol') {
  audioSettings[volumeKey] = Math.max(0, Math.min(1, vol));
  // update music volume
  musicGainNode.gain.value = audioSettings.masterVol * audioSettings.musicVol;
  // update the store
  setItem(AUDIO_STORE_KEY, audioSettings);
  // return new volume
  return audioSettings[volumeKey];
}

export function toggleAudio() {
  audioSettings.on = !audioSettings.on;
  if (!audioSettings.on) {
    if (audioCtx.state === 'running') {
      audioCtx.suspend();
      console.log('suspend audio');
    }
  } else {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
      console.log('resume audio');
    }
  }
  setItem(AUDIO_STORE_KEY, audioSettings);
}
