import _ from 'lodash'
import React, {PropTypes} from 'react'
import Delir from 'delir-core'
const {Helper: DelirHelper} = Delir

import EditorStateActions from '../actions/editor-state-actions'
import ProjectModifyActions from '../actions/project-modify-actions'

import AppStore from '../stores/app-store'
import EditorStateStore from '../stores/editor-state-store'
import ProjectModifyStore from '../stores/project-modify-store'

import Pane from './components/pane'
import LabelInput from './components/label-input'
import SelectList from './components/select-list'
import {Table, TableHeader, TableBodySelectList, Row, Col} from './components/table'
import {ContextMenu, MenuItem} from '../electron/context-menu'
import ModalWindow from '../electron/modal-window'

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
        const targetComposition = DelirHelper.findCompositionById(this.state.project.project, compId)

        this.setState({
            settingCompositionQuery: {
                id: targetComposition.id,
                name: targetComposition.name,
                width: targetComposition.width,
                height: targetComposition.height,
                framerate: targetComposition.framerate,
                durationFrame: targetComposition.durationFrame,
            },
            settingCompositionWindowOpened: true,
        })
    }

    settingComoisition = (req: {
        id:string,
        name: string,
        width: string,
        height: string,
        framerate: string,
        durationSeconds: string
    }) => {
        this.setState({
            settingCompositionQuery: null,
            settingCompositionWindowOpened: false,
        })

        ProjectModifyActions.modifyComposition(req.id, req)
    }

    makeNewComposition = (req: {name: string, width: string, height: string, framerate: string, durationSeconds: string}) =>
    {
        if (req == null) return

        // `newCompositionWindowOpened` must be `false` before create Action.
        // this state is not synced to real window show/hide state.
        // if other state changing fired early to set `false`,
        // component updated and open modal window once again by current state.
        this.setState({newCompositionWindowOpened: false})

        ProjectModifyActions.createComposition({
            name: req.name,
            width: req.width | 0,
            height: req.height | 0,
            framerate: req.framerate | 0,
            durationFrame: (req.framerate | 0) * parseInt(req.durationSeconds, 10)
        })
    }

    render()
    {
        console.log('hi');
        const {app, project: {project}} = this.state
        const assets = project ? Array.from(project.assets.values()) : []
        const compositions = project ? Array.from(project.compositions.values()) : []

        return (
            <Pane className='view-assets' allowFocus>
                <ModalWindow
                    show={this.state.newCompositionWindowOpened}
                    url='new-composition.html'
                    width={400}
                    height={300}
                    onHide={this.makeNewComposition}
                    onResponse={this.makeNewComposition}
                />
                <ModalWindow
                    show={this.state.settingCompositionWindowOpened}
                    url='setting-composition.html'
                    width={400}
                    height={300}
                    query={this.state.settingCompositionQuery}
                    onHide={this.makeNewComposition}
                    onResponse={this.settingComoisition}
                />
                <Table className='asset-list'>
                    <TableHeader>
                        <Row>
                            <Col resizable={false} defaultWidth='2rem'></Col>
                            <Col defaultWidth='10rem'>名前</Col>
                        </Row>
                    </TableHeader>
                    <TableBodySelectList>
                        {assets.map(asset => (
                            <Row key={asset.id}>
                                <ContextMenu>
                                    <MenuItem type='separator' />
                                    <MenuItem label='Rename' onClick={() => { this.refs[`asset_name_input#${asset.id}`].enableAndFocus()}} />
                                    <MenuItem label='Reload' onClick={() => {}} />
                                    <MenuItem label='Remove it' onClick={() => {}}/>
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
                            <MenuItem label='New Compositon' onClick={() => { this.setState({newCompositionWindowOpened: true}) }} />
                            <MenuItem type='separator' />
                        </ContextMenu>
                        {compositions.map(comp => (
                            <Row key={comp.id} onDoubleClick={this.changeComposition.bind(this, comp.id)}>
                                <ContextMenu>
                                    <MenuItem type='separator' />
                                    <MenuItem label='Rename' onClick={() => { this.refs[`comp_name_input#${comp.id}`].enableAndFocus()}} />
                                    <MenuItem label='Remove it' onClick={() => {}}/>
                                    <MenuItem label='Composition setting' onClick={this.openCompositionSettingWindow.bind(null, comp.id)}/>
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
