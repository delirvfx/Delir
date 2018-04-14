
export type Listener<T> = (payload: T) => void

export default class Emitter<Events extends object> {
    private listeners: {
        [K in keyof Events]: ((payload: Events[K]) => void)[]
    } = Object.create(null)

    public on<T extends keyof Events>(event: T, listener: Listener<Events[T]>): void {
        this.listeners[event] = this.listeners[event] || []
        this.listeners[event].push(listener)
    }

    public emit<T extends keyof Events>(event: T, payload: Events[T]): void {
        if (!this.listeners[event]) return
        this.listeners[event].forEach(listener => listener(payload))
    }

    public off<T extends keyof Events>(event?: T, listener?: Listener<Events[T]>): void {
        if (!event) {
            this.listeners = Object.create(null)
            return
        }

        if (!listener) {
            this.listeners[event] = []
            return
        }

        if (!this.listeners[event]) return
        this.listeners[event] = this.listeners[event].filter(fn => fn !== listener)
    }
}
