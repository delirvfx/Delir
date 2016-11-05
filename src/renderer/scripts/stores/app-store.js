import {ReduceStore} from 'flux/utils'

import dispatcher from '../dispatcher'

class AppStore extends ReduceStore<Object>
{
    getInitialState(): Object
    {
        return {
            pluginRegistry: null,
            renderer: null,
        }
    }

    reduce(state: Object, action: Object)
    {
        switch (action.type) {
        case 'app-set-plugin-registry':
            return Object.assign({}, state, {
                pluginRegistry: action.payload
            })
        case 'app-set-renderer':
            return Object.assign({}, state, {
                renderer: action.payload
            })
        }

        return state
    }
}

export default new AppStore(dispatcher)
