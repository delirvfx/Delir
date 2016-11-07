import React, {PropTypes} from 'react'
import cn from 'classnames'

import _ from 'lodash'

import Workspace from './components/workspace'
import Pane from './components/pane'

import AssetsView from './assets-view'
import PreviewView from './preview-view'
import TimelineView from './timeline-view'
import NavigationView from './navigation-view'
import StatusView from './status-view'

export default class AppView extends React.Component
{
    // static propTypes = {
    //     store: PropTypes.object.isRequired
    // }

    constructor()
    {
        super()
    }

    componentDidMount()
    {
        window.addEventListener('dragenter', this.prevent, false)
        window.addEventListener('dragover', this.prevent, false)
    }

    prevent = e => {
        e.preventDefault()
    }

    render()
    {
        return (
            <div className='_container' onDrop={this.prevent}>
                <NavigationView />
                <Workspace className='app-body' direction='vertical'>
                    <Pane className='body-pane'>
                        <Workspace direction='horizontal'>
                            <AssetsView />
                            <PreviewView />
                        </Workspace>
                    </Pane>
                    <TimelineView />
                </Workspace>
                <StatusView />
            </div>
        )
    }
}
