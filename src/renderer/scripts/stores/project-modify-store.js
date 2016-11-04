import _ from 'lodash'
import {ReduceStore} from 'flux/utils'

import Delir from 'delir-core'
const {Helper: DelirHelper} = Delir

import dispatcher from '../dispatcher'
import ActionTypes from '../action-types'
import AppStore from './app-store'

import fs from 'fs'

class ProjectModifyStore extends ReduceStore<Object>
{
    getInitialState(): Object
    {
        return {
            project: null,
        }
    }

    reducers = {
        [ActionTypes.SET_ACTIVE_PROJECT](state, {project})
        {
            return Object.assign({}, state, {project})
        },

        // ["project:save"](state, {})
        // {
        //     fs.writeFileSync(payload.path, state.project.serialize())
        //     return state
        // },

        [ActionTypes.CREATE_COMPOSTION](state, {composition})
        {
            if (! state.project) return state

            state.project.compositions.add(composition)

            return Object.assign({}, state)
        },

        [ActionTypes.CREATE_TIMELANE](state, {timelane, targetCompositionId})
        {
            if (! state.project) return state

             const targetComp = DelirHelper.findCompositionById(state.project, targetCompositionId)
            targetComp.timelanes.add(timelane)

            return Object.assign({}, state)
        },

        [ActionTypes.CREATE_LAYER](state, {layer, targetTimelaneId})
        {
            if (! state.project) return state

            const targetTimelane = DelirHelper.findTimelaneById(state.project, targetTimelaneId)
            targetTimelane.layers.add(layer)

            return Object.assign({}, state)
        },

        [ActionTypes.MODIFY_COMPOSITION](state, {targetCompositionId, patch})
        {
            if (! state.project) return state

            const _patch = _.pick(patch, ['name', 'width', 'height', 'framerate', 'durationFrame'])
            _patch.width != null && (_patch.width = _patch.width|0)
            _patch.height != null && (_patch.height = _patch.height|0)
            _patch.framerate != null && (_patch.framerate = _patch.framerate|0)
            _patch.durationFrame != null && (_patch.durationFrame = _patch.durationFrame|0)

            const targetComposition = DelirHelper.findCompositionById(state.project, targetCompositionId)
            Object.assign(targetComposition, _patch)

            return Object.assign({}, state)
        },

        [ActionTypes.REMOVE_TIMELANE](state, {targetTimelaneId})
        {
            if (! state.project) return state

            const targetTimelane = DelirHelper.findTimelaneById(state.project, targetTimelaneId)
            const timelaneHolderComp = DelirHelper.findParentCompositionByTimelaneId(state.project, targetTimelaneId)
            timelaneHolderComp.timelanes.delete(targetLayer)

            return Object.assign({}, state)
        },

        [ActionTypes.REMOVE_LAYER](state, {targetLayerId})
        {
            if (! state.project) return state

            const targetLayer = DelirHelper.findLayerById(state.project, targetLayerId)
            const layerHolderTimelane = DelirHelper.findParentTimelaneByLayerId(state.project, targetLayerId)
            layerHolderTimelane.layers.delete(targetLayer)

            return Object.assign({}, state)
        },

        [ActionTypes.MOVE_LAYER_TO_TIMELINE](state, {layerId, targetTimelaneId})
        {
            if (! state.project) return state

            const targetLayer = DelirHelper.findLayerById(state.project, layerId)
            const sourceLane = DelirHelper.findParentTimelaneByLayerId(state.project, layerId)
            const destLane = DelirHelper.findTimelaneById(state.project, targetTimelaneId)

            sourceLane.layers.delete(targetLayer)
            destLane.layers.add(targetLayer)

            return Object.assign({}, state)
        },
    }

    reduce(state: Object, {type, payload}: Object)
    {
        if (this.reducers[type]) {
            return this.reducers[type](state, payload)
        }

        return state
    }
}

export default new ProjectModifyStore(dispatcher)
