class ServerTiming {
  private convertToMs(hrtime) {
    const ms = hrtime[0] * 1e3 + hrtime[1] * 1e-6;
    return ms.toFixed(3);
  }

  public setTiming(response: any, timeDifference: [number, number], name: string) {
    if (response) {
      const timeDifferenceMs = this.convertToMs(timeDifference);
      const timingHeader = response.getHeaders()['server-timing'];
      const curTiming = timingHeader && `${timingHeader},`;
      response.setHeader('Server-Timing', `${curTiming || ''}${name};dur=${timeDifferenceMs}`);
    }
  }
}

export const serverTiming = new ServerTiming();
