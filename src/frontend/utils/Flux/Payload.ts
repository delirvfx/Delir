export default class Payload<T, P> {
    constructor(public type: T, public entity: P) {}
}
