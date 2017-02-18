import * as _ from 'lodash'
import {ReduceStore} from 'flux/utils'
import * as Immutable from 'immutable'

import * as Delir from 'delir-core'
import {ProjectHelper} from 'delir-core'

import dispatcher from '../dispatcher'
import Record from '../utils/Record'
import {KnownPayload} from '../actions/PayloadTypes'
import {DispatchTypes as EditorStateDispatchTypes, DragEntity} from '../actions/editor-state-actions'

type StateRecord = Record<EditorState>

export type NotificationEntry = {id: string, title?: string, message: string, level: 'info'|'error', detail?: string}
export type NotificationEntries = Immutable.List<NotificationEntry>

export interface EditorState {
    project: Delir.Project.Project|null,
    activeComp: Delir.Project.Composition|null,
    activeLayer: Delir.Project.Layer|null,
    dragEntity: DragEntity|null,
    processingState: string|null,
    notifications: NotificationEntries
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
            notifications: Immutable.List()
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

            case EditorStateDispatchTypes.AddMessage:
                return state.set('notifications', state.get('notifications').push({
                    id: payload.entity.id,
                    title: payload.entity.title,
                    message: payload.entity.message!,
                    level: payload.entity.level,
                    detail: payload.entity.detail,
                }))

            case EditorStateDispatchTypes.RemoveMessage: {
                const notifications = state.get('notifications')
                const idx = notifications.findIndex(entry => entry!.id === payload.entity.id)
                return state.set('notifications', notifications.remove(idx))
            }
        }

        return state
    }
}

const store = new EditorStateStore(dispatcher)
_.set(window, 'app.store.EditorStateStore', store)
export default store
