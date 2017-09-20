import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as classnames from 'classnames'
import * as Delir from 'delir-core'
import connectToStores from '../../utils/Flux/connectToStores'

import RendererService from '../../services/renderer'
import {default as EditorStateStore, EditorState} from '../../stores/EditorStateStore'
import ProjectModActions from '../../actions/ProjectMod'

import LabelInput from '../components/label-input'
import {ContextMenu, MenuItem, MenuItemOption} from '../components/ContextMenu'

import t from './LaneLabel.i18n'

interface LaneLabelProps {
    editor: EditorState
    layer: Delir.Project.Layer

    /**
     * Layer select handler
     */
    onSelect: (layerId: string) => any

    /** Layer remove handler */
    onRemove: (layerId: string) => any
}

@connectToStores([EditorStateStore], () => ({
    editor: EditorStateStore.getState(),
}))
export default class LaneLabel extends React.Component<LaneLabelProps, null>
{
    static propTypes = {
        editor: PropTypes.object.isRequired,
        layer: PropTypes.object.isRequired,
        onSelect: PropTypes.func.isRequired,
        onRemove: PropTypes.func.isRequired,
    }

    private layerNameInput: LabelInput

    private layerNameChanged = (value: string) =>
    {
        const {layer} = this.props
        ProjectModActions.modifyLayer(layer.id!, {name: value})
    }

    private focusToLayerNameInput = () =>
    {
        this.layerNameInput.enableAndFocus()
    }


    private bindLayerNameInput = el => this.layerNameInput = el

    private onSelect = ({ currentTarget }: React.MouseEvent<HTMLLIElement>) => this.props.onSelect(currentTarget.dataset.layerId!)

    private onRemove = ({ dataset }: MenuItemOption<{layerId: string}>) => this.props.onRemove(dataset.layerId)

    public render()
    {
        const {layer, editor: {activeLayer}, onSelect, onRemove} = this.props
        const clips = Array.from(layer.clips)
        const propTypes = activeLayer ? RendererService.pluginRegistry!.getPostEffectParametersById(activeLayer.renderer) : []
        const hasActiveLayer = clips.findIndex(layer => !!(activeLayer && layer.id === activeLayer.id)) !== -1

        return (
            <ul key={layer.id} className={classnames(
                'timeline_lane-label', {
                    '--expand': hasActiveLayer,
                })}
            >
                <ContextMenu>
                    <MenuItem type='separator' />
                    {/*<MenuItem label='複製' onClick={() => {}} />*/}
                    <MenuItem label={t('contextMenu.renameLayer')} onClick={this.focusToLayerNameInput} />
                    <MenuItem label={t('contextMenu.removeLayer')} data-layer-id={layer.id} onClick={this.onRemove} />
                    <MenuItem type='separator' />
                </ContextMenu>

                <li className='timeline_lane-label_col --col-name' data-layer-id={layer.id} onClick={this.onSelect}>
                    <LabelInput ref={this.bindLayerNameInput} defaultValue={layer.name} placeholder='Layer name' onChange={this.layerNameChanged} />
                </li>
                <li className='timeline_lane-label_col --col-visibility'>
                    <i className="twa twa-eye"></i>
                </li>
                <li className='timeline_lane-label_col --col-lock'>
                    <i className="twa twa-lock"></i>
                </li>
            </ul>
        )
    }
}
