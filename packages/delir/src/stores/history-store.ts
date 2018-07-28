import { ReduceStore } from 'flux/utils'
import _ from 'lodash'

import ActionTypes from '../action-types'
import dispatcher from '../utils/Flux/Dispatcher'

class HistoryStore extends ReduceStore<Object>
{

    public reducers = {
        [ActionTypes.HISTORY_PUSH](state, payload)
        {
            return {
                historyStack: [...state.historyStack, payload],
                redoStack: [],
            }
        },

        [ActionTypes.HISTORY_UNDO](state, payload)
        {
            const history = state.historyState.pop()
            return {
                historyStack: [...state.historyStack],
                redoStack: [...state.redoStack, history],
            }
        },

        [ActionTypes.HISTORY_REDO](state, payload)
        {
            const history = state.redoStack.pop()
            return {
                historyStack: [...state.historyStack, history],
                redoStack: [...state.redoStack],
            }
        },
    }
    public getInitialState(): Object
    {
        return {
            historyStack: [],
            redoStack: [],
        }
    }

    public reduce(state: Object, {type, payload}: Object)
    {
        if (this.reducers[type]) {
            return this.reducers[type](payload)
        }

        return state
    }
}

export default new HistoryStore(dispatcher)
