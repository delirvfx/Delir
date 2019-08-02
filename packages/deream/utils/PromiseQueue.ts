export default class PromiseQueue {
  private _running: boolean
  private _timerId: number = -1
  private _queue: (() => Promise<any>)[] = []

  public run() {
    if (this._running) return

    this._running = true
    this.next()
  }

  public waitEmpty() {
    return new Promise(resolve => {
      const check = () => {
        if (this._queue.length === 0) resolve()
        else setTimeout(check)
      }

      setTimeout(check)
    })
  }

  public stop() {
    clearTimeout(this._timerId)
    this._running = false
  }

  public add(task: () => Promise<any>) {
    this._queue.push(task)
  }

  private next = async () => {
    // if (this._current) return

    const task = this._queue.pop()

    if (!task) {
      this._timerId = setTimeout(this.next)
      return
    }

    try {
      await task()
    } catch (e) {
      this._timerId = setTimeout(this.next)
      throw e
    }

    this._timerId = setTimeout(this.next)
  }
}
