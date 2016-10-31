import _ from 'lodash'
import {ReduceStore} from 'flux/utils'

import Delir from 'delir-core'
const {Helper: DelirHelper} = Delir

import dispatcher from '../dispatcher'
import ActionTypes from '../action-types'
import AppStore from './app-store'

import fs from 'fs'

class EditorStateStore extends ReduceStore<Object>
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
        // ["project:init"](state, action)
        // {
        //     return Object.assign({}, state, {project: action.payload})
        // },

        // ["project:save"](state, action)
        // {
        //     fs.writeFileSync(action.payload.path, state.project.serialize())
        //     return state
        // },

        [ActionTypes.CHANGE_ACTIVE_COMPOSITION](state, {compositionId})
        {
            if (! state.project) {
                return state
            }

            const targetComp = _.find(Array.from(state.project.compositions.values()), {id: compositionId})
            return Object.assign({}, state, {activeComp: targetComp})
        },

        [ActionTypes.CHANGE_ACTIVE_LAYER](state, {layerId})
        {
            if (! state.project) {
                return state
            }

            if (layer == null) {
                return Object.assign({}, state, {activeLayer: null})
            }

            const targetLayer = DelirHelper.findLayerById(layerId)
            return Object.assign({}, state, {activeLayer: targetLayer})
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
            return this.reducers[action.type](state, action.payload)
        }

        return state
    }
}

export default new ProjectStore(dispatcher)
