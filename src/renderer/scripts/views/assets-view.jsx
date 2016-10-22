import _ from 'lodash'
import React, {PropTypes} from 'react'

import Actions from '../actions'
import AppStore from '../stores/app-store'
import ProjectStore from '../stores/project-store'

import Pane from './components/pane'

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
        Actions.changeActiveComposition(compId)
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
                        {assets.map(asset => (
                            <tr key={asset.id}>
                                {console.log(asset)}
                                <td></td>
                                <td><input type='text' defaultValue={asset.name} /></td>
                            </tr>
                        ))}
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
                                <td>🎬</td>
                                <td><input type='text' defaultValue={comp.name} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Pane>
        )
    }
}
