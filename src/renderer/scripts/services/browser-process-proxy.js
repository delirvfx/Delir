import {ipcRenderer, shell, remote} from 'electron'
import {join} from 'path'
import dispatcher from '../dispatcher'
import ActionTypes from '../action-types';

const handlers = {
    [ActionTypes.OPEN_PLUGIN_DIR]()
    {
        shell.showItemInFolder(join(remote.app.getPath('appData'), 'delir/plugins'))
    },
}

export default {
    initialize: () => {
        ipcRenderer.on('action', (e, action) => {
            if (handlers[action.type]) {
                handlers[action.type](action.payload)
            }
        })
    },
}
