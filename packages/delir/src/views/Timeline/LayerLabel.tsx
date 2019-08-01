import * as Delir from '@delirvfx/core'
import { connectToStores, ContextProp, withFleurContext } from '@fleur/fleur-react'
import classnames from 'classnames'
import React from 'react'
import { SortableElement, SortableHandle } from 'react-sortable-hoc'

import EditorStore from '../../domain/Editor/EditorStore'
import * as ProjectOps from '../../domain/Project/operations'

import { ContextMenu, MenuItem, MenuItemOption } from '../../components/ContextMenu/ContextMenu'
import LabelInput from '../../components/label-input'

import t from './LayerLabel.i18n'
import s from './LayerLabel.sass'

interface OwnProps {
  layer: Delir.Entity.Layer
  layerIndex: number

  /**
   * Layer select handler
   */
  onSelect: (layerId: string) => any

  /** Layer remove handler */
  onRemove: (layerId: string) => any
}

interface ConnectedProps {
  activeComp: Delir.Entity.Composition | null
}

type Props = OwnProps & ConnectedProps & ContextProp

const SortHandle = SortableHandle(() => <i className="fa fa-bars" />)

class LayerLabelComponent extends React.Component<Props> {
  private layerNameInput: LabelInput

  public render() {
    const { layer, activeComp } = this.props

    return (
      <ul key={layer.id} className={s.LaneLabel}>
        <ContextMenu>
          <MenuItem type="separator" />
          <MenuItem label={t(t.k.contextMenu.renameLayer)} onClick={this.focusToLayerNameInput} />
          <MenuItem label={t(t.k.contextMenu.removeLayer)} data-layer-id={layer.id} onClick={this.onRemove} />
          <MenuItem type="separator" />
          <MenuItem label={t(t.k.contextMenu.addLayerHere)} onClick={this.handleAddLayer} />
        </ContextMenu>

        <li className={classnames(s.LaneLabel_Col, s['LaneLabel_Col--Handle'])}>
          <SortHandle />
        </li>

        <li
          className={classnames(s.LaneLabel_Col, s['LaneLabel_Col--col-name'])}
          data-layer-id={layer.id}
          onClick={this.onSelect}
        >
          <LabelInput
            ref={this.bindLayerNameInput}
            defaultValue={layer.name}
            placeholder="Layer name"
            onChange={this.layerNameChanged}
          />
        </li>
        <li className={classnames(s.LaneLabel_Col, s['LaneLabel_Col--col-visibility'])}>
          <i className="twa twa-eye" />
        </li>
        <li className={classnames(s.LaneLabel_Col, s['LaneLabel_Col--col-lock'])}>
          <i className="twa twa-lock" />
        </li>
      </ul>
    )
  }

  private layerNameChanged = (value: string) => {
    const { layer } = this.props

    this.props.executeOperation(ProjectOps.modifyLayer, {
      layerId: layer.id!,
      patch: { name: value },
    })
  }

  private focusToLayerNameInput = () => {
    this.layerNameInput.enableAndFocus()
  }

  private bindLayerNameInput = (el: LabelInput) => (this.layerNameInput = el)

  private onSelect = ({ currentTarget }: React.MouseEvent<HTMLLIElement>) =>
    this.props.onSelect(currentTarget.dataset.layerId!)

  private onRemove = ({ dataset }: MenuItemOption<{ layerId: string }>) => this.props.onRemove(dataset.layerId)

  private handleAddLayer = () => {
    const { activeComp, layerIndex } = this.props
    if (!activeComp) return

    this.props.executeOperation(ProjectOps.addLayer, {
      targetCompositionId: activeComp.id,
      index: layerIndex,
    })
  }
}

const LayerLabel = withFleurContext(
  connectToStores([EditorStore], getStore => ({
    activeComp: getStore(EditorStore).getActiveComposition(),
  }))(LayerLabelComponent),
)

export default SortableElement((props: OwnProps) => <LayerLabel {...props} />)
