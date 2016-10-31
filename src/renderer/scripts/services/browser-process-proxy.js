import {ipcRenderer} from 'electron'
import dispatcher from '../dispatcher'

export default {
    initialize: () => {
        ipcRenderer.on('action', (e, action) => {
            dispatcher.dispatch({
                type: action.type,
                payload: action.payload,
            })
        })
    },
}
