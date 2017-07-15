import {Record as ImmutableRecord} from 'immutable'

export default class Record<R> {
    constructor(records: R) {
        const RecordClass = ImmutableRecord(records)
        Object.setPrototypeOf(this, RecordClass.prototype)
        RecordClass.call(this)
    }

    public get<K extends keyof R>(key: K): R[K]
    {
        return ImmutableRecord.prototype.get.call(key)
    }

    public set<K extends keyof R>(key: K, value: R[K]): Record<R>
    {
        return ImmutableRecord.prototype.set.call(this, key, value)
    }

    public equals(other: Record<any>): boolean
    {
        return ImmutableRecord.prototype.equals(other)
    }
}
