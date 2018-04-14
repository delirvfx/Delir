import { listen, Store } from '@ragg/fleur'

interface State {
}

export default class EditorStore extends Store<State> {
    public state: State
}
