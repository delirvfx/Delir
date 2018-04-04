import Emitter from './Emitter'

interface Events {
    onChange: void
}

export interface StoreConstructor { new (...args: any[]): Store }

export type InstanceOf<T extends StoreConstructor> = T extends ({ new(...args: any[]): infer I }) ? I : never

export default class Store extends Emitter<Events> {
    public rehydrate() {}
    public dehydrate() {}
}
