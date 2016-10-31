import _ from 'lodash'
import React, {PropTypes} from 'react'

import EditorStateActions from '../actions/editor-state-actions'
import ProjectModifyActions from '../actions/project-modify-actions'

import AppStore from '../stores/app-store'
import ProjectStore from '../stores/project-store'

import Pane from './components/pane'
import LabelInput from './components/label-input'
import SelectList from './components/select-list'
import {ContextMenu, MenuItem} from '../electron/context-menu'

export default class AssetsView extends React.Component
{
    constructor()
    {
        super()

        this.state = {
            app: AppStore.getState(),
            project: ProjectStore.getState(),
            selectedItem: null
        }

        AppStore.addListener(() => {
            this.setState({app: AppStore.getState()})
        })

        ProjectStore.addListener(() => {
            this.setState({project: ProjectStore.getState()})
        })
    }

    changeComposition(compId, e)
    {
        EditorStateActions.changeActiveComposition(compId)
    }

    modifyCompName(compId, newName)
    {
        // console.log(compId, newName);
        ProjectModifyActions.modifyCompositionName(compId, newName)
    }

    render()
    {
        const {app, project: {project}} = this.state
        const assets = Array.from(project.assets.values())
        const compositions = Array.from(project.compositions.values())

        return (
            <Pane className='view-assets' allowFocus>
                <table className='asset-list'>
                    <thead>
                        <tr>
                            <th></th>
                            <th>名前</th>
                        </tr>
                    </thead>
                    <tbody>
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
                    </tbody>
                </table>
                <table className='composition-list'>
                    <thead>
                        <tr>
                            <th>⛰</th>
                            <th>名前</th>
                        </tr>
                    </thead>
                    <tbody>
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
