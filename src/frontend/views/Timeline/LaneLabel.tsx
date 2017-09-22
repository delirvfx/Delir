import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as classnames from 'classnames'
import * as Delir from 'delir-core'
import connectToStores from '../../utils/Flux/connectToStores'

import RendererService from '../../services/renderer'
import ProjectModActions from '../../actions/ProjectMod'

import LabelInput from '../components/label-input'
import {ContextMenu, MenuItem, MenuItemOption} from '../components/ContextMenu'

import t from './LaneLabel.i18n'

interface LaneLabelProps {
    layer: Delir.Project.Layer

    /**
     * Layer select handler
     */
    onSelect: (layerId: string) => any

    /** Layer remove handler */
    onRemove: (layerId: string) => any
}

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
        const { layer } = this.props

        return (
            <ul key={layer.id} className='timeline_lane-label'>
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
                    <i className='twa twa-eye'></i>
                </li>
                <li className='timeline_lane-label_col --col-lock'>
                    <i className='twa twa-lock'></i>
                </li>
            </ul>
        )
    }
}
