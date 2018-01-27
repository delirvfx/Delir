import * as _ from 'lodash'
import {ReduceStore} from 'flux/utils'
import * as Immutable from 'immutable'

import * as Delir from 'delir-core'
import {ProjectHelper} from 'delir-core'

import dispatcher from '../utils/Flux/Dispatcher'
import Record from '../utils/Record'
import {KnownPayload} from '../actions/PayloadTypes'
import {DispatchTypes as AppActionsDispatchTypes, DragEntity} from '../actions/App'
import {DispatchTypes as ProjectModDispatchTypes} from '../actions/ProjectMod'

type StateRecord = Record<EditorState>

export interface NotificationEntry {
    id: string
    title?: string
    message: string
    level: 'info'|'error'
    detail?: string
}

export type NotificationEntries = Immutable.List<NotificationEntry>

export interface EditorState {
    project: Delir.Project.Project|null
    projectPath: string|null
    activeComp: Delir.Project.Composition|null
    activeClip: Delir.Project.Clip|null
    dragEntity: DragEntity|null
    processingState: string|null
    previewPlayed: boolean
    currentPreviewFrame: number
    notifications: NotificationEntries
}

class EditorStateStore extends ReduceStore<StateRecord, KnownPayload>
{
    public getInitialState(): StateRecord
    {
        return new Record<EditorState>({
            project: null,
            projectPath: null,
            activeComp: null,
            activeClip: null,
            dragEntity: null,
            processingState: null,
            previewPlayed: false,
            currentPreviewFrame: 0,
            notifications: Immutable.List<NotificationEntry>()
        })
    }

    reduce(state: StateRecord, payload: KnownPayload)
    {
        const project = state.get('project') as Delir.Project.Project

        switch (payload.type) {
            case AppActionsDispatchTypes.SetActiveProject: {
                __DEV__ && console.log('✨ Project activated', payload.entity.project)

                const newState = state
                    .set('project', payload.entity.project)
                    .set('projectPath', payload.entity.path!)

                // No clear activeComposition etc, if project saved as new file
                if (payload.entity.project === state.get('project')) return newState

                return newState
                    .set('activeComp', null)
                    .set('activeClip', null)
            }


            case AppActionsDispatchTypes.ClearActiveProject:
                __DEV__ && console.log('💥 Project deactivated')

                return state
                    .set('project', null)
                    .set('activeComp', null)
                    .set('activeClip', null)

            case ProjectModDispatchTypes.RemoveClip: {
                const activeClip = state.get('activeClip')
                if (activeClip && activeClip.id === payload.entity.targetClipId) {
                    return state.set('activeClip', null)
                }

                break
            }

            case ProjectModDispatchTypes.RemoveLayer: {
                const activeClip = state.get('activeClip')
                if (!activeClip) break

                const clipContainedLayer = ProjectHelper.findParentLayerByClipId(project, activeClip.id)
                if (!clipContainedLayer) {
                    return state.set('activeClip', null)
                }

                const contains = !!clipContainedLayer.clips.find(clip => clip.id === activeClip.id)
                if (contains) {
                    return state.set('activeClip', null)
                }

                break
            }

            case AppActionsDispatchTypes.SetDragEntity:
                return state.set('dragEntity', payload.entity)

            case AppActionsDispatchTypes.ClearDragEntity:
                return state.set('dragEntity', null)

            case AppActionsDispatchTypes.ChangeActiveComposition:
                if (project == null) return state

                const comp = ProjectHelper.findCompositionById(project, payload.entity.compositionId)
                return state.set('activeComp', comp).set('activeClip', null)

            case AppActionsDispatchTypes.ChangeActiveClip:
                if (project == null) return state

                const clip = ProjectHelper.findClipById(project, payload.entity.clipId)
                return state.set('activeClip', clip)

            case AppActionsDispatchTypes.UpdateProcessingState:
                return state.set('processingState', payload.entity.stateText)

            case AppActionsDispatchTypes.StartPreview:
                return state.set('previewPlayed', true)

            case AppActionsDispatchTypes.StopPreview:
                return state.set('previewPlayed', false)

            case AppActionsDispatchTypes.SeekPreviewFrame:
                return state.set('currentPreviewFrame', Math.round(payload.entity.frame))

            case AppActionsDispatchTypes.AddMessage:
                return state.set('notifications', state.get('notifications').push({
                    id: payload.entity.id,
                    title: payload.entity.title,
                    message: payload.entity.message!,
                    level: payload.entity.level,
                    detail: payload.entity.detail,
                }))

            case AppActionsDispatchTypes.RemoveMessage: {
                const notifications = state.get('notifications')
                const idx = notifications.findIndex(entry => entry!.id === payload.entity.id)
                return state.set('notifications', notifications.remove(idx))
            }
        }

        return state
    }
}

const store = new EditorStateStore(dispatcher)

if (__DEV__) {
    _.set(window, 'app.store.EditorStateStore', store)
}

export default store
