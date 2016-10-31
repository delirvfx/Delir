import Delir, {Helper as DelirHelper} from 'delir-core'
// const {Helper: DelirHelper} = Delir

console.log(DelirHelper);


export default {
    //
    // Modify project
    //

    // TODO: frame position
    moveLayerToTimelane(layerId: string, targetTimelaneId: string)
    {
        const targetLayer = DelirHelper.findLayerById(state.project, layerId)
        const sourceLane = DelirHelper.findParentTimelaneByLayerId(state.project, layerId)
        const destLane = DelirHelper.findTimelaneById(state.project, targetTimelaneId)

        // console.log(sourceLane.layers.has(targetLayer))
        // console.log(sourceLane.layers.delete(targetLayer))

        sourceLane.layers.delete(targetLayer)
        destLane.layers.add(targetLayer)

        return Object.assign({}, state)

        dispatcher.dispatch({
            type: 'move-layer-to-timelane',
            payload: {layerId, targetTimelaneId},
        })
    },

    changeCompositionName(compId: string, newName: string)
    {
        // dispatcher.dispatch({
        //     type: 'change-composition-name',
        //     payload: {compId, newName}
        // })
    },
}
