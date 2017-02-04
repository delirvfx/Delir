import _ from 'lodash'
import {ReduceStore} from 'flux/utils'

import * as Delir from 'delir-core'
import {ProjectHelper} from 'delir-core'

import dispatcher from '../dispatcher'
import ActionTypes from '../action-types'

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
            dragEntity: null,
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

        [ActionTypes.SET_DRAG_ENTITY](state, entity: {type: string, entity: any})
        {
            return Object.assign({}, state, {dragEntity: entity})
        },

        [ActionTypes.CLEAR_DRAG_ENTITY](state, entity: {type: string, entity: any})
        {
            return Object.assign({}, state, {dragEntity: null})
        },

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

            const targetLayer = ProjectHelper.findLayerById(state.project, layerId)
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
        //     const targetComp = ProjectHelper.findCompositionById(state.project, payload.compId)
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
