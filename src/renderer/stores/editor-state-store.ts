import * as _ from 'lodash'
import {ReduceStore} from 'flux/utils'
import * as Immutable from 'immutable'

import * as Delir from 'delir-core'
import {ProjectHelper} from 'delir-core'

import dispatcher from '../dispatcher'
import Record from '../utils/Record'
import {KnownPayload} from '../actions/PayloadTypes'
import {DispatchTypes as EditorStateDispatchTypes, DragEntity} from '../actions/editor-state-actions'

type StateRecord = Record<EditorState, keyof EditorState>
export interface EditorState {
    project: Delir.Project.Project|null,
    activeComp: Delir.Project.Composition|null,
    activeLayer: Delir.Project.Layer|null,
    dragEntity: DragEntity|null,
    processingState: string|null,
}

class EditorStateStore extends ReduceStore<StateRecord, KnownPayload>
{
    getInitialState(): StateRecord
    {
        return new Record({
            project: null,
            activeComp: null,
            activeLayer: null,
            dragEntity: null,
            processingState: null,
        })
    }

    reduce(state: StateRecord, payload: KnownPayload)
    {
        const project = state.get('project') as Delir.Project.Project

        switch (payload.type) {
            case EditorStateDispatchTypes.SetActiveProject:
                console.log('✨ Project activated', payload.entity.project)
                return state.set('project', payload.entity.project)

            case EditorStateDispatchTypes.SetDragEntity:
                return state.set('dragEntity', payload.entity)

            case EditorStateDispatchTypes.ClearDragEntity:
                return state.set('dragEntity', null)

            case EditorStateDispatchTypes.ChangeActiveComposition:
                if (project == null) return state

                const comp = ProjectHelper.findCompositionById(project, payload.entity.compositionId)
                return state.set('activeComp', comp)
                
            case EditorStateDispatchTypes.ChangeActiveLayer:
                if (project == null) return state 

                const layer = ProjectHelper.findLayerById(project, payload.entity.layerId)
                return state.set('activeLayer', layer)

            case EditorStateDispatchTypes.UpdateProcessingState:
                return state.set('processingState', payload.entity.stateText)
        }

        return state
    }
}

const store = new EditorStateStore(dispatcher)
_.set(window, 'app.store.EditorStateStore', store)
export default store
