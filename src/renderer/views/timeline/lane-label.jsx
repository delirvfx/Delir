import React, {PropTypes} from 'React'
import classnames from 'classnames'

import RendererService from '../../services/renderer'
import EditorStateStore from '../../stores/editor-state-store'

import LabelInput from '../components/label-input'
import {ContextMenu, MenuItem} from '../electron/context-menu'
import LaneLabelProps from './lane-label-props'

export default class LaneLabel extends React.Component
{
    static propTypes = {
        timelane: PropTypes.object.isRequired,
        onSelect: PropTypes.func.isRequired,
        onRemove: PropTypes.func.isRequired,
    }

    constructor(...args)
    {
        super(...args)

        this.state = {
            editorState: EditorStateStore.getState(),
        }

        this.removers = [
            EditorStateStore.addListener(() => {
                this.setState(EditorStateStore.getState())
            }),
        ]
    }

    componetWillUnmount()
    {
        this.removers.forEach(remover => remover.remove())
    }

    render()
    {
        const {
            timelane,
            onSelect,
            onRemove,
        } = this.props

        const {activeLayer} = this.state
        const layers = Array.from(timelane.layers.values())
        const propTypes = activeLayer ? RendererService.pluginRegistry.getPluginParametersById(activeLayer.renderer) : []
        const hasActiveLayer = layers.findIndex(layer => !!(activeLayer && layer.id === activeLayer.id)) !== -1

        return (
            <ul key={timelane.id} className={classnames(
                'timeline_lane-label', {
                    '--expand': hasActiveLayer,
                })}
            >
                <ContextMenu>
                    <MenuItem type='separator' />
                    <MenuItem label='複製' onClick={() => {}} />
                    <MenuItem label='削除' onClick={onRemove.bind(null, timelane.id)} />
                    <MenuItem type='separator' />
                </ContextMenu>

                <li className='timeline_lane-label_col --col-name' onClick={onSelect.bind(this, timelane.id)}>
                    {/* {this.state.selectedLaneId === timelane.id && '*'} */}
                    <LabelInput defaultValue={timelane.name} placeholder='TimeLane' />
                </li>
                <li className='timeline_lane-label_col --col-visibility'>
                    👁
                </li>
                <li className='timeline_lane-label_col --col-lock'>
                    🔓
                </li>

                {hasActiveLayer && <LaneLabelProps onChanged={() => {}} descriptor={propTypes} />}
            </ul>
        )
    }
}
