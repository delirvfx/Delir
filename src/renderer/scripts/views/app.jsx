import React, {PropTypes} from 'react'
import cn from 'classnames'

import _ from 'lodash'

import Workspace from './components/workspace'
import Pane from './components/pane'

import AssetsView from './assets-view'
import PreviewView from './preview-view'
import TimelineView from './timeline-view'
import NavigationView from './navigation-view'


export default class AppView extends React.Component
{
    // static propTypes = {
    //     store: PropTypes.object.isRequired
    // }

    constructor()
    {
        super()
    }

    render()
    {
        return (
            <div className='_container'>
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
            </div>
        )
    }
}
