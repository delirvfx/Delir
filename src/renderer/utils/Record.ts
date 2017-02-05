import {Record as ImmutableRecord} from 'immutable'

export default class Record<R, K extends keyof R> {
    constructor(records: R) {
        const RecordClass = ImmutableRecord(records)
        Object.setPrototypeOf(this, RecordClass.prototype)
        RecordClass.call(this)
    }

    get(key: K): R[K] {
        return ImmutableRecord.prototype.get.call(key)
    }

    set(key: K, value: R[K]): Record<R, K> {
        return ImmutableRecord.prototype.set.call(this, key, value)
    }
}