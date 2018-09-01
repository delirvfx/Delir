import { connectToStores, ContextProp, withComponentContext } from '@ragg/fleur-react'
import * as React from 'react'

import * as AppActions from '../../actions/App'
import {default as EditorStateStore, EditorState } from '../../stores/EditorStateStore'

import Pane from '../components/pane'
import Workspace from '../components/workspace'

import AppMenu from '../AppMenu'
import AssetsView from '../AssetsView'
import NavigationView from '../NavigationView'
import Notifications from '../Notifications'
import Preference from '../Preference'
import PreviewView from '../PreviewView/'
import StatusBar from '../StatusBar'
import Timeline from '../Timeline'

interface ConnectedProps {
    editor: EditorState
}

type Props = ConnectedProps & ContextProp

export default withComponentContext(connectToStores([EditorStateStore], (context) => ({
    editor: context.getStore(EditorStateStore).getState()
}))(class AppView extends React.PureComponent<Props> {
    public componentDidMount()
    {
        window.addEventListener('dragenter', this.prevent, false)
        window.addEventListener('dragover', this.prevent, false)
        window.addEventListener('keyup', this.handleShortCut)
        window.setInterval(this.projectAutoSaveTimer, 3 * 60 * 1000) // 3min
    }

    public handleShortCut = (e: KeyboardEvent) => {
        const { previewPlayed, activeComp, currentPreviewFrame } = this.props.editor

        if (document.activeElement && document.activeElement.matches('input:not(:disabled),textarea:not(:disabled),select:not(:disabled)')) return

        if (e.code === 'Space') {
            previewPlayed
                ? this.props.context.executeOperation(AppActions.stopPreview, {})
                : this.props.context.executeOperation(AppActions.startPreview, {
                    compositionId: activeComp!.id,
                    beginFrame: currentPreviewFrame
                 })
        }
    }

    public render()
    {
        const { preferenceOpened } = this.props.editor

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
                    <Timeline />
                </Workspace>
                <StatusBar />
                <Notifications />
                {preferenceOpened && <Preference onClose={this.handlePreferenceClose} />}
            </div>
        )
    }

    private prevent = (e: any) => {
        e.preventDefault()
    }

    private projectAutoSaveTimer = () => {
        this.props.context.executeOperation(AppActions.autoSaveProject, {})
    }

    private handlePreferenceClose = () => {
        this.props.context.executeOperation(AppActions.changePreferenceOpenState, { open: false })
    }
}))
