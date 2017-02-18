import * as React from 'react'

import Workspace from '../components/workspace'
import Pane from '../components/pane'

import AssetsView from '../AssetsView'
import PreviewView from '../preview-view'
import TimelaneView from '../TimelaneView'
import NavigationView from '../navigation-view'
import StatusView from '../status-view'
import Notifications from '../Notifications'

// import style from './style.styl'

export default class AppView extends React.Component<null, null>
{
    componentDidMount()
    {
        window.addEventListener('dragenter', this.prevent, false)
        window.addEventListener('dragover', this.prevent, false)
    }

    prevent = (e: any) => {
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
                    <TimelaneView />
                </Workspace>
                <StatusView />
                <Notifications />
            </div>
        )
    }
}
