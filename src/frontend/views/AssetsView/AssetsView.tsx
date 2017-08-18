import * as _ from 'lodash'
import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as parseColor from 'parse-color'
import * as classnames from 'classnames'
import * as path from 'path'

import * as Delir from 'delir-core'
import {ProjectHelper, ColorRGB} from 'delir-core'

import AppActions from '../../actions/App'
import ProjectModActions from '../../actions/ProjectMod'

import { default as EditorStateStore, EditorState } from '../../stores/EditorStateStore'
import ProjectStore from '../../stores/ProjectStore'

import Pane from '../components/pane'
import LabelInput from '../components/label-input'
import { Table, TableHeader, TableBodySelectList, Row, Col } from '../components/table'
import { ContextMenu, MenuItem } from '../components/ContextMenu'

import * as Modal from '../../modules/ModalWindow'
import * as CompositionSettingModal from '../../modules/CompositionSettingModal'

import connectToStores from '../../utils/Flux/connectToStores'

import t from './AssetsView.i18n'
import * as s from './style.styl'

export interface AssetsViewProps {
    editor: EditorState,
}

export interface AssetsViewState {
    newCompositionWindowOpened: boolean,
    settingCompositionWindowOpened: boolean,
    settingCompositionQuery: { [name: string]: string | number } | null,
}

type CompositionProps = {
    name: string,
    width: string,
    height: string,
    framerate: string,
    durationSeconds: string,
    backgroundColor: string,
    samplingRate: string,
    audioChannels: string,
}

const castToCompositionPropTypes = (req: CompositionProps) => {
    const bgColor = parseColor(req.backgroundColor)

    return {
        name: req.name,
        width: +req.width,
        height: +req.height,
        framerate: +req.framerate,
        durationFrames: +req.framerate * parseInt(req.durationSeconds, 10),
        backgroundColor: new ColorRGB(bgColor.rgb[0], bgColor.rgb[1], bgColor.rgb[2]),
        samplingRate: +req.samplingRate,
        audioChannels: +req.audioChannels,
    }
}

const fileIconFromExtension = (ext: string) => {
    switch (ext) {
        case 'mp4':
        case 'webm':
            return (<i className='fa fa-file-movie-o' />)

        case 'webp':
        case 'png':
        case 'gif':
        case 'jpg':
        case 'jpeg':
            return (<i className='fa fa-file-image-o' />)

        case 'mp3':
        case 'wav':
            return (<i className='fa fa-file-audio-o' />)

        default:
            return (<i className='fa fa-file-o' />)
    }
}

@connectToStores([EditorStateStore, ProjectStore], (context, props) => ({
    editor: EditorStateStore.getState(),
}))
export default class AssetsView extends React.Component<AssetsViewProps, AssetsViewState>
{
    public static propTypes = {
        editor: PropTypes.object.isRequired,
    }

    constructor()
    {
        super()

        this.state = {
            newCompositionWindowOpened: false,
            settingCompositionWindowOpened: false,
            settingCompositionQuery: null,
        }
    }

    private addAsset = (e: React.DragEvent<HTMLDivElement>) =>
    {
        _.each(e.dataTransfer.files, (file, idx) => {
            if (!e.dataTransfer.items[idx].webkitGetAsEntry().isFile) return

            ProjectModActions.addAsset({
                name: file.name,
                fileType: path.extname(file.name).slice(1),
                path: file.path,
            })
        })
    }

    private removeAsset = (assetId: string) =>
    {
        // TODO: Check references
        ProjectModActions.removeAsset(assetId)
    }

    private changeComposition = (compId: string) =>
    {
        AppActions.changeActiveComposition(compId)
    }

    private removeComposition = (compId: string) =>
    {
        ProjectModActions.removeComposition(compId)
    }

    private modifyCompName = (compId, newName) =>
    {
        ProjectModActions.modifyComposition(compId, { name: newName })
    }

    private selectAsset = ({nativeEvent: e}: React.ChangeEvent<HTMLInputElement>) =>
    {
        const target = e.target as HTMLInputElement
        const files = Array.from(target.files!)

        files.forEach(file => {
            ProjectModActions.addAsset({
                name: file.name,
                fileType: path.extname(file.name).slice(1),
                path: file.path,
            })
        })

        target.value = ''
    }

    private openCompositionSetting = async (compId: string) =>
    {
        if (!this.props.editor.project) return

        const comp = ProjectHelper.findCompositionById(this.props.editor.project, compId)!
        const req = await CompositionSettingModal.show({composition: comp})

        if (!req) return
        ProjectModActions.modifyComposition(compId, castToCompositionPropTypes(req as any))
    }

    private openNewCompositionWindow =  async () =>
    {
        const req = await CompositionSettingModal.show()

        if (!req) return
        ProjectModActions.createComposition(castToCompositionPropTypes(req))
    }

    private onAssetsDragStart = ({target}: {target: HTMLElement}) =>
    {
        const {editor: {project}} = this.props
        if (!project) return

        AppActions.setDragEntity({
            type: 'asset',
            asset: ProjectHelper.findAssetById(project, target.dataset.assetId)!,
        })
    }

    private onAssetDragEnd = () =>
    {
        AppActions.clearDragEntity()
    }

    public render()
    {
        const {editor: {project}} = this.props
        const assets = project ? Array.from(project.assets) : []
        const compositions = project ? Array.from(project.compositions) : []

        return (
            <Pane className={s.assetsView} allowFocus>
                <h1 className={s.compositionsHeading}>
                    Compositions
                    <i
                        className={classnames('twa twa-heavy-plus-sign', s.addAssetPlusSign)}
                        onClick={this.openNewCompositionWindow}
                    ></i>
                </h1>
                <Table className={s.compositionList}>
                    <TableHeader>
                        <Row>
                            <Col resizable={false} defaultWidth='2rem'></Col>
                            <Col defaultWidth='10rem'>{t('compositions.name')}</Col>
                        </Row>
                    </TableHeader>
                    <TableBodySelectList onSelectionChanged={() => {}}>
                        <ContextMenu>
                            <MenuItem type='separator' />
                            <MenuItem label={t('compositions.contextMenu.create')} onClick={this.openNewCompositionWindow} />
                            <MenuItem type='separator' />
                        </ContextMenu>
                        {compositions.map(comp => (
                            <Row key={comp.id} onDoubleClick={this.changeComposition.bind(null, comp.id)}>
                                <ContextMenu>
                                    <MenuItem type='separator' />
                                    <MenuItem label={t('compositions.contextMenu.rename')} onClick={() => this.refs[`comp_name_input#${comp.id}`].enableAndFocus()} />
                                    <MenuItem label={t('compositions.contextMenu.remove')} onClick={this.removeComposition.bind(null, comp.id)} />
                                    <MenuItem label={t('compositions.contextMenu.preference')} onClick={this.openCompositionSetting.bind(null, comp.id)} />
                                    <MenuItem type='separator' />
                                </ContextMenu>

                                <Col className={s.IconField}><i className='fa fa-film'></i></Col>
                                <Col>
                                    <LabelInput
                                        ref={`comp_name_input#${comp.id}`}
                                        defaultValue={comp.name}
                                        placeholder={t('compositions.namePlaceHolder')}
                                        onChange={this.modifyCompName.bind(this, comp.id)}
                                    />
                                </Col>
                            </Row>
                        ))}
                    </TableBodySelectList>
                </Table>
                <h1 className={s.assetsHeading}>
                    Assets
                    <label className={classnames('twa twa-heavy-plus-sign', s.addAssetPlusSign)}>
                        <input ref='assetInput' type='file' style={{display: 'none'}} onChange={this.selectAsset} multiple />
                    </label>
                </h1>
                <Table className={s.assetList} onDrop={this.addAsset}>
                    <TableHeader>
                        <Row>
                            <Col resizable={false} defaultWidth='2rem'></Col>
                            <Col defaultWidth='10rem'>{t('assets.name')}</Col>
                            <Col defaultWidth='5rem'>{t('assets.fileType')}</Col>
                        </Row>
                    </TableHeader>
                    <TableBodySelectList>
                        {assets.map(asset => (
                            <Row key={asset.id} data-asset-id={asset.id} draggable onDragStart={this.onAssetsDragStart} onDragEnd={this.onAssetDragEnd}>
                                <ContextMenu>
                                    <MenuItem type='separator' />
                                    {/*<MenuItem label='Reload' onClick={() => {}} />*/}
                                    <MenuItem label={t('assets.contextMenu.remove')} onClick={this.removeAsset.bind(null, asset.id!)}/>
                                    <MenuItem type='separator' />
                                </ContextMenu>

                                <Col className={s.IconField}>{fileIconFromExtension(asset.fileType)}</Col>
                                <Col>
                                    <ContextMenu>
                                        <MenuItem label={t('assets.contextMenu.rename')} onClick={() => { this.refs[`asset_name_input#${asset.id}`].enableAndFocus()}} />
                                    </ContextMenu>
                                    <LabelInput
                                        ref={`asset_name_input#${asset.id}`}
                                        defaultValue={asset.name}
                                        placeholder='Unnamed Asset'
                                        doubleClickToEdit
                                    />
                                </Col>
                                <Col>{asset.fileType}</Col>
                            </Row>
                        ))}
                    </TableBodySelectList>
                </Table>
            </Pane>
        )
    }
}
