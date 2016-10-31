import _ from 'lodash'
import {ReduceStore} from 'flux/utils'

import Delir from 'delir-core'
const {Helper: DelirHelper} = Delir

import dispatcher from '../dispatcher'
import AppStore from './app-store'

import fs from 'fs'

class ProjectStore extends ReduceStore<Object>
{
    getInitialState(): Object
    {
        return {
            project: null,
            activeComp: null,
            activeLayer: null,
            renderFrame: null,
        }
    }

    reducers = {
        ["project:init"](state, action)
        {
            return Object.assign({}, state, {project: action.payload})
        },

        ["project:save"](state, action)
        {
            fs.writeFileSync(action.payload.path, state.project.serialize())
            return state
        },

        ["change-active-composition"](state, action)
        {
            if (! state.project) {
                return state
            }

            let targetComp = _.find(Array.from(state.project.compositions.values()), {id: action.payload})
            return Object.assign({}, state, {activeComp: targetComp})
        },

        ["change-active-layer"](state, action)
        {
            if (! state.project) {
                return state
            }

            if (action.layer == null) {
                return Object.assign({}, state, {activeLayer: null})
            }

            let targetLayer = DelirHelper.findLayerById(action.payload)
            return Object.assign({}, state, {activeLayer: layer})
        },

        ["move-layer-to-timelane"](state, action)
        {
            const {layerId, timelaneId} = action.payload

            const targetLayer = DelirHelper.findLayerById(state.project, layerId)
            const sourceLane = DelirHelper.findParentTimelaneByLayerId(state.project, layerId)
            const destLane = DelirHelper.findTimelaneById(state.project, timelaneId)

            // console.log(sourceLane.layers.has(targetLayer))
            // console.log(sourceLane.layers.delete(targetLayer))

            sourceLane.layers.delete(targetLayer)
            destLane.layers.add(targetLayer)

            return Object.assign({}, state)
        },

        ["mod-composition-name"](state, action)
        {
            if (! state.project) {
                return
            }

            const targetComp = DelirHelper.findCompositionById(state.project, action.payload.compId)
            console.log(targetComp);
            targetComp.name = action.payload.newName
            return Object.assign({}, state)
        },
    }

    reduce(state: Object, action: Object)
    {
        if (this.reducers[action.type]) {
            return this.reducers[action.type](state, action)
        }

        return state
    }
}

export default new ProjectStore(dispatcher)
