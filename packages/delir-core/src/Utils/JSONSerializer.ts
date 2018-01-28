interface Serializer<D, S> {
    (object: D): S
}

interface Deserializer<D, S> {
    (object: S): D
}

interface TypeEntry<D, S> {
    serialize: Serializer<D, S>
    deserialize: Deserializer<D, S>
}

interface TypeSection {
    _type: string | null
    _value: any
}

interface AnyConstructor {
    new (): any
}

export default class JSONSerializer {
    private serializerMap: Map<AnyConstructor, TypeEntry<any, any>> = new Map()
    private deserializerMap: Map<string, TypeEntry<any, any>> = new Map()

    public addType<D, S>(typeName: string, constructor: AnyConstructor, entry: TypeEntry<D, S>) {
        if (this.serializerMap.has(constructor)) {
            throw new Error(`Constructor ${constructor.name} already added`)
        }

        if (this.deserializerMap.has(typeName)) {
            throw new Error(`Type ${typeName} already added`)
        }

        this.serializerMap.set(constructor, entry)
        this.deserializerMap.set(typeName, entry)
    }

    public serialize(object: any, serialized: Set<any> = new Set()): any {
        if (Array.isArray(object)) {
            return object.map(elm => this.serialize(elm))
        } else if (object === null) {
            return null
        } else if (object === undefined) {
            throw new Error('Serialize target must be not undefined')
        } else if (typeof object === 'function') {
            throw new Error('Can not serialize Function')
        } else if (typeof object === 'object') {
            if (serialized.has(object)) {
                throw new Error('Circular reference detected')
            }

            const { constructor } = object
            serialized.add(object)

            if (this.serializerMap.has(constructor)) {
                const { serialize } = this.serializerMap.get(constructor)
                return { _type: null, _value: serialize(object) }
            } else {
                const storage: TypeSection = { _type: null, _value: Object.create(null) }

                for (const key of Object.keys(object)) {
                    storage._value[key] = this.serialize(object[key], serialized)
                }

                return storage
            }
        } else {
            // other primitive values
            return object
        }
    }

    public deserialize(object: )
}



const a = new JSONSerializer
a.addType<Date, { time: number }>('Date', Date, {
    serialize: (object: Date) => ({ time: object.getTime() }),
    deserialize: (obj) => new Date(obj.time),
})
