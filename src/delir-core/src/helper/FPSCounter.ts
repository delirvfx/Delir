export default class FPSCounter {
    private _count: number = 0
    private _lastCommitTime: number = 0
    private _latestFPS: number = 0

    public increase = () => {
        this._count++

        const now = Date.now()
        if (now - this._lastCommitTime > 1000) {
            this._lastCommitTime = Date.now()
            this._latestFPS = this._count
            this._count = 0
        }
    }

    public latestFPS = () => {
        return this._latestFPS
    }

    public reset = () => {
        this._count = 0
        this._lastCommitTime = 0
        this._latestFPS = 0
    }
}
