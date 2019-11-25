import * as Delir from '@delirvfx/core'
import { useFleurContext, useStore } from '@fleur/react'
import classnames from 'classnames'
import { clipboard, remote } from 'electron'
import _ from 'lodash'
import path from 'path'
import React, { useCallback, useRef } from 'react'

import { ContextMenu, MenuItem, MenuItemOption } from '../../components/ContextMenu'
import { LabelInput } from '../../components/LabelInput'
import { Pane } from '../../components/Pane'
import { EditorState } from '../../domain/Editor/EditorStore'
import * as EditorOps from '../../domain/Editor/operations'
import * as ProjectOps from '../../domain/Project/operations'
import { getAssetById, getProject } from '../../domain/Project/selectors'
import { CompositionSettingModal, CompositionSettingResult } from '../../modals/CompositionSettingModal'

import { Droppable } from 'components/Droppable/Droppable'
import { ModalMounterProps, useModalMounter } from 'components/ModalOwner/ModalOwner'
import { useObjectState } from 'utils/hooks'
import t from './AssetsView.i18n'
import s from './AssetsView.sass'

const fileIconFromExtension = (ext: string) => {
  switch (ext) {
    case 'mp4':
    case 'webm':
      return <i className="fa fa-file-movie-o" />

    case 'webp':
    case 'png':
    case 'gif':
    case 'jpg':
    case 'jpeg':
      return <i className="fa fa-file-image-o" />

    case 'mp3':
    case 'wav':
      return <i className="fa fa-file-audio-o" />

    default:
      return <i className="fa fa-file-o" />
  }
}

interface State {
  selectedCompositionId: string | null
  selectedAssetId: string | null
}

export const AssetsView = () => {
  const { getStore, executeOperation } = useFleurContext()
  const { mountModal } = useModalMounter()
  const project = useStore(getStore => getProject(getStore))
  const compositionInputRefs = useRef<Record<string, LabelInput>>({})
  const assetInputRefs = useRef<Record<string, LabelInput>>({})

  const [{ selectedCompositionId, selectedAssetId }, setState] = useObjectState<State>({
    selectedCompositionId: null,
    selectedAssetId: null,
  })

  const assets = project ? Array.from(project.assets) : []
  const compositions = project ? Array.from(project.compositions) : []

  const setAssetNameInputRef = useCallback(
    (assetId: string) => (element: LabelInput) => {
      assetInputRefs.current[assetId] = element
    },
    [],
  )

  const setCompositionNameInputRef = useCallback(
    (compositionId: string) => (element: LabelInput) => {
      compositionInputRefs.current[compositionId] = element
    },
    [],
  )

  const handleClickComposition = useCallback(({ currentTarget }: React.MouseEvent<HTMLTableRowElement>) => {
    setState({
      selectedCompositionId: currentTarget.dataset.compositionId!,
    })
  }, [])

  const handleClickAsset = useCallback(({ currentTarget }: React.MouseEvent<HTMLTableRowElement>) => {
    setState({
      selectedAssetId: currentTarget.dataset.assetId!,
    })
  }, [])

  const handleClickRenameComposition = useCallback(({ dataset }: MenuItemOption<{ compositionId: string }>) => {
    compositionInputRefs.current[dataset.compositionId].enableAndFocus()
  }, [])

  const handleClickRenameAsset = useCallback(({ dataset }: MenuItemOption<{ assetId: string }>) => {
    assetInputRefs.current[dataset.assetId].enableAndFocus()
  }, [])

  const handleClickReplaceAsset = useCallback(async ({ dataset }: MenuItemOption<{ assetId: string }>) => {
    const { assetId } = dataset
    const asset = getAssetById(getStore, assetId)!

    const { filePaths } = await remote.dialog.showOpenDialog({
      filters: [{ name: asset.fileType, extensions: [asset.fileType] }],
      properties: ['openFile'],
    })

    if (!filePaths?.[0]) return

    const [filePath] = filePaths
    const { ext } = path.parse(filePaths[0])
    executeOperation(ProjectOps.modifyAsset, {
      assetId: assetId,
      patch: { fileType: ext.slice(1), path: `file://${filePath}` },
    })
  }, [])

  const handleCopyAssetURI = useCallback(({ dataset }: MenuItemOption<{ assetId: string }>) => {
    clipboard.writeText(`delir:${dataset.assetId}`)
  }, [])

  const handleDropAsset = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    _.each(e.dataTransfer.files, (file, idx) => {
      if (!e.dataTransfer.items[idx].webkitGetAsEntry().isFile) return

      executeOperation(ProjectOps.addAsset, {
        name: file.name,
        fileType: path.extname(file.name).slice(1),
        path: 'file://' + file.path,
      })
    })
  }, [])

  const removeAsset = useCallback(({ dataset }: MenuItemOption<{ assetId: string }>) => {
    // TODO: Check references
    executeOperation(ProjectOps.removeAsset, {
      assetId: dataset.assetId,
    })
  }, [])

  const changeComposition = useCallback(({ currentTarget }: React.MouseEvent<HTMLTableRowElement>) => {
    executeOperation(EditorOps.changeActiveComposition, {
      compositionId: currentTarget.dataset.compositionId!,
    })
  }, [])

  const removeComposition = useCallback(({ dataset }: MenuItemOption<{ compId: string }>) => {
    executeOperation(ProjectOps.removeComposition, {
      compositionId: dataset.compId,
    })
  }, [])

  const modifyCompName = useCallback((compositionId: string, newName: string) => {
    executeOperation(ProjectOps.modifyComposition, {
      compositionId,
      patch: { name: newName },
    })
  }, [])

  const handleSelectAsset = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(target.files!)

    files.forEach(file => {
      executeOperation(ProjectOps.addAsset, {
        name: file.name,
        fileType: path.extname(file.name).slice(1),
        path: file.path,
      })
    })

    target.value = ''
  }, [])

  const openCompositionSetting = useCallback(
    async ({ dataset }: MenuItemOption<{ compositionId: string }>) => {
      if (!project) return
      const { compositionId } = dataset

      const comp = project.findComposition(compositionId)!
      const req = await mountModal<CompositionSettingResult | false>(resolve => (
        <CompositionSettingModal composition={comp} onClose={resolve} />
      ))

      if (!req) return
      executeOperation(ProjectOps.modifyComposition, {
        compositionId: compositionId,
        patch: req,
      })
    },
    [project],
  )

  const openNewCompositionWindow = useCallback(async () => {
    const req = await mountModal<CompositionSettingResult | false>(resolve => (
      <CompositionSettingModal onClose={resolve} />
    ))

    if (!req) return
    executeOperation(ProjectOps.createComposition, req as Delir.Entity.Composition)
  }, [])

  const onAssetsDragStart = useCallback(
    ({ currentTarget }: React.DragEvent<HTMLTableRowElement>) => {
      if (!project) return

      executeOperation(EditorOps.setDragEntity, {
        entity: {
          type: 'asset',
          // FIXME: Use assetId instead of Asset instance
          asset: project.findAsset(currentTarget.dataset.assetId!)!,
        },
      })
    },
    [project],
  )

  const onAssetDragEnd = useCallback(() => {
    executeOperation(EditorOps.clearDragEntity)
  }, [])

  return (
    <Pane className={s.assetsView} allowFocus>
      <h1 className={s.compositionsHeading}>
        {t(t.k.compositions.title)}
        <i className={classnames('twa twa-heavy-plus-sign', s.addAssetPlusSign)} onClick={openNewCompositionWindow} />
      </h1>
      <div className={s.compositionsTableContainer}>
        <table className={s.compositionList}>
          <thead>
            <tr>
              <td className={s.compositionListIconColumn} />
              <td className={s.compositionListNameColumn}>{t(t.k.compositions.name)}</td>
            </tr>
          </thead>
          <tbody>
            <ContextMenu elementType="tr">
              <MenuItem type="separator" />
              <MenuItem label={t(t.k.compositions.contextMenu.create)} onClick={openNewCompositionWindow} />
              <MenuItem type="separator" />
            </ContextMenu>
            {compositions.map(comp => (
              <tr
                key={comp.id}
                className={classnames(comp.id === selectedCompositionId && s.selected)}
                onClick={handleClickComposition}
                onDoubleClick={changeComposition}
                data-composition-id={comp.id}
              >
                <ContextMenu elementType="td">
                  <MenuItem type="separator" />
                  <MenuItem
                    label={t(t.k.compositions.contextMenu.rename)}
                    onClick={handleClickRenameComposition}
                    data-composition-id={comp.id}
                  />
                  <MenuItem
                    label={t(t.k.compositions.contextMenu.remove)}
                    data-comp-id={comp.id}
                    onClick={removeComposition}
                  />
                  <MenuItem
                    label={t(t.k.compositions.contextMenu.preference)}
                    onClick={openCompositionSetting}
                    data-composition-id={comp.id}
                  />
                  <MenuItem type="separator" />
                </ContextMenu>

                <td className={s.IconField}>
                  <i className="fa fa-film" />
                </td>
                <td>
                  <LabelInput
                    ref={setCompositionNameInputRef(comp.id)}
                    defaultValue={comp.name}
                    placeholder={t(t.k.compositions.namePlaceHolder)}
                    onChange={modifyCompName.bind(null, comp.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h1 className={s.assetsHeading}>
        {t(t.k.assets.title)}
        <label className={classnames('twa twa-heavy-plus-sign', s.addAssetPlusSign)}>
          <input type="file" style={{ display: 'none' }} onChange={handleSelectAsset} multiple />
        </label>
      </h1>
      <Droppable className={s.assetsTableContainer} onDrop={handleDropAsset}>
        <table className={s.assetList}>
          <thead>
            <tr>
              <td className={classnames(s.assetListIconColumn)} />
              <td className={classnames(s.assetListNameColumn)}>{t(t.k.assets.name)}</td>
              <td className={classnames(s.assetListTypeColumn)}>{t(t.k.assets.fileType)}</td>
            </tr>
          </thead>
          <tbody>
            {assets.map(asset => (
              <tr
                key={asset.id}
                className={classnames(asset.id === selectedAssetId && s.selected)}
                draggable
                onClick={handleClickAsset}
                onDragStart={onAssetsDragStart}
                onDragEnd={onAssetDragEnd}
                data-asset-id={asset.id}
              >
                <ContextMenu elementType="td">
                  <MenuItem type="separator" />
                  <MenuItem label={t(t.k.assets.contextMenu.remove)} data-asset-id={asset.id} onClick={removeAsset} />
                  <MenuItem type="separator" />
                  <MenuItem
                    label={t(t.k.assets.contextMenu.copyAssetURI)}
                    data-asset-id={asset.id}
                    onClick={handleCopyAssetURI}
                  />
                </ContextMenu>

                <td className={s.IconField}>{fileIconFromExtension(asset.fileType)}</td>
                <td>
                  <ContextMenu>
                    <MenuItem
                      label={t(t.k.assets.contextMenu.rename)}
                      onClick={handleClickRenameAsset}
                      data-asset-id={asset.id}
                    />
                    <MenuItem
                      label={t(t.k.assets.contextMenu.replace)}
                      onClick={handleClickReplaceAsset}
                      data-asset-id={asset.id}
                    />
                  </ContextMenu>
                  <LabelInput
                    ref={setAssetNameInputRef(asset.id)}
                    defaultValue={asset.name}
                    placeholder="Unnamed Asset"
                    doubleClickToEdit
                  />
                </td>
                <td className={s.assetType}>{asset.fileType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Droppable>
    </Pane>
  )
}
