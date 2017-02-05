import {ReduceStore} from 'flux/utils'
import {Disposable} from 'event-kit';

export default class DisposableReduceStore<T> extends ReduceStore
{
    addListener(listener: Function)
    {
        const remover = super(listener)
        return new Disposable(() => remover())
    }
}
