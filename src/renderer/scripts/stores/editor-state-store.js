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
            processingState: null,
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

        [ActionTypes.UPDATE_PROCESSING_STATE](state, {stateText})
        {
            return Object.assign({}, state, {processingState: stateText})
        }


        // ["mod-composition-name"](state, {})
        // {
        //     if (! state.project) {
        //         return
        //     }
        //
        //     const targetComp = DelirHelper.findCompositionById(state.project, payload.compId)
        //     console.log(targetComp);
        //     targetComp.name = payload.newName
        //     return Object.assign({}, state)
        // },
    }

    reduce(state: Object, {type, payload}: Object)
    {
        if (this.reducers[type]) {
            return this.reducers[type](state, payload)
        }

        return state
    }
}

export default new EditorStateStore(dispatcher)
