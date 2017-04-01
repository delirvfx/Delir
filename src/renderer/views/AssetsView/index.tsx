import * as _ from 'lodash'
import * as React from 'react'
import { PropTypes } from 'react'
import * as parseColor from 'parse-color'

import * as Delir from 'delir-core'
import {ProjectHelper, ColorRGB} from 'delir-core'

import EditorStateActions from '../../actions/editor-state-actions'
import ProjectModifyActions from '../../actions/project-modify-actions'

import { default as EditorStateStore, EditorState } from '../../stores/editor-state-store'
import { default as ProjectModifyStore } from '../../stores/project-modify-store'

import Pane from '../components/pane'
import LabelInput from '../components/label-input'
import { Table, TableHeader, TableBodySelectList, Row, Col } from '../components/table'
import { ContextMenu, MenuItem } from '../components/context-menu'

import * as Modal from '../components/modal-window'
import CompositionSettingModal from '../CompositionSettingModal'

import connectToStores from '../../utils/connectToStores'

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

@connectToStores([EditorStateStore, ProjectModifyStore], (context, props) => ({
    editor: EditorStateStore.getState(),
}))
export default class AssetsView extends React.Component<AssetsViewProps, AssetsViewState>
{
    static propTypes = {
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

    addAsset = (e: React.DragEvent<HTMLDivElement>) =>
    {
        _.each(e.dataTransfer.files, (file, idx) => {
            if (!e.dataTransfer.items[idx].webkitGetAsEntry().isFile) return

            ProjectModifyActions.addAsset({
                name: file.name,
                mimeType: file.type,
                path: file.path,
            })
        })
    }

    removeAsset = (assetId: string) =>
    {
        // TODO: Check references
        ProjectModifyActions.removeAsset(assetId)
    }

    changeComposition = (compId: string) =>
    {
        EditorStateActions.changeActiveComposition(compId)
    }

    removeComposition = (compId: string) =>
    {
        ProjectModifyActions.removeComposition(compId)
    }

    modifyCompName = (compId, newName) =>
    {
        ProjectModifyActions.modifyComposition(compId, { name: newName })
    }

    openCompositionSetting = async (compId: string) =>
    {
        if (!this.props.editor.project) return

        const comp = ProjectHelper.findCompositionById(this.props.editor.project, compId)!

        const modal = Modal.create()
        const req = (await new Promise<{[p: string]: string}|void>(resolve => {
            modal.mount(<CompositionSettingModal composition={comp} onConfirm={resolve} onCancel={resolve} />)
            modal.show()
        })) as CompositionProps|void

        modal.dispose()

        if (!req) {
            return
        }

        ProjectModifyActions.modifyComposition(compId, castToCompositionPropTypes(req))
    }

    openNewCompositionWindow =  async () =>
    {
        const modal = Modal.create()
        const req = (await new Promise<{[p: string]: string}|void>(resolve => {
            modal.mount(<CompositionSettingModal onConfirm={resolve} onCancel={resolve} />)
            modal.show()
        })) as CompositionProps|void

        modal.dispose()

        if (!req) {
            return
        }

        ProjectModifyActions.createComposition(castToCompositionPropTypes(req))
    }

    onAssetsDragStart = ({target}: {target: HTMLElement}) =>
    {
        const {editor: {project}} = this.props
        if (!project) return

        EditorStateActions.setDragEntity({
            type: 'asset',
            asset: ProjectHelper.findAssetById(project, target.dataset.assetId)!,
        })
    }

    onAssetDragEnd = () => {
        EditorStateActions.clearDragEntity()
    }

    render()
    {
        const {editor: {project}} = this.props
        const assets = project ? Array.from(project.assets.values()) : []
        const compositions = project ? Array.from(project.compositions.values()) : []

        return (
            <Pane className={s.assetsView} allowFocus>
                <Table className={s.compositionList}>
                    <TableHeader>
                        <Row>
                            <Col resizable={false} defaultWidth='2rem'></Col>
                            <Col defaultWidth='10rem'>名前</Col>
                        </Row>
                    </TableHeader>
                    <TableBodySelectList onSelectionChanged={() => {}}>
                        <ContextMenu>
                            <MenuItem type='separator' />
                            <MenuItem label='New Compositon' onClick={this.openNewCompositionWindow} />
                            <MenuItem type='separator' />
                        </ContextMenu>
                        {compositions.map(comp => (
                            <Row key={comp.id} onDoubleClick={this.changeComposition.bind(null, comp.id)}>
                                <ContextMenu>
                                    <MenuItem type='separator' />
                                    <MenuItem label='Rename' onClick={() => this.refs[`comp_name_input#${comp.id}`].enableAndFocus()} />
                                    <MenuItem label='Remove' onClick={this.removeComposition.bind(null, comp.id)} />
                                    <MenuItem label='Composition setting' onClick={this.openCompositionSetting.bind(null, comp.id)} />
                                    <MenuItem type='separator' />
                                </ContextMenu>

                                <Col><i className="twa twa-clapper"></i></Col>
                                <Col>
                                    <LabelInput
                                        ref={`comp_name_input#${comp.id}`}
                                        defaultValue={comp.name}
                                        placeholder='Unnamed Coposition'
                                        onChange={this.modifyCompName.bind(this, comp.id)}
                                    />
                                </Col>
                            </Row>
                        ))}
                    </TableBodySelectList>
                </Table>
                <Table className={s.assetList} onDrop={this.addAsset}>
                    <TableHeader>
                        <Row>
                            {/* <Col resizable={false} defaultWidth='2rem'></Col> */}
                            <Col defaultWidth='10rem'>名前</Col>
                            <Col defaultWidth='5rem'>種類</Col>
                        </Row>
                    </TableHeader>
                    <TableBodySelectList>
                        {assets.map(asset => (
                            <Row key={asset.id} data-asset-id={asset.id} draggable onDragStart={this.onAssetsDragStart} onDragEnd={this.onAssetDragEnd}>
                                <ContextMenu>
                                    <MenuItem type='separator' />
                                    <MenuItem label='Rename' onClick={() => { this.refs[`asset_name_input#${asset.id}`].enableAndFocus()}} />
                                    {/*<MenuItem label='Reload' onClick={() => {}} />*/}
                                    <MenuItem label='Remove' onClick={this.removeAsset.bind(null, asset.id!)}/>
                                    <MenuItem type='separator' />
                                </ContextMenu>

                                {/*<Col></Col>*/}
                                <Col>
                                    <LabelInput
                                        ref={`asset_name_input#${asset.id}`}
                                        defaultValue={asset.name}
                                        placeholder='Unnamed Asset'
                                    />
                                </Col>
                                <Col>{asset.mimeType}</Col>
                            </Row>
                        ))}
                    </TableBodySelectList>
                </Table>
            </Pane>
        )
    }
}
