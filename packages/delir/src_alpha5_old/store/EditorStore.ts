import { listen, Store } from '@ragg/fleur'

import Actions from '../usecases/action'

interface State {
    count: number
}

export default class EditorStore extends Store<State> {
    public static storeName = 'EditorStore'

    protected state: State = {
        count: 1
    }

    private increase = listen(Actions.increment, ({increase}) => {
        this.updateWith(draft => draft.count += increase)
    })

    public getCount = () => this.state.count
}
