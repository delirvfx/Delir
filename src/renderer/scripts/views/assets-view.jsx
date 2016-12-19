import _ from 'lodash'
import React, {PropTypes} from 'react'
import parseColor from 'parse-color'
import Delir, {ProjectHelper, ColorRGB} from 'delir-core'

import EditorStateActions from '../actions/editor-state-actions'
import ProjectModifyActions from '../actions/project-modify-actions'

import AppStore from '../stores/app-store'
import EditorStateStore from '../stores/editor-state-store'
import ProjectModifyStore from '../stores/project-modify-store'

import Pane from './components/pane'
import LabelInput from './components/label-input'
import SelectList from './components/select-list'
import {Table, TableHeader, TableBodySelectList, Row, Col} from './components/table'
import {ContextMenu, MenuItem} from './electron/context-menu'
import ModalWindow from './electron/modal-window'

import NewCompositionWindow from './modal-windows/new-composition-window'
import SettingCompositionWindow from './modal-windows/setting-composition-window'

export default class AssetsView extends React.Component
{
    constructor()
    {
        super()

        this.state = {
            app: AppStore.getState(),
            project: EditorStateStore.getState(),
            newCompositionWindowOpened: false,
            settingCompositionWindowOpened: false,
            settingCompositionQuery: null,
            selectedItem: null,
        }

        AppStore.addListener(() => {
            this.setState({app: AppStore.getState()})
        })

        EditorStateStore.addListener(() => {
            this.setState({project: EditorStateStore.getState()})
        })

        ProjectModifyStore.addListener(() => {
            this.forceUpdate()
        })
    }

    addAsset = e => {
        console.log(e.dataTransfer, e.dataTransfer.files[0], e.dataTransfer.items[0]);

        _.each(e.dataTransfer.files, (file, idx) => {
            if (!e.dataTransfer.items[idx].webkitGetAsEntry().isFile) return

            ProjectModifyActions.addAsset({
                name: file.name,
                mimeType: file.type,
                path: file.path,
            })
        })
    }

    removeAsset = assetId => {
        ProjectModifyActions.removeAsset(assetId)
    }

    removeComposition = compositionId => {
        ProjectModifyActions.removeComposition(compositionId)
    }

    changeComposition = (compId, e) =>
    {
        EditorStateActions.changeActiveComposition(compId)
    }

    modifyCompName = (compId, newName) =>
    {
        ProjectModifyActions.modifyComposition(compId, {name: newName})
    }

    openCompositionSettingWindow = compId =>
    {
        const targetComposition = ProjectHelper.findCompositionById(this.state.project.project, compId)

        this.setState({
            settingCompositionQuery: {
                id: targetComposition.id,
                name: targetComposition.name,
                width: targetComposition.width,
                height: targetComposition.height,
                backgroundColor: targetComposition.backgroundColor.toString(),
                framerate: targetComposition.framerate,
                durationFrames: targetComposition.durationFrames,
                samplingRate: targetComposition.samplingRate,
                audioChannels: targetComposition.audioChannels,
            },
            settingCompositionWindowOpened: true,
        })
    }

    settingComoisition = (req: ?{
        id:string,
        name: string,
        width: string,
        height: string,
        backgroundColor: string,
        framerate: string,
        durationSeconds: string
    }) => {
        this.setState({
            settingCompositionQuery: null,
            settingCompositionWindowOpened: false,
        })

        if (! req) return
        const bgColor = parseColor(req.backgroundColor)
        req.backgroundColor = new ColorRGB(bgColor.rgb[0], bgColor.rgb[1], bgColor.rgb[2])
        ProjectModifyActions.modifyComposition(req.id, req)
    }

    openCompositionMakingWindow = () =>
    {
        this.setState({newCompositionWindowOpened: true})
    }

    makeNewComposition = (req: ?{
        name: string,
        width: string,
        height: string,
        framerate: string,
        durationSeconds: string,
        backgroundColor: string
    }) => {
        // `newCompositionWindowOpened` must be `false` before create Action.
        // this state is not synced to real window show/hide state.
        // if other state changing fired early to set `false`,
        // component updated and open modal window once again by current state.
        this.setState({newCompositionWindowOpened: false})

        if (req == null) return
        const bgColor = parseColor(req.backgroundColor)
        ProjectModifyActions.createComposition({
            name: req.name,
            width: req.width | 0,
            height: req.height | 0,
            framerate: req.framerate | 0,
            durationFrames: (req.framerate | 0) * parseInt(req.durationSeconds, 10),
            backgroundColor: new ColorRGB(bgColor.rgb[0], bgColor.rgb[1], bgColor.rgb[2]),
        })
    }

    render()
    {
        const {app, project: {project}} = this.state
        const assets = project ? Array.from(project.assets.values()) : []
        const compositions = project ? Array.from(project.compositions.values()) : []

        return (
            <Pane className='view-assets' allowFocus>
                <NewCompositionWindow
                    show={this.state.newCompositionWindowOpened}
                    width={400}
                    height={380}
                    onHide={this.makeNewComposition}
                    onResponse={this.makeNewComposition}
                />
                <SettingCompositionWindow
                    show={this.state.settingCompositionWindowOpened}
                    width={400}
                    height={380}
                    query={this.state.settingCompositionQuery}
                    onHide={this.settingComoisition}
                    onResponse={this.settingComoisition}
                />
                <Table className='asset-list' onDrop={this.addAsset}>
                    <TableHeader>
                        <Row>
                            <Col resizable={false} defaultWidth='2rem'></Col>
                            <Col defaultWidth='10rem'>名前</Col>
                            <Col defaultWidth='5rem'>種類</Col>
                        </Row>
                    </TableHeader>
                    <TableBodySelectList>
                        {assets.map(asset => (
                            <Row key={asset.id}>
                                <ContextMenu>
                                    <MenuItem type='separator' />
                                    <MenuItem label='名前を変更' onClick={() => { this.refs[`asset_name_input#${asset.id}`].enableAndFocus()}} />
                                    <MenuItem label='再読み込み' onClick={() => {}} />
                                    <MenuItem label='削除' onClick={this.removeAsset.bind(null, asset.id)}/>
                                    <MenuItem type='separator' />
                                </ContextMenu>

                                <Col></Col>
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
                <Table className='composition-list'>
                    <TableHeader>
                        <Row>
                            <Col resizable={false} defaultWidth='2rem'>⛰</Col>
                            <Col defaultWidth='10rem'>名前</Col>
                        </Row>
                    </TableHeader>
                    <TableBodySelectList onSelectionChanged={() => {}}>
                        <ContextMenu>
                            <MenuItem type='separator' />
                            <MenuItem label='新規コンポジション' onClick={this.openCompositionMakingWindow} />
                            <MenuItem type='separator' />
                        </ContextMenu>
                        {compositions.map(comp => (
                            <Row key={comp.id} onDoubleClick={this.changeComposition.bind(this, comp.id)}>
                                <ContextMenu>
                                    <MenuItem type='separator' />
                                    <MenuItem label='設定' onClick={this.openCompositionSettingWindow.bind(null, comp.id)}/>
                                    <MenuItem label='名前を変更' onClick={() => { this.refs[`comp_name_input#${comp.id}`].enableAndFocus()}} />
                                    <MenuItem label='削除' onClick={this.removeComposition.bind(null, comp.id)}/>
                                    <MenuItem type='separator' />
                                </ContextMenu>

                                <Col>🎬</Col>
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
            </Pane>
        )
    }
}
