import dispatcher from './dispatcher'

export default {
    changeActiveComposition(compId: string)
    {
        dispatcher.dispatch({
            type: 'change-active-composition',
            payload: compId
        })
    },

    changeActiveLayer(layerId: string)
    {
        dispatcher.dispatch({
            type: 'change-active-layer',
            payload: layerId,
        })
    },

    // TODO: frame position
    moveLayerToTimelane(layerId: string, timelaneId: string)
    {
        dispatcher.dispatch({
            type: 'move-layer-to-timelane',
            payload: {layerId, timelaneId},
        })
    },

    // Modify Project
    modifyCompositionName(compId: string, newName: string)
    {
        dispatcher.dispatch({
            type: 'mod-composition-name',
            payload: {compId, newName}
        })
    },

    previewPlay()
    {
        dispatcher.dispatch({
            type: 'preview-play',
            // payload: {layerId, timelaneId},
        })
    },

    destinate()
    {
        dispatcher.dispatch({
            type: 'destinate',
            // payload: {layerId, timelaneId},
        })
    }
}
