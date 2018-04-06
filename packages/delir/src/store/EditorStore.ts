import { Store } from '@ragg/fleur'
import immer from 'immer'

// import Actions, { Actions as ActionTypes, PickAction } from '../usecases/action'

interface State {
    count: number
}

export default class EditorStore extends Store<State> {
    public static handlers = {
        'INCREASE': 'increase'
    }

    public static getHandlerMap(ctx: StoreContext) {
        return {
            [ctx.actionTypes.INCREASE]: 'increase'
        }
    }

    protected state: State = { count: 1 }

    public produce(draft: typeof this) {

    }

    public getState(): {} {
        return {}
    }

    public getCount(): number {
        return this.state.count
    }

    private increase() {
        this.produce(d => d.count++)
        console.log(this.state)
    }
}
