import * as Delir from '@delirvfx/core'
import { connectToStores, ContextProp, useFleurContext, useStore, withFleurContext } from '@fleur/react'
import classnames from 'classnames'
import React, { useCallback, useRef } from 'react'
import { SortableElement, SortableHandle } from 'react-sortable-hoc'

import EditorStore from '../../domain/Editor/EditorStore'
import * as ProjectOps from '../../domain/Project/operations'

import { ContextMenu, MenuItem, MenuItemOption } from '../../components/ContextMenu/ContextMenu'
import { LabelInput } from '../../components/LabelInput'

import { getActiveComp } from 'domain/Editor/selectors'
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

type Props = OwnProps

const SortHandle = SortableHandle(() => <i className="fa fa-bars" />)

const LayerLabelComponent = ({ layer, layerIndex, onSelect, onRemove }: Props) => {
  const { executeOperation } = useFleurContext()
  const { activeComp } = useStore([EditorStore], getStore => ({
    activeComp: getActiveComp(getStore),
  }))

  const layerNameInputRef = useRef<LabelInput | null>(null)

  const handleChangeLayerName = useCallback(
    (value: string) => {
      executeOperation(ProjectOps.modifyLayer, {
        layerId: layer.id!,
        patch: { name: value },
      })
    },
    [layer],
  )

  const handleFocusLayerNameInput = useCallback(() => {
    layerNameInputRef.current!.enableAndFocus()
  }, [])

  const handleRemoveLayer = useCallback(
    ({ dataset }: MenuItemOption<{ layerId: string }>) => {
      onRemove(dataset.layerId)
    },
    [onRemove],
  )

  const handleAddLayer = useCallback(() => {
    if (!activeComp) return

    executeOperation(ProjectOps.addLayer, {
      targetCompositionId: activeComp.id,
      index: layerIndex,
    })
  }, [activeComp, layerIndex])

  const handleClickLayer = useCallback(
    ({ currentTarget }: React.MouseEvent<HTMLLIElement>) => {
      onSelect(currentTarget.dataset.layerId!)
    },
    [onSelect],
  )

  return (
    <ul key={layer.id} className={s.LaneLabel}>
      <ContextMenu>
        <MenuItem type="separator" />
        <MenuItem label={t(t.k.contextMenu.renameLayer)} onClick={handleFocusLayerNameInput} />
        <MenuItem label={t(t.k.contextMenu.removeLayer)} data-layer-id={layer.id} onClick={handleRemoveLayer} />
        <MenuItem type="separator" />
        <MenuItem label={t(t.k.contextMenu.addLayerHere)} onClick={handleAddLayer} />
      </ContextMenu>

      <li className={classnames(s.LaneLabel_Col, s['LaneLabel_Col--Handle'])}>
        <SortHandle />
      </li>

      <li
        className={classnames(s.LaneLabel_Col, s['LaneLabel_Col--col-name'])}
        data-layer-id={layer.id}
        onClick={handleClickLayer}
      >
        <LabelInput
          ref={layerNameInputRef}
          defaultValue={layer.name}
          placeholder="Layer name"
          onChange={handleChangeLayerName}
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

export const LayerLabel = SortableElement((props: OwnProps) => <LayerLabelComponent {...props} />)
