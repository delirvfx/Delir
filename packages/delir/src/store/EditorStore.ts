import { createStore, listen, Store } from '@ragg/fleur'
import acts from '../usecases/action'

interface State {
    count: number
}

export const a = createStore<any>({
    handleIncrease: listen(acts.increment, (state, payload) => {
        payload.increase
    })
})

export default class EditorStore extends Store<State> {
    public state: State

    private handleIncrease = listen(acts.increment, (payload) => {
        payload.increase
        // state.count
        this.produce(d => d.count++)
    })
}
