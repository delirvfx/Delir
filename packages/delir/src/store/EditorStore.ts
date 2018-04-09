import { Action, createStore, Store } from '@ragg/fleur'
import immer from 'immer'

import { KnownActions } from '../usecases/action'

interface State {
    count: number
}

export default createStore<KnownActions>({
    handlers: {
        'INCREASE': (arg) => { arg.increase }
    },
    // a: (a: KnownActions) => {
    //     switch(a.type) {
    //         case 'DECREASE': {
    //             a.payload.
    //         }
    //     }
    // }
})

class EditorStore extends Store<State> {
//     public handlers = {
//         'INCREASE': this.increase
//     }

//     protected state: State = { count: 1 }

//     public getCount(): number {
//         return this.state.count
//     }

    private increase(payload) {
        this.produce(d => d.count++)
    }
}
