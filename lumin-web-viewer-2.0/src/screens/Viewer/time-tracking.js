class TimeTracking {
  constructor() {
    this.dataTracking = {};
  }

  isExist = (name) => Boolean(this.dataTracking[name]);

  isFinishedTracking = (name) => this.isExist(name) && this.dataTracking[name].endTime;

  register = (name) => {
    this.dataTracking[name] = {
      startTime: new Date().getTime(),
      endTime: 0,
    };
  };

  unRegister = (name) => {
    delete this.dataTracking[name];
  };

  finishTracking = (name) => {
    if (!this.dataTracking[name]) {
      return;
    }
    this.dataTracking[name].endTime = this.dataTracking[name].endTime || new Date().getTime();
  };

  trackingTimeOf = (name) => {
    const result = this.dataTracking[name];
    if (!result) {
      return 0;
    }
    this.finishTracking(name);
    return result.endTime - result.startTime;
  };

  getTrackingInfo = (name) => {
    if (!this.isExist(name)) {
      return null;
    }
    const trackingTimeOf = this.trackingTimeOf(name);
    return {
      ...this.dataTracking[name],
      timeTracking: trackingTimeOf,
    };
  };
}

export default new TimeTracking();
