export default {
    //
    // Modify project
    //

    // TODO: frame position
    moveLayerToTimelane(layerId: string, targetTimelaneId: string)
    {
        dispatcher.dispatch({
            type: 'move-layer-to-timelane',
            payload: {layerId, targetTimelaneId},
        })
    },

    changeCompositionName(compId: string, newName: string)
    {
        dispatcher.dispatch({
            type: 'change-composition-name',
            payload: {compId, newName}
        })
    },
}
