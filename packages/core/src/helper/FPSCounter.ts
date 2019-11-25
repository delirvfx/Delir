export default class FPSCounter {
  private lastCommitTime: number = 0
  private _latestFPS: number = 0

  public increase = () => {
    const now = Date.now()
    this._latestFPS = 1000 / (now - this.lastCommitTime)
    this.lastCommitTime = now
  }

  public latestFPS = () => {
    return this._latestFPS
  }

  public reset = () => {
    this.lastCommitTime = Date.now()
    this._latestFPS = 0
  }
}
