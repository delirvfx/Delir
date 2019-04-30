export default class FPSCounter {
    public increase: () => void
    public latestFPS: () => number
    public reset: () => void
    private _count
    private _lastCommitTime
    private _latestFPS
}
