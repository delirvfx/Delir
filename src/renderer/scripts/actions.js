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
    }
}
