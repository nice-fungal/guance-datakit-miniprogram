import { UUID, performDraw } from '../helper/utils';
export var SessionType = {
  SYNTHETICS: 'synthetics',
  USER: 'user'
};
export class sessionManagement {
  constructor(configuration) {
    this.sessionId = UUID();
    this.isTrack = performDraw(configuration.sampleRate);
  }
  getSessionId() {
    return this.sessionId;
  }
  isTracked() {
    return this.isTrack;
  }
}