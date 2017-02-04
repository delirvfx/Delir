import _ from 'lodash'
import {ReduceStore} from 'flux/utils'

import Delir from 'delir-core'
const {Helper: DelirHelper} = Delir

import dispatcher from '../dispatcher'

class WindowStore extends ReduceStore<Object>
{
    getInitialState(): Object
    {
        return {
            panes: {}
        }
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
