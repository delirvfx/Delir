export interface DeferredPromise<T> {
    resolve: (value?: T) => void
    reject: (error?: Error) => void
    promise: Promise<T>
}
declare type PromiseProcessor<T, PT> = (
    resolve: (value?: T) => void,
    reject: (error?: Error) => void,
    onAbort: (aborter: () => void) => void,
    notifier: (message: PT) => void,
) => Promise<T> | void
export default class ProgressPromise<T, PT = any> {
    public static defer<T>(): DeferredPromise<T>
    private _promise
    private _isCompleted
    private _abortCallbacks
    private _progressListeners
    constructor(resolver: PromiseProcessor<T, PT>)
    public then(onFulfilled: (value: any) => void, onFailed?: (value: Error) => void): this
    public catch(onFailed: (e: Error) => void): this
    public abort(): this
    public progress(listener: (progress: PT) => void): this
}
export {}
