import { IAudioContext } from 'standardized-audio-context';

const eventTypes =
  'ontouchstart' in window ? ['touchstart', 'touchend'] : ['click'];

export default function unlockAudioContext(context: IAudioContext) {
  return new Promise((resolve, reject) => {
    const unlock = () => {
      context.resume().then(
        () => {
          eventTypes.forEach((eventType) => {
            document.body.removeEventListener(eventType, unlock);
          });

          resolve(true);
        },
        (reason: unknown) => {
          reject(reason);
        }
      );
    };

    if (context.state === 'suspended') {
      eventTypes.forEach((eventType) => {
        document.body.addEventListener(eventType, unlock, false);
      });
    } else {
      resolve(false);
    }
  });
}
