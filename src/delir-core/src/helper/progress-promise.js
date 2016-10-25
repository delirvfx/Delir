const _defer = () => {
    const promise = {}
    promise.promise = new Promise((resolve, reject) => {
        promise.resolve = resolve
        promise.reject = reject
    })

    return promise
}

export default class ProgressPromise
{
    static defer()
    {
        const pp = {}
        pp.promise = new ProgressPromise((resolve, reject, onAbort, notifier) => {
            pp.resolve = resolve
            pp.reject = reject
            pp.onAbort = onAbort
            pp.notifier = notifier
        })

        return pp
    }

    _abortCallbacks = []
    _progressListeners = []

    constructor(executor: Function)
    {
        this._abortPromise = _defer()
        this._promise = _defer()

        const onAbort = callback => {
            this._abortCallbacks.push(callback)
        }

        const notifier = progress => {
            this._progressListeners.forEach(listener => listener(progress))
        }

        try {
            executor(this._promise.resolve, this._promise.reject, onAbort, notifier)
        } catch (e) {
            this._promise.reject(e)
        }
    }

    then(onFulfilled, onFailed)
    {
        return this._promise.promise.then(onFulfilled, onFailed);
    }

    catch(onFailed)
    {
        return this._promise.promise.catch(onFailed)
    }

    abort()
    {
        if (this._abortCallbacks) {
            this._abortCallbacks.forEach(abort => abort())
            this._abortCallbacks = null
        }
    }

    progress(listener)
    {
        this._progressListeners.push(listener)
    }
}
