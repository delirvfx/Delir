import * as _ from 'lodash'
import * as React from 'react'
import {PropTypes} from 'react'
import * as Delir from 'delir-core'
import parseColor from 'parse-color'
import connectToStores from '../../utils/connectToStores'

import Workspace from '../components/workspace'
import Pane from '../components/pane'
import SelectList from '../components/select-list'
import DelirValueInput from './_DelirValueInput'

import ProjectModifyActions from '../../actions/project-modify-actions'

import {default as EditorStateStore, EditorState} from '../../stores/editor-state-store'
import {default as ProjectModifyStore, ProjectModifyState} from '../../stores/project-modify-store'
import RendererService from '../../services/renderer'

import * as s from './style.styl'

interface KeyframeViewProps {
    activeClip: Delir.Project.Clip|null
    editor: EditorState
    project: ProjectModifyState
}

interface KeyframeViewState {
    activePropName: string|null
}

@connectToStores([EditorStateStore], () => ({
    editor: EditorStateStore.getState(),
    project: ProjectModifyStore.getState()
}))
export default class KeyframeView extends React.Component<KeyframeViewProps, KeyframeViewState> {
    static propTypes = {
        activeClip: PropTypes.instanceOf(Delir.Project.Clip)
    }

    state: KeyframeViewState = {
        activePropName: null,
    }

    castValue = (desc: Delir.AnyParameterTypeDescriptor, value: string|number) =>
    {

        return value
    }

    selectProperty = ({currentTarget}: React.MouseEvent<HTMLDivElement>) =>
    {
        const propName: string = currentTarget.dataset.propName!
        this.setState({activePropName: propName})
    }

    valueChanged = (desc: Delir.AnyParameterTypeDescriptor, value: any) =>
    {
        const {activeClip, editor: {currentPreviewFrame}} = this.props
        if (!activeClip) return

        console.log(value)
        ProjectModifyActions.createOrModifyKeyframe(activeClip.id!, desc.propName, currentPreviewFrame, {value})
    }

    render()
    {
        const {activeClip, project: {project}, editor} = this.props
        const {activePropName} = this.state
        const descriptors = activeClip
            ? RendererService.pluginRegistry!.getParametersById(activeClip.renderer) || []
            : []


        return (
            <Workspace direction='horizontal' className={s.keyframeView}>
                <Pane className={s.propList}>
                    <SelectList>
                        {descriptors.map(desc => {
                            const value = activeClip
                                ? Delir.KeyframeHelper.calcKeyframeValueAt(editor.currentPreviewFrame, desc, activeClip.keyframes[desc.propName] || [])
                                : undefined

                            return (
                                <div
                                    key={activeClip!.id + desc.propName}
                                    className={s.propItem}
                                    data-prop-name={desc.propName}
                                    onClick={this.selectProperty}
                                >
                                    <span className={s.propItemName}>{desc.label}</span>
                                    <div className={s.propItemInput}>
                                        <DelirValueInput key={desc.propName} assets={project ? project.assets : null} descriptor={desc} value={value} onChange={this.valueChanged} />
                                    </div>
                                </div>
                            )
                        })}
                    </SelectList>
                </Pane>
                <Pane>
                    <div className={s.keyframes}>
                        <svg>
                        </svg>
                    </div>
                </Pane>
            </Workspace>
        )
    }
}