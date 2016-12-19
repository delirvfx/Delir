const _defer = <T>(): DeferredPromise<T> => {
    const promise: any = {}
    promise.promise = new Promise<any>((resolve, reject) => {
        promise.resolve = resolve
        promise.reject = reject
    })

    return (promise as DeferredPromise<T>)
}

export interface DeferredPromise<T> {
    resolve: (value: T) => void;
    reject: (error: Error) => void;
    promise: Promise<T>;
}

type PromiseProcessor<T> = (
    resolve: (value: T) => void,
    reject: (error: Error) => void,
    onAbort: (aborter: () => void) => void,
    notifier: (message: any) => void
) => void

export default class ProgressPromise<T>
{
    static defer<T>()
    {
        const pp: any = {}
        pp.promise = new ProgressPromise((resolve, reject, onAbort, notifier) => {
            pp.resolve = resolve
            pp.reject = reject
            pp.onAbort = onAbort
            pp.notifier = notifier
        })

        return (pp as DeferredPromise<T>)
    }

    private _promise: DeferredPromise<any> = _defer<T>()

    private _abortCallbacks: Function[]|null = []
    private _progressListeners: Function[] = []

    constructor(executor: PromiseProcessor<T>)
    {
        const onAbort = (callback: () => void) => {
            this._abortCallbacks!.push(callback)
        }

        const notifier = (progress: () => void) => {
            this._progressListeners.forEach(listener => listener(progress))
        }

        try {
            executor(this._promise.resolve, this._promise.reject, onAbort, notifier)
        } catch (e) {
            this._promise.reject(e)
        }
    }

    then(onFulfilled: (value: any) => void, onFailed: (value: Error) => void): this
    {
        this._promise.promise.then(onFulfilled, onFailed);
        return this
    }

    catch(onFailed: (e: Error) => void): this
    {
        this._promise.promise.catch(onFailed)
        return this
    }

    abort(): this
    {
        if (this._abortCallbacks) {
            this._abortCallbacks.forEach(abort => abort())
            this._abortCallbacks = null
        }
        return this
    }

    progress(listener: (progress: any) => void): this
    {
        this._progressListeners.push(listener)
        return this
    }
}
