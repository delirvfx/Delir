import * as Delir from '@delirvfx/core'
import { StoreGetter } from '@fleur/fleur'
import { connectToStores, ContextProp, withFleurContext } from '@fleur/react'
import classnames from 'classnames'
import { clipboard, remote } from 'electron'
import _ from 'lodash'
import path from 'path'
import React from 'react'

import { ContextMenu, MenuItem, MenuItemOption } from '../../components/ContextMenu'
import { LabelInput } from '../../components/LabelInput'
import { Pane } from '../../components/Pane'
import EditorStore, { EditorState } from '../../domain/Editor/EditorStore'
import * as EditorOps from '../../domain/Editor/operations'
import * as ProjectOps from '../../domain/Project/operations'
import ProjectStore from '../../domain/Project/ProjectStore'
import { getAssetById } from '../../domain/Project/selectors'
import { CompositionSettingModal, CompositionSettingResult } from '../../modals/CompositionSettingModal'

import { Droppable } from 'components/Droppable/Droppable'
import { ModalMounterProps, withModalMounter } from 'components/ModalOwner/ModalOwner'
import { decorate } from 'utils/decorate'
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

interface ConnectedProps {
  editor: EditorState
}

interface State {
  newCompositionWindowOpened: boolean
  settingCompositionWindowOpened: boolean
  settingCompositionQuery: { [name: string]: string | number } | null
  selectedCompositionId: string | null
  selectedAssetId: string | null
  dragover: boolean
}

type Props = ConnectedProps & ModalMounterProps & ContextProp

const mapStateToProps = (getStore: StoreGetter) => ({
  editor: getStore(EditorStore).getState(),
})

class AssetsView extends React.Component<Props, State> {
  public state = {
    newCompositionWindowOpened: false,
    settingCompositionWindowOpened: false,
    settingCompositionQuery: null,
    selectedCompositionId: null,
    selectedAssetId: null,
    dragover: false,
  }

  private compositionInputRefs: { [assetId: string]: LabelInput } = {}
  private assetInputRefs: { [assetId: string]: LabelInput } = {}

  public render() {
    const {
      editor: { project },
    } = this.props
    const { selectedCompositionId, selectedAssetId } = this.state
    const assets = project ? Array.from(project.assets) : []
    const compositions = project ? Array.from(project.compositions) : []

    return (
      <Pane className={s.assetsView} allowFocus>
        <h1 className={s.compositionsHeading}>
          {t(t.k.compositions.title)}
          <i
            className={classnames('twa twa-heavy-plus-sign', s.addAssetPlusSign)}
            onClick={this.openNewCompositionWindow}
          />
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
                <MenuItem label={t(t.k.compositions.contextMenu.create)} onClick={this.openNewCompositionWindow} />
                <MenuItem type="separator" />
              </ContextMenu>
              {compositions.map(comp => (
                <tr
                  key={comp.id}
                  className={classnames(comp.id === selectedCompositionId && s.selected)}
                  onClick={this.handleClickComposition}
                  onDoubleClick={this.changeComposition}
                  data-composition-id={comp.id}
                >
                  <ContextMenu elementType="td">
                    <MenuItem type="separator" />
                    <MenuItem
                      label={t(t.k.compositions.contextMenu.rename)}
                      onClick={this.handleClickRenameComposition}
                      data-composition-id={comp.id}
                    />
                    <MenuItem
                      label={t(t.k.compositions.contextMenu.remove)}
                      data-comp-id={comp.id}
                      onClick={this.removeComposition}
                    />
                    <MenuItem
                      label={t(t.k.compositions.contextMenu.preference)}
                      onClick={this.openCompositionSetting}
                      data-composition-id={comp.id}
                    />
                    <MenuItem type="separator" />
                  </ContextMenu>

                  <td className={s.IconField}>
                    <i className="fa fa-film" />
                  </td>
                  <td>
                    <LabelInput
                      ref={this.setCompositionNameInputRef(comp.id)}
                      defaultValue={comp.name}
                      placeholder={t(t.k.compositions.namePlaceHolder)}
                      onChange={this.modifyCompName.bind(this, comp.id)}
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
            <input type="file" style={{ display: 'none' }} onChange={this.handleSelectAsset} multiple />
          </label>
        </h1>
        <Droppable className={s.assetsTableContainer} onDrop={this.handleDropAsset}>
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
                  onClick={this.handleClickAsset}
                  onDragStart={this.onAssetsDragStart}
                  onDragEnd={this.onAssetDragEnd}
                  data-asset-id={asset.id}
                >
                  <ContextMenu elementType="td">
                    <MenuItem type="separator" />
                    <MenuItem
                      label={t(t.k.assets.contextMenu.remove)}
                      data-asset-id={asset.id}
                      onClick={this.removeAsset}
                    />
                    <MenuItem type="separator" />
                    <MenuItem
                      label={t(t.k.assets.contextMenu.copyAssetURI)}
                      data-asset-id={asset.id}
                      onClick={this.handleCopyAssetURI}
                    />
                  </ContextMenu>

                  <td className={s.IconField}>{fileIconFromExtension(asset.fileType)}</td>
                  <td>
                    <ContextMenu>
                      <MenuItem
                        label={t(t.k.assets.contextMenu.rename)}
                        onClick={this.handleClickRenameAsset}
                        data-asset-id={asset.id}
                      />
                      <MenuItem
                        label={t(t.k.assets.contextMenu.replace)}
                        onClick={this.handleClickReplaceAsset}
                        data-asset-id={asset.id}
                      />
                    </ContextMenu>
                    <LabelInput
                      ref={this.setAssetNameInputRef(asset.id)}
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

  private setAssetNameInputRef = (assetId: string) => (element: LabelInput) => {
    this.assetInputRefs[assetId] = element
  }

  private setCompositionNameInputRef = (compositionId: string) => (element: LabelInput) => {
    this.compositionInputRefs[compositionId] = element
  }

  private handleClickComposition = ({ currentTarget }: React.MouseEvent<HTMLTableRowElement>) => {
    this.setState({
      selectedCompositionId: currentTarget.dataset.compositionId!,
    })
  }

  private handleClickAsset = ({ currentTarget }: React.MouseEvent<HTMLTableRowElement>) => {
    this.setState({
      selectedAssetId: currentTarget.dataset.assetId!,
    })
  }

  private handleClickRenameComposition = ({ dataset }: MenuItemOption<{ compositionId: string }>) => {
    this.compositionInputRefs[dataset.compositionId].enableAndFocus()
  }

  private handleClickRenameAsset = ({ dataset }: MenuItemOption<{ assetId: string }>) => {
    this.assetInputRefs[dataset.assetId].enableAndFocus()
  }

  private handleClickReplaceAsset = async ({ dataset }: MenuItemOption<{ assetId: string }>) => {
    const { assetId } = dataset
    const asset = getAssetById(this.props.getStore, assetId)!

    const { filePaths } = await remote.dialog.showOpenDialog({
      filters: [{ name: asset.fileType, extensions: [asset.fileType] }],
      properties: ['openFile'],
    })

    if (!filePaths?.[0]) return

    const [filePath] = filePaths
    const { ext } = path.parse(filePaths[0])
    this.props.executeOperation(ProjectOps.modifyAsset, {
      assetId: assetId,
      patch: { fileType: ext.slice(1), path: filePath },
    })
  }

  private handleCopyAssetURI = ({ dataset }: MenuItemOption<{ assetId: string }>) => {
    clipboard.writeText(`delir:${dataset.assetId}`)
  }

  private handleDropAsset = (e: React.DragEvent<HTMLDivElement>) => {
    _.each(e.dataTransfer.files, (file, idx) => {
      if (!e.dataTransfer.items[idx].webkitGetAsEntry().isFile) return

      this.props.executeOperation(ProjectOps.addAsset, {
        name: file.name,
        fileType: path.extname(file.name).slice(1),
        path: 'file://' + file.path,
      })
    })
  }

  private removeAsset = ({ dataset }: MenuItemOption<{ assetId: string }>) => {
    // TODO: Check references
    this.props.executeOperation(ProjectOps.removeAsset, {
      assetId: dataset.assetId,
    })
  }

  private changeComposition = ({ currentTarget }: React.MouseEvent<HTMLTableRowElement>) => {
    this.props.executeOperation(EditorOps.changeActiveComposition, {
      compositionId: currentTarget.dataset.compositionId!,
    })
  }

  private removeComposition = ({ dataset }: MenuItemOption<{ compId: string }>) => {
    this.props.executeOperation(ProjectOps.removeComposition, {
      compositionId: dataset.compId,
    })
  }

  private modifyCompName = (compositionId: string, newName: string) => {
    this.props.executeOperation(ProjectOps.modifyComposition, {
      compositionId,
      patch: { name: newName },
    })
  }

  private handleSelectAsset = ({ nativeEvent: e }: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement
    const files = Array.from(target.files!)

    files.forEach(file => {
      this.props.executeOperation(ProjectOps.addAsset, {
        name: file.name,
        fileType: path.extname(file.name).slice(1),
        path: file.path,
      })
    })

    target.value = ''
  }

  private openCompositionSetting = async ({ dataset }: MenuItemOption<{ compositionId: string }>) => {
    if (!this.props.editor.project) return
    const { compositionId } = dataset

    const comp = this.props.editor.project.findComposition(compositionId)!
    const req = await this.props.mountModal<CompositionSettingResult | false>(resolve => (
      <CompositionSettingModal composition={comp} onClose={resolve} />
    ))

    if (!req) return
    this.props.executeOperation(ProjectOps.modifyComposition, {
      compositionId: compositionId,
      patch: req,
    })
  }

  private openNewCompositionWindow = async () => {
    const req = await this.props.mountModal<CompositionSettingResult | false>(resolve => (
      <CompositionSettingModal onClose={resolve} />
    ))

    if (!req) return
    this.props.executeOperation(ProjectOps.createComposition, req as Delir.Entity.Composition)
  }

  private onAssetsDragStart = ({ currentTarget }: React.DragEvent<HTMLTableRowElement>) => {
    const {
      editor: { project },
    } = this.props
    if (!project) return

    this.props.executeOperation(EditorOps.setDragEntity, {
      entity: {
        type: 'asset',
        // FIXME: Use assetId instead of Asset instance
        asset: project.findAsset(currentTarget.dataset.assetId!)!,
      },
    })
  }

  private onAssetDragEnd = () => {
    this.props.executeOperation(EditorOps.clearDragEntity)
  }
}

export default decorate([withModalMounter, withFleurContext, connectToStores(mapStateToProps)], AssetsView)
