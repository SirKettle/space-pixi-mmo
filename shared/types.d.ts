declare module '*.png';
declare module '*.jpg';
declare module '*.svg';
declare module '*.mp3';
declare module '*.mp4';

declare module '*.xml' {
  const doc: XMLDocument; // Change this to an actual XML type
  export default doc;
}
