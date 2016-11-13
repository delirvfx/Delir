// @flow
export default class ProxySet<T>
{
    _set: Set<T>

    constructor(
        entries: ?Array<T>,
        handler: ?{
            [method: string]: (target: Function, thisArg: any, argumentsList: Array<*>) => any
        } = {}
    ) {
        this._set = new Set(entries)

        const methods: Array<string> = [
            'add',
            'clear',
            'delete',
            'entries',
            'forEach',
            'has',
            'values',
            'keys'
        ]

        methods.forEach((method: string) => {
            this[method] = new Proxy(ProxySet.prototype[method].bind(this), {
                apply: handler[method]
            })
        })
    }

    add(value: T): this
    {
        this._set.add(value)
        return this
    }

    clear()
    {
        this._set.clear()
    }

    delete(value: T): boolean
    {
        return this._set.delete(value)
    }

    entries(): Iterator<T>
    {
        return this._set.entries()
    }

    forEach(callback: Function, thisArg: ?any)
    {
        this._set.forEach(callback, thisArg)
    }

    has(value: T): boolean
    {
        return this._set.has(value)
    }

    values(): Iterator<T>
    {
        return this._set.values()
    }

    keys(): Iterator<*>
    {
        return this._set.keys()
    }
}
