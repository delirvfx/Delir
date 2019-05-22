import * as Delir from '@delirvfx/core'
import { connectToStores, ContextProp, withFleurContext } from '@fleur/fleur-react'
import * as classNames from 'classnames'
import { clipboard } from 'electron'
import * as _ from 'lodash'
import * as parseColor from 'parse-color'
import * as path from 'path'
import * as React from 'react'

import * as EditorOps from '../../domain/Editor/operations'
import * as ProjectOps from '../../domain/Project/operations'

import EditorStore, { EditorState } from '../../domain/Editor/EditorStore'
import ProjectStore from '../../domain/Project/ProjectStore'

import { ContextMenu, MenuItem, MenuItemOption } from '../../components/ContextMenu'
import LabelInput from '../../components/label-input'
import Pane from '../../components/pane'

import * as CompositionSettingModal from '../../modules/CompositionSettingModal'

import t from './AssetsView.i18n'
import * as s from './style.styl'

interface CompositionProps {
    name: string
    width: string
    height: string
    framerate: string
    durationSeconds: string
    backgroundColor: string
    samplingRate: string
    audioChannels: string
}

const castToCompositionProps = (req: CompositionProps) => {
    const bgColor = parseColor(req.backgroundColor)

    return {
        name: req.name,
        width: +req.width,
        height: +req.height,
        framerate: +req.framerate,
        durationFrames: +req.framerate * parseInt(req.durationSeconds, 10),
        backgroundColor: new Delir.Values.ColorRGB(bgColor.rgb[0], bgColor.rgb[1], bgColor.rgb[2]),
        samplingRate: +req.samplingRate,
        audioChannels: +req.audioChannels,
    }
}

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
}

type Props = ConnectedProps & ContextProp

export default withFleurContext(
    connectToStores([EditorStore, ProjectStore], getStore => ({
        editor: getStore(EditorStore).getState(),
    }))(
        class AssetsView extends React.Component<Props, State> {
            public state = {
                newCompositionWindowOpened: false,
                settingCompositionWindowOpened: false,
                settingCompositionQuery: null,
                selectedCompositionId: null,
                selectedAssetId: null,
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
                                className={classNames('twa twa-heavy-plus-sign', s.addAssetPlusSign)}
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
                                        <MenuItem
                                            label={t(t.k.compositions.contextMenu.create)}
                                            onClick={this.openNewCompositionWindow}
                                        />
                                        <MenuItem type="separator" />
                                    </ContextMenu>
                                    {compositions.map(comp => (
                                        <tr
                                            key={comp.id}
                                            className={classNames(comp.id === selectedCompositionId && s.selected)}
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
                            <label className={classNames('twa twa-heavy-plus-sign', s.addAssetPlusSign)}>
                                <input
                                    ref="assetInput"
                                    type="file"
                                    style={{ display: 'none' }}
                                    onChange={this.selectAsset}
                                    multiple
                                />
                            </label>
                        </h1>
                        <div className={s.assetsTableContainer} onDrop={this.handleDropAsset}>
                            <table className={s.assetList}>
                                <thead>
                                    <tr>
                                        <td className={classNames(s.assetListIconColumn)} />
                                        <td className={classNames(s.assetListNameColumn)}>{t(t.k.assets.name)}</td>
                                        <td className={classNames(s.assetListTypeColumn)}>{t(t.k.assets.fileType)}</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assets.map(asset => (
                                        <tr
                                            key={asset.id}
                                            className={classNames(asset.id === selectedAssetId && s.selected)}
                                            draggable
                                            onClick={this.handleClickAsset}
                                            onDragStart={this.onAssetsDragStart}
                                            onDragEnd={this.onAssetDragEnd}
                                            data-asset-id={asset.id}
                                        >
                                            <ContextMenu elementType="td">
                                                <MenuItem type="separator" />
                                                {/*<MenuItem label='Reload' onClick={() => {}} />*/}
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
                                                </ContextMenu>
                                                <LabelInput
                                                    ref={this.setAssetNameInputRef(asset.id)}
                                                    defaultValue={asset.name}
                                                    placeholder="Unnamed Asset"
                                                    doubleClickToEdit
                                                />
                                            </td>
                                            <td>{asset.fileType}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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

            private handleCopyAssetURI = ({ dataset }: MenuItemOption<{ assetId: string }>) => {
                clipboard.writeText(`delir:${dataset.assetId}`)
            }

            private handleDropAsset = (e: React.DragEvent<HTMLDivElement>) => {
                _.each(e.dataTransfer.files, (file, idx) => {
                    if (!e.dataTransfer.items[idx].webkitGetAsEntry().isFile) return

                    this.props.executeOperation(ProjectOps.addAsset, {
                        name: file.name,
                        fileType: path.extname(file.name).slice(1),
                        path: file.path,
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

            private selectAsset = ({ nativeEvent: e }: React.ChangeEvent<HTMLInputElement>) => {
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
                const req = await CompositionSettingModal.show({
                    composition: comp,
                })

                if (!req) return
                this.props.executeOperation(ProjectOps.modifyComposition, {
                    compositionId: compositionId,
                    patch: castToCompositionProps(req as any),
                })
            }

            private openNewCompositionWindow = async () => {
                const req = await CompositionSettingModal.show()

                if (!req) return
                this.props.executeOperation(ProjectOps.createComposition, {
                    ...castToCompositionProps(req as any),
                })
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
                this.props.executeOperation(EditorOps.clearDragEntity, {})
            }
        },
    ),
)
