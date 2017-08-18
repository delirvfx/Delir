export default class Payload<T, P> {
    type: T
    entity: P

    constructor(type: T, entity: P) {
        this.type = type
        this.entity = entity
    }
}