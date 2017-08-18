import * as React from 'react'

import connectToStores from '../../utils/Flux/connectToStores'
import {default as EditorStateStore, EditorState} from '../../stores/EditorStateStore'
import AppActions from '../../actions/App'

import Workspace from '../components/workspace'
import Pane from '../components/pane'

import AppMenu from '../AppMenu'
import AssetsView from '../AssetsView'
import PreviewView from '../PreviewView/'
import TimelineView from '../TimelineView'
import NavigationView from '../NavigationView'
import StatusBar from '../StatusBar'
import Notifications from '../Notifications'

interface Props {
    editor: EditorState
}

@connectToStores([EditorStateStore], () => ({
    editor: EditorStateStore.getState()
}))
export default class AppView extends React.PureComponent<Props>
{
    public componentDidMount()
    {
        window.addEventListener('dragenter', this.prevent, false)
        window.addEventListener('dragover', this.prevent, false)
        window.addEventListener('keyup', this.handleShortCut)
    }

    private prevent = (e: any) => {
        e.preventDefault()
    }

    public handleShortCut = (e: KeyboardEvent) => {
        const { previewPlayed, activeComp, currentPreviewFrame } = this.props.editor

        if (document.activeElement && document.activeElement.matches('input:not(:disabled),textarea:not(:disabled),select:not(:disabled)')) return

        if (e.code === 'Space') {
            previewPlayed
                ? AppActions.stopPreview()
                : AppActions.startPreview(activeComp!.id, currentPreviewFrame)
        }
    }

    public render()
    {
        return (
            <div className='_container' onDrop={this.prevent}>
                <AppMenu />
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
                <StatusBar />
                <Notifications />
            </div>
        )
    }
}
