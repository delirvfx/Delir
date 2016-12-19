import keyMirror from 'keymirror'

export default keyMirror({
    // EditorStateActions
    SET_ACTIVE_PROJECT: null,
    CHANGE_ACTIVE_COMPOSITION: null,
    CHANGE_ACTIVE_LAYER: null,

    TOGGLE_PREVIEW: null,
    RENDER_DESTINATE: null,
    UPDATE_PROCESSING_STATE: null, // {state: string}

    // ProjectModifyActions
    MOVE_LAYER_TO_TIMELINE: null,
    ADD_ASSET: null,
    CREATE_COMPOSTION: null,
    CREATE_TIMELANE: null,
    CREATE_LAYER: null,
    MODIFY_COMPOSITION: null,

    REMOVE_TIMELANE: null,
    REMOVE_LAYER: null,

    // ProjectModifyStore
    CREATE_COMPOSTION: null,

    HISTORY_PUSH: null, // {undo: Function, redo: Funcion}
    HISTORY_UNDO: null,
    HISTORY_REDO: null,
})
