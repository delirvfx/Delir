import * as React from 'react'
import * as classnames from 'classnames'
import * as PropTypes from 'prop-types'
import { SortableElement, SortableHandle } from 'react-sortable-hoc'
import * as Delir from 'delir-core'

import ProjectModActions from '../../actions/ProjectMod'

import LabelInput from '../components/label-input'
import {ContextMenu, MenuItem, MenuItemOption} from '../components/ContextMenu'

import t from './LaneLabel.i18n'
import * as s from './LaneLabel.sass'

interface Props {
    layer: Delir.Project.Layer

    /**
     * Layer select handler
     */
    onSelect: (layerId: string) => any

    /** Layer remove handler */
    onRemove: (layerId: string) => any
}

const SortHandle = SortableHandle(() => (
    <i className='fa fa-bars' />
))

class LaneLabel extends React.Component<Props>
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

    private bindLayerNameInput = (el: LabelInput) => this.layerNameInput = el

    private onSelect = ({ currentTarget }: React.MouseEvent<HTMLLIElement>) => this.props.onSelect(currentTarget.dataset.layerId!)

    private onRemove = ({ dataset }: MenuItemOption<{layerId: string}>) => this.props.onRemove(dataset.layerId)

    public render()
    {
        const { layer } = this.props

        return (
            <ul key={layer.id} className={s.LaneLabel}>
                <ContextMenu>
                    <MenuItem type='separator' />
                    {/*<MenuItem label='複製' onClick={() => {}} />*/}
                    <MenuItem label={t('contextMenu.renameLayer')} onClick={this.focusToLayerNameInput} />
                    <MenuItem label={t('contextMenu.removeLayer')} data-layer-id={layer.id} onClick={this.onRemove} />
                    <MenuItem type='separator' />
                </ContextMenu>

                <li className={classnames(s.LaneLabel_Col, s['LaneLabel_Col--Handle'])}>
                    <SortHandle />
                </li>

                <li className={classnames(s.LaneLabel_Col, s['LaneLabel_Col--col-name'])} data-layer-id={layer.id} onClick={this.onSelect}>
                    <LabelInput ref={this.bindLayerNameInput} defaultValue={layer.name} placeholder='Layer name' onChange={this.layerNameChanged} />
                </li>
                <li className={classnames(s.LaneLabel_Col, s['LaneLabel_Col--col-visibility'])}>
                    <i className='twa twa-eye' />
                </li>
                <li className={classnames(s.LaneLabel_Col, s['LaneLabel_Col--col-lock'])}>
                    <i className='twa twa-lock' />
                </li>
            </ul>
        )
    }
}

export default SortableElement((props: Props) => (
    <LaneLabel layer={props.layer} onSelect={props.onSelect} onRemove={props.onRemove} />
))
