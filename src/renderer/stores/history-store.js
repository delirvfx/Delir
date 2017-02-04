import _ from 'lodash'
import {ReduceStore} from 'flux/utils'

import dispatcher from '../dispatcher'
import ActionTypes from '../action-types'

class HistoryStore extends ReduceStore<Object>
{
    getInitialState(): Object
    {
        return {
            historyStack: [],
            redoStack: [],
        }
    }

    reducers = {
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

    reduce(state: Object, {type, payload}: Object)
    {
        if (this.reducers[type]) {
            return this.reducers[type](payload)
        }

        return state
    }
}

export default new HistoryStore(dispatcher)
