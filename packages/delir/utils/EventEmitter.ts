export class EventEmitter<T extends { [event: string]: any }> {
    protected exclusiveEvents: string[] = []
    private listeners: { [K in keyof T]: ((arg: T[K]) => void)[] } = Object.create({})

    public on<K extends keyof T>(event: K, listener: (arg: T[K]) => void) {
        const listeners = (this.listeners[event] = this.listeners[event] || [])

        if (this.exclusiveEvents.includes(event as string)) {
            this.listeners[event] = [listener]
        } else {
            listeners.push(listener)
        }
    }

    public off<K extends keyof T>(event: K, listener: (arg: T[K]) => void) {
        if (!this.listeners[event]) return

        const index = this.listeners[event].findIndex(l => l === listener)
        if (index === -1) return
        this.listeners[event].splice(index, 1)
    }

    public emit<K extends keyof T>(event: K, arg: T[K]) {
        if (!this.listeners[event]) return
        this.listeners[event].forEach(listener => listener(arg))
    }
}
