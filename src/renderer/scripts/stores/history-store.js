import _ from 'lodash'
import {ReduceStore} from 'flux/utils'

import Delir from 'delir-core'
const {Helper: DelirHelper} = Delir

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
            return Object.assign({}, {
                historyStack: [...state.historyStack, payload],
                redoStack: [],
            })
        },
        [ActionTypes.HISTORY_UNDO](state, payload)
        {

        },
        [ActionTypes.HISTORY_REDO](state, payload)
        {

        },
    }

    reduce(state: Object, action: Object)
    {
        switch (action.type) {
        case 'pane-resize': {
            return Object.assign({}, state, {
                panes: Object.assign(state.panes, {
                    [action.payload.paneId]: action.payloadSize,
                })
            })
        }
        }
        return state
    }
}

export default new WindowStore(dispatcher)
