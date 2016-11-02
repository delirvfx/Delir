import _ from 'lodash'
import React, {PropTypes} from 'react'

import EditorStateActions from '../actions/editor-state-actions'
import ProjectModifyActions from '../actions/project-modify-actions'

import AppStore from '../stores/app-store'
import EditorStateStore from '../stores/editor-state-store'
import ProjectModifyStore from '../stores/project-modify-store'

import Pane from './components/pane'
import LabelInput from './components/label-input'
import SelectList from './components/select-list'
import {Table, TableHeader, TableBody, Row, Col} from './components/table'
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
            selectedItem: null
        }

        AppStore.addListener(() => {
            this.setState({app: AppStore.getState()})
        })

        EditorStateStore.addListener(() => {
            this.setState({project: EditorStateStore.getState()})
        })

        ProjectModifyStore.addListener(() => {
            this.setState({})
        })
    }

    changeComposition = (compId, e) =>
    {
        EditorStateActions.changeActiveComposition(compId)
    }

    modifyCompName = (compId, newName) =>
    {
        // console.log(compId, newName);
        ProjectModifyActions.changeCompositionName(compId, newName)
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
                <Table className='asset-list'>
                    <TableHeader>
                        <Row>
                            <Col></Col>
                            <Col>名前</Col>
                        </Row>
                    </TableHeader>
                    <TableBody>
                        <SelectList>
                        {assets.map(asset => (
                            <tr key={asset.id}>
                                <ContextMenu>
                                    <MenuItem type='separator' />
                                    <MenuItem label='Rename' onClick={() => { this.refs[`asset_name_input#${asset.id}`].enableAndFocus()}} />
                                    <MenuItem label='Reload' onClick={() => {}} />
                                    <MenuItem label='Remove it' onClick={() => {}}/>
                                    <MenuItem type='separator' />
                                </ContextMenu>

                                <td></td>
                                <td>
                                    <LabelInput
                                        ref={`asset_name_input#${asset.id}`}
                                        defaultValue={asset.name}
                                        placeholder='Unnamed Asset'
                                    />
                                </td>
                            </tr>
                        ))}
                        </SelectList>
                    </TableBody>
                </Table>
                <table className='composition-list'>
                    <thead>
                        <tr>
                            <th>⛰</th>
                            <th>名前</th>
                        </tr>
                    </thead>
                    <tbody>
                        <ContextMenu>
                            <MenuItem type='separator' />
                            <MenuItem label='New Compositon' onClick={() => { this.setState({newCompositionWindowOpened: true})}} />
                            <MenuItem type='separator' />
                        </ContextMenu>
                        {compositions.map(comp => (
                            <tr key={comp.id} onDoubleClick={this.changeComposition.bind(this, comp.id)}>
                                <ContextMenu>
                                    <MenuItem type='separator' />
                                    <MenuItem label='Rename' onClick={() => { this.refs[`comp_name_input#${comp.id}`].enableAndFocus()}} />
                                    <MenuItem label='Remove it' onClick={() => {}}/>
                                    <MenuItem label='Composition setting' onClick={() => {}}/>
                                    <MenuItem type='separator' />
                                </ContextMenu>

                                <td>🎬</td>
                                <td>
                                    <LabelInput
                                        ref={`comp_name_input#${comp.id}`}
                                        defaultValue={comp.name}
                                        placeholder='Unnamed Coposition'
                                        onChange={this.modifyCompName.bind(this, comp.id)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Pane>
        )
    }
}
