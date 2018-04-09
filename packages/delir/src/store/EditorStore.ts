import { actionListener, createStore, Store } from '@ragg/fleur'
import acts from '../usecases/action'

interface State {
    count: number
}

export default createStore<any>({
    handleIncrease: actionListener(acts.increment, (state, payload) => {
        payload.increase
    })
})

class EditorStore extends Store<State> {
    private increase(payload) {
        this.produce(d => d.count++)
    }
}
